package com.zooniversemobile;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.firebase.messaging.FirebaseMessaging;

/**
 * Created by rschaaf on 11/4/16.
 */


public class NotificationSettings extends ReactContextBaseJavaModule {

    public NotificationSettings(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "NotificationSettings";
    }

    @ReactMethod
    public void setInterestSubscription(String interest, Boolean subscribed, Promise promise) {
        FirebaseMessaging messagingInstance = FirebaseMessaging.getInstance();

        if (subscribed) {
            messagingInstance.subscribeToTopic(interest);
        } else {
            messagingInstance.unsubscribeFromTopic(interest);
        }

        promise.resolve("Subscription update successful");
    }

}
