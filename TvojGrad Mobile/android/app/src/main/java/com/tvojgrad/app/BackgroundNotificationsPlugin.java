package com.tvojgrad.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BackgroundNotifications")
public class BackgroundNotificationsPlugin extends Plugin {
    private static final String EXTRA_TYPE = "notificationType";
    private static final String EXTRA_CHAT_ID = "cetId";
    private static final String EXTRA_REQUEST_ID = "requestId";

    private JSObject notificationAction(Intent intent, boolean clear) {
        if (intent == null) return null;
        String type = intent.getStringExtra(EXTRA_TYPE);
        if (type == null || type.trim().isEmpty()) return null;

        JSObject action = new JSObject();
        action.put("type", type);
        String cetId = intent.getStringExtra(EXTRA_CHAT_ID);
        String requestId = intent.getStringExtra(EXTRA_REQUEST_ID);
        if (cetId != null && !cetId.trim().isEmpty()) action.put("cetId", cetId);
        if (requestId != null && !requestId.trim().isEmpty()) action.put("requestId", requestId);

        if (clear) {
            intent.removeExtra(EXTRA_TYPE);
            intent.removeExtra(EXTRA_CHAT_ID);
            intent.removeExtra(EXTRA_REQUEST_ID);
        }
        return action;
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        JSObject action = notificationAction(intent, false);
        if (action != null) notifyListeners("notificationActionPerformed", action, true);
    }

    @PluginMethod
    public void consumeNotificationAction(PluginCall call) {
        JSObject action = notificationAction(getActivity().getIntent(), true);
        call.resolve(action == null ? new JSObject() : action);
    }

    @PluginMethod
    public void start(PluginCall call) {
        String userId = call.getString("userId", "");
        String apiBaseUrl = call.getString("apiBaseUrl", "");
        if (userId == null || userId.trim().isEmpty() || apiBaseUrl == null || apiBaseUrl.trim().isEmpty()) {
            call.reject("Nedostaje korisnik ili backend URL");
            return;
        }

        Context context = getContext();
        Intent intent = new Intent(context, TvojGradNotificationService.class);
        intent.setAction(TvojGradNotificationService.ACTION_START);
        intent.putExtra(TvojGradNotificationService.EXTRA_USER_ID, userId.trim());
        intent.putExtra(TvojGradNotificationService.EXTRA_API_BASE_URL, apiBaseUrl.trim());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ContextCompat.startForegroundService(context, intent);
        } else {
            context.startService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, TvojGradNotificationService.class);
        intent.setAction(TvojGradNotificationService.ACTION_STOP);
        context.startService(intent);
        call.resolve();
    }
}
