package com.zooniversemobile;

import com.pusher.android.notifications.PushNotificationRegistration;

/**
 * Created by rschaaf on 11/4/16.
 */
public class PusherProperty {
    private static PusherProperty mInstance= null;

    public PushNotificationRegistration nativePusher;

    protected PusherProperty(){}

    public static synchronized PusherProperty getInstance(){
        if(null == mInstance){
            mInstance = new PusherProperty();
        }
        return mInstance;
    }
}
