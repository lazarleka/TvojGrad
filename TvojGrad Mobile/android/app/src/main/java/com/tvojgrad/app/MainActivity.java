package com.tvojgrad.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(NativeLocationPlugin.class);
        registerPlugin(BackgroundNotificationsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
