package com.tvojgrad.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BackgroundNotifications")
public class BackgroundNotificationsPlugin extends Plugin {
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
