package com.tvojgrad.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class TvojGradNotificationService extends Service {
    public static final String ACTION_START = "com.tvojgrad.app.notifications.START";
    public static final String ACTION_STOP = "com.tvojgrad.app.notifications.STOP";
    public static final String EXTRA_USER_ID = "userId";
    public static final String EXTRA_API_BASE_URL = "apiBaseUrl";

    private static final String TAG = "TvojGradNotify";
    private static final String PREFS = "tvojgrad_background_notifications";
    private static final String CHANNEL_CHAT = "chat";
    private static final String CHANNEL_REQUESTS = "requests";
    private static final String CHANNEL_SERVICE = "background";
    private static final int SERVICE_NOTIFICATION_ID = 41001;
    private static final long POLL_SECONDS = 7L;

    private final ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();
    private ScheduledFuture<?> pollTask;
    private String userId;
    private String apiBaseUrl;
    private SharedPreferences prefs;

    @Override
    public void onCreate() {
        super.onCreate();
        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        createChannels();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopPolling();
            stopSelf();
            return START_NOT_STICKY;
        }

        if (intent != null && ACTION_START.equals(intent.getAction())) {
            userId = intent.getStringExtra(EXTRA_USER_ID);
            apiBaseUrl = trimTrailingSlash(intent.getStringExtra(EXTRA_API_BASE_URL));
            if (isBlank(userId) || isBlank(apiBaseUrl)) {
                stopSelf();
                return START_NOT_STICKY;
            }

            Log.i(TAG, "Starting background notifications for user " + userId + " at " + apiBaseUrl);
            startForeground(SERVICE_NOTIFICATION_ID, serviceNotification());
            startPolling();
            return START_STICKY;
        }

        if (!isBlank(userId) && !isBlank(apiBaseUrl)) {
            startPolling();
            return START_STICKY;
        }
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        stopPolling();
        executor.shutdownNow();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void startPolling() {
        if (pollTask != null && !pollTask.isCancelled()) return;
        pollTask = executor.scheduleWithFixedDelay(this::safePoll, 0L, POLL_SECONDS, TimeUnit.SECONDS);
    }

    private void stopPolling() {
        if (pollTask != null) {
            pollTask.cancel(true);
            pollTask = null;
        }
    }

    private void safePoll() {
        try {
            Log.i(TAG, "Polling backend for user " + userId);
            pollMessages();
            pollRequests();
        } catch (Exception error) {
            Log.w(TAG, "Background poll failed", error);
        }
    }

    private void pollMessages() throws Exception {
        JSONArray cets = getArray(apiBaseUrl + "/cetovi/korisnik/" + userId);
        for (int i = 0; i < cets.length(); i++) {
            JSONObject cet = cets.optJSONObject(i);
            if (cet == null) continue;
            String cetId = stringValue(cet, "ID", "id");
            if (isBlank(cetId)) continue;

            JSONArray messages = getArray(apiBaseUrl + "/poruke-ceta/cet/" + cetId);
            JSONObject latestOther = null;
            long latestOtherId = 0L;
            long latestAnyId = 0L;
            for (int j = 0; j < messages.length(); j++) {
                JSONObject message = messages.optJSONObject(j);
                if (message == null) continue;
                long messageId = longValue(message, "ID", "id");
                latestAnyId = Math.max(latestAnyId, messageId);
                String senderId = stringValue(message, "Posiljalac_ID", "posiljalacID", "posiljalacId");
                if (!userId.equals(senderId) && messageId >= latestOtherId) {
                    latestOtherId = messageId;
                    latestOther = message;
                }
            }

            String prefKey = "latest_msg_" + userId + "_" + cetId;
            long known = prefs.getLong(prefKey, 0L);
            if (known == 0L) {
                prefs.edit().putLong(prefKey, Math.max(latestAnyId, latestOtherId)).apply();
            } else if (latestOther != null && latestOtherId > known) {
                prefs.edit().putLong(prefKey, latestOtherId).apply();
                showNotification(CHANNEL_CHAT, notificationId("chat:" + cetId + ":" + latestOtherId),
                    senderName(latestOther), textValue(latestOther, "Tekst", "tekst", "Imate novu poruku"),
                    "chat", cetId, null);
            }
        }
    }

    private void pollRequests() throws Exception {
        JSONArray requests = getArray(apiBaseUrl + "/zahtevi");
        Set<String> seen = new HashSet<>(prefs.getStringSet("seen_requests_" + userId, new HashSet<>()));
        Set<String> nextSeen = new HashSet<>(seen);
        boolean initialized = prefs.getBoolean("seen_requests_initialized_" + userId, false);
        boolean changed = false;

        for (int i = 0; i < requests.length(); i++) {
            JSONObject request = requests.optJSONObject(i);
            if (request == null) continue;
            String requestId = stringValue(request, "ID", "id");
            String senderId = userIdFromObject(request.opt("PosloZahtev"), request.opt("posloZahtev"));
            String receiverId = stringValue(request, "PrimioZahtev", "primioZahtev");
            String status = textValue(request, "status", "Status", "");
            String statusKey = normalize(status);
            String key = (isBlank(requestId) ? senderId + ":" + receiverId : requestId) + ":" + statusKey;
            if (nextSeen.add(key)) changed = true;

            if (!initialized || seen.contains(key)) continue;

            if (userId.equals(receiverId) && isPending(statusKey)) {
                showNotification(CHANNEL_REQUESTS, notificationId("request:received:" + key),
                    "Novi zahtjev", senderNameFromRequest(request) + " vam je poslao/la zahtjev.",
                    "psm-request", null, requestId);
            } else if (userId.equals(senderId) && isAccepted(statusKey)) {
                showNotification(CHANNEL_REQUESTS, notificationId("request:accepted:" + key),
                    "Zahtjev prihvacen", receiverNameFromRequest(request) + " je prihvatio/la vas zahtjev.",
                    "psm-request", null, requestId);
            } else if (userId.equals(senderId) && isRejected(statusKey)) {
                showNotification(CHANNEL_REQUESTS, notificationId("request:rejected:" + key),
                    "Zahtjev odbijen", receiverNameFromRequest(request) + " je odbio/la vas zahtjev.",
                    "psm-request", null, requestId);
            }
        }

        if (changed) {
            prefs.edit()
                .putStringSet("seen_requests_" + userId, nextSeen)
                .putBoolean("seen_requests_initialized_" + userId, true)
                .apply();
        } else if (!initialized) {
            prefs.edit().putBoolean("seen_requests_initialized_" + userId, true).apply();
        }
    }

    private JSONArray getArray(String url) throws Exception {
        String body = httpGet(url);
        return new JSONArray(body);
    }

    private String httpGet(String urlText) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(urlText).openConnection();
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);
        connection.setRequestMethod("GET");
        int code = connection.getResponseCode();
        InputStream stream = code >= 200 && code < 300 ? connection.getInputStream() : connection.getErrorStream();
        String body = readAll(stream);
        connection.disconnect();
        if (code < 200 || code >= 300) throw new IllegalStateException("HTTP " + code + " " + urlText);
        return body;
    }

    private String readAll(InputStream stream) throws Exception {
        if (stream == null) return "";
        BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8));
        StringBuilder builder = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) builder.append(line);
        return builder.toString();
    }

    private void showNotification(String channelId, int id, String title, String body, String type, String cetId, String requestId) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            Log.w(TAG, "Notification permission is not granted");
            return;
        }

        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        intent.putExtra("notificationType", type);
        if (!isBlank(cetId)) intent.putExtra("cetId", cetId);
        if (!isBlank(requestId)) intent.putExtra("requestId", requestId);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pendingIntent = PendingIntent.getActivity(this, id, intent, flags);

        Notification notification = new NotificationCompat.Builder(this, channelId)
            .setSmallIcon(getApplicationInfo().icon)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build();

        NotificationManagerCompat.from(this).notify(id, notification);
        Log.i(TAG, "Posted notification " + id + " " + title);
    }

    private Notification serviceNotification() {
        Intent intent = new Intent(this, MainActivity.class);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pendingIntent = PendingIntent.getActivity(this, SERVICE_NOTIFICATION_ID, intent, flags);
        return new NotificationCompat.Builder(this, CHANNEL_SERVICE)
            .setSmallIcon(getApplicationInfo().icon)
            .setContentTitle("TvojGrad")
            .setContentText("Obavjestenja za poruke su ukljucena")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build();
    }

    private void createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;
        manager.createNotificationChannel(new NotificationChannel(CHANNEL_CHAT, "Chat poruke", NotificationManager.IMPORTANCE_HIGH));
        manager.createNotificationChannel(new NotificationChannel(CHANNEL_REQUESTS, "Zahtjevi", NotificationManager.IMPORTANCE_HIGH));
        manager.createNotificationChannel(new NotificationChannel(CHANNEL_SERVICE, "Pozadinska provjera", NotificationManager.IMPORTANCE_LOW));
    }

    private String senderName(JSONObject message) {
        JSONObject sender = message.optJSONObject("Posiljalac");
        if (sender == null) sender = message.optJSONObject("posiljalac");
        return nameFromUser(sender, "Nova poruka");
    }

    private String senderNameFromRequest(JSONObject request) {
        JSONObject sender = request.optJSONObject("PosloZahtev");
        if (sender == null) sender = request.optJSONObject("posloZahtev");
        return nameFromUser(sender, "Korisnik");
    }

    private String receiverNameFromRequest(JSONObject request) {
        JSONObject receiver = request.optJSONObject("PrimioZahtevKorisnik");
        if (receiver == null) receiver = request.optJSONObject("primioZahtevKorisnik");
        return nameFromUser(receiver, "Korisnik");
    }

    private String nameFromUser(JSONObject user, String fallback) {
        if (user == null) return fallback;
        String fullName = (textValue(user, "Ime", "ime", "") + " " + textValue(user, "Prezime", "prezime", "")).trim();
        if (!isBlank(fullName)) return fullName;
        return textValue(user, "Email", "email", fallback);
    }

    private String userIdFromObject(Object upper, Object lower) {
        Object value = upper != null ? upper : lower;
        if (value instanceof JSONObject) {
            return stringValue((JSONObject) value, "ID", "id");
        }
        return value == null ? "" : String.valueOf(value);
    }

    private boolean isPending(String status) {
        return status.contains("cek") || status.contains("pending") || status.contains("cekanju");
    }

    private boolean isAccepted(String status) {
        return status.contains("prihvac") || status.contains("prihva") || status.contains("accept");
    }

    private boolean isRejected(String status) {
        return status.contains("odbij") || status.contains("reject");
    }

    private String normalize(String value) {
        return String.valueOf(value == null ? "" : value).trim().toLowerCase();
    }

    private String trimTrailingSlash(String value) {
        if (value == null) return "";
        return value.replaceAll("/+$", "");
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private long longValue(JSONObject object, String... keys) {
        for (String key : keys) {
            if (object.has(key)) return object.optLong(key, 0L);
        }
        return 0L;
    }

    private String stringValue(JSONObject object, String... keys) {
        for (String key : keys) {
            if (object.has(key) && !object.isNull(key)) return String.valueOf(object.opt(key));
        }
        return "";
    }

    private String textValue(JSONObject object, String key1, String key2, String fallback) {
        String first = object.optString(key1, "");
        if (!isBlank(first)) return first;
        String second = object.optString(key2, "");
        return isBlank(second) ? fallback : second;
    }

    private int notificationId(String key) {
        return Math.abs(key.hashCode());
    }
}
