package com.zooniversemobile;

import android.graphics.BitmapFactory;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.Map;
import java.util.HashMap;

/**
 * Created by nmalmed on 6/5/18.
 */

public class ImageSizer extends ReactContextBaseJavaModule {

    @Override
    public String getName() {
        return "ImageSizer";
    }

    public ImageSizer(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    public void getImageDimensions(String imagePath, Promise promise) {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;

        BitmapFactory.decodeFile(imagePath, options);
        int width = options.outWidth;
        int height = options.outHeight;

        if (width < 0 || height < 0) {
            promise.reject("1", "Could not find image at path: " + imagePath);
            return;
        }

        WritableMap dimensions = new WritableNativeMap();
        dimensions.putInt("width", width);
        dimensions.putInt("height", height);

        promise.resolve(dimensions);
    }


}
