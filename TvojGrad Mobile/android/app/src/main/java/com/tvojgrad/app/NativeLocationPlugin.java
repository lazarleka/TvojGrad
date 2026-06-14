package com.tvojgrad.app;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(
    name = "NativeLocation",
    permissions = {
        @Permission(strings = { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION }, alias = "location")
    }
)
public class NativeLocationPlugin extends Plugin {
    private static final long LOCATION_TIMEOUT_MS = 15000L;
    private PluginCall pendingCall;

    @PluginMethod
    public void getCurrentPosition(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            pendingCall = call;
            requestPermissionForAlias("location", call, "locationPermsCallback");
            return;
        }

        resolveLocation(call);
    }

    @PermissionCallback
    private void locationPermsCallback(PluginCall call) {
        PluginCall targetCall = call != null ? call : pendingCall;
        pendingCall = null;
        if (getPermissionState("location") != PermissionState.GRANTED) {
            if (targetCall != null) targetCall.reject("Dozvola za lokaciju nije odobrena");
            return;
        }
        if (targetCall != null) resolveLocation(targetCall);
    }

    private void resolveLocation(PluginCall call) {
        LocationManager manager = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
        if (manager == null) {
            call.reject("Lokacija nije dostupna");
            return;
        }

        if (!hasLocationPermission()) {
            call.reject("Dozvola za lokaciju nije odobrena");
            return;
        }

        boolean gpsEnabled = manager.isProviderEnabled(LocationManager.GPS_PROVIDER);
        boolean networkEnabled = manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
        if (!gpsEnabled && !networkEnabled) {
            call.reject("Ukljucite lokaciju na telefonu i pokusajte ponovo");
            return;
        }

        Location last = bestLastKnownLocation(manager);
        if (last != null) {
            resolve(call, last);
            return;
        }

        Handler handler = new Handler(Looper.getMainLooper());
        AtomicBoolean finished = new AtomicBoolean(false);
        LocationListener listener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (!finished.compareAndSet(false, true)) return;
                manager.removeUpdates(this);
                resolve(call, location);
            }

            @Override public void onProviderEnabled(String provider) {}
            @Override public void onProviderDisabled(String provider) {}
            @Override public void onStatusChanged(String provider, int status, Bundle extras) {}
        };

        try {
            String provider = gpsEnabled
                ? LocationManager.GPS_PROVIDER
                : LocationManager.NETWORK_PROVIDER;
            manager.requestSingleUpdate(provider, listener, null);
            handler.postDelayed(() -> {
                if (!finished.compareAndSet(false, true)) return;
                try {
                    manager.removeUpdates(listener);
                } catch (Exception ignored) {
                    // Listener may already be removed.
                }
                call.reject("Trenutna lokacija nije dostupna. Pokusajte ponovo ili unesite adresu rucno.");
            }, LOCATION_TIMEOUT_MS);
        } catch (Exception error) {
            call.reject("Trenutna lokacija nije dostupna");
        }
    }

    private boolean hasLocationPermission() {
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    private Location bestLastKnownLocation(LocationManager manager) {
        Location best = null;
        for (String provider : manager.getProviders(true)) {
            try {
                Location location = manager.getLastKnownLocation(provider);
                if (location == null) continue;
                if (best == null || location.getAccuracy() < best.getAccuracy()) {
                    best = location;
                }
            } catch (Exception ignored) {
                // Provider can disappear while iterating.
            }
        }
        return best;
    }

    private void resolve(PluginCall call, Location location) {
        JSObject coords = new JSObject();
        coords.put("latitude", location.getLatitude());
        coords.put("longitude", location.getLongitude());
        coords.put("accuracy", location.getAccuracy());

        JSObject result = new JSObject();
        result.put("coords", coords);
        result.put("timestamp", location.getTime());
        call.resolve(result);
    }
}
