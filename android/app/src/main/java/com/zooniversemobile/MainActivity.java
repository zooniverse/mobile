package com.zooniversemobile;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import com.facebook.react.ReactActivity;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.firebase.messaging.RemoteMessage;
import com.pusher.android.PusherAndroid;
import com.pusher.android.notifications.fcm.FCMPushNotificationReceivedListener;
import com.pusher.android.notifications.tokens.PushNotificationRegistrationListener;

public class MainActivity extends ReactActivity {
    private static final int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;
    private static MainActivity mainActivity;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ZooniverseMobile";
    }
    public MainActivity getInstance() { return mainActivity; }
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
            PusherProperty.getInstance().nativePusher = pusher.nativePusher();

            try {
                PusherProperty.getInstance().nativePusher.registerFCM(this, new PushNotificationRegistrationListener() {
                    @Override
                    public void onSuccessfulRegistration() {
                        PusherProperty.getInstance().nativePusher.subscribe("general");
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

            PusherProperty.getInstance().nativePusher.setFCMListener(new FCMPushNotificationReceivedListener() {
                @Override
                public void onMessageReceived(RemoteMessage remoteMessage) {
                String projectID = String.valueOf(remoteMessage.getData().get("project_id"));
                if (remoteMessage.getNotification() != null) {
                    sendNotification(
                            remoteMessage.getNotification().getTitle(),
                            remoteMessage.getNotification().getBody(),
                            projectID
                    );
                }
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

    private void sendNotification(String messageTitle, String messageBody, String projectID) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        notificationIntent.putExtra("title", messageTitle);
        notificationIntent.putExtra("body", messageBody);
        notificationIntent.putExtra("project_id", projectID);
        notificationIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, notificationIntent,
                PendingIntent.FLAG_ONE_SHOT);

        Uri defaultSoundUri= RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(messageTitle)
                .setContentText(messageBody)
                .setDefaults(Notification.DEFAULT_SOUND)
                .setLights(0xff00979D, 1000, 1000)
                .setAutoCancel(true)
                .setColor(0xff00979D)
                .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        notificationManager.notify(0 /* ID of notification */, notificationBuilder.build());
    }
}
