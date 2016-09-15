package com.zooniversemobile;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.firebase.messaging.RemoteMessage;
import com.pusher.android.PusherAndroid;
import com.pusher.android.notifications.PushNotificationRegistration;
import com.pusher.android.notifications.fcm.FCMPushNotificationReceivedListener;
import com.pusher.android.notifications.tokens.PushNotificationRegistrationListener;

public class MainActivity extends ReactActivity {
    private static final int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ZooniverseMobile";
    }
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (playServicesAvailable()) {
            PusherAndroid pusher = new PusherAndroid(BuildConfig.PUSHER_API_KEY);
            final PushNotificationRegistration nativePusher = pusher.nativePusher();

            try {
                nativePusher.registerFCM(this, new PushNotificationRegistrationListener() {
                    @Override
                    public void onSuccessfulRegistration() {
                        nativePusher.subscribe("general");
                    }

                    @Override
                    public void onFailedRegistration(int statusCode, String response) {
                        System.out.println(
                                "Registration failed with code " + statusCode +
                                        " " + response
                        );
                    }
                });

            } catch (Exception e) {
                e.printStackTrace();
            }

            nativePusher.setFCMListener(new FCMPushNotificationReceivedListener() {
                @Override
                public void onMessageReceived(RemoteMessage remoteMessage) {
                    //https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/RemoteMessage.Notification
                    String title = remoteMessage.getNotification().getTitle();
                    System.out.println("Title: " + title);

                    //TODO: Use react native alert to display cross-platform alert here

                }
            });

        }
    }

    private boolean playServicesAvailable() {
        GoogleApiAvailability apiAvailability = GoogleApiAvailability.getInstance();
        int resultCode = apiAvailability.isGooglePlayServicesAvailable(this);
        if (resultCode != ConnectionResult.SUCCESS) {
            if (apiAvailability.isUserResolvableError(resultCode)) {
                apiAvailability.getErrorDialog(this, resultCode, PLAY_SERVICES_RESOLUTION_REQUEST)
                        .show();
            } else {
                finish();
            }
            return false;
        }
        return true;
    }



}
