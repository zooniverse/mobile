More detailed information on the [wiki](https://github.com/zooniverse/mobile/wiki). In particular, check out our [contributor guidelines](https://github.com/zooniverse/mobile/wiki/Contributor-Guidelines)!

# Zooniverse Mobile App
The Zooniverse Mobile app is a [React Native](https://facebook.github.io/react-native/) app that allows folks like you and me to contribute to astronomy, ecology, and anthropology research from their couch, bathtub, or bus stop (but don't swipe and drive, please).

### Preparing The React Native Framework
#### Requirements:
 - Node 24.18.0 (use `nvm use` to load the version in `.nvmrc`)
 - Ruby 4.0.6, Bundler 4.0.15, and CocoaPods 1.17.0 (Ruby is pinned in `.ruby-version`)
#### Steps:
1. Follow the instructions for Android and iOS setup in [this guide](https://reactnative.dev/docs/environment-setup).
2. Clone down this repo and navigate to its directory (called `mobile`).
3. Copy or create the local files that are not checked into Git:
   - `local.properties` goes in `android/local.properties`. It contains the local Android SDK path and is excluded because that path is specific to each developer's machine.
   - `key.properties` goes in `android/app/key.properties`. It contains the release keystore filename, key alias, and signing passwords and is excluded because it contains credentials.
   - `my-upload-key.keystore` goes in `android/app/my-upload-key.keystore`. It contains the private Android upload signing key and is excluded because committing it would expose a sensitive release credential.
4. Run `npm ci`.
5. Run `npm start`.
#### Troubleshooting:
- [Troubleshooting wiki](https://github.com/zooniverse/mobile/wiki/Troubleshooting) for additional help
- `react-native-blob-util` is pinned to `0.24.9` because `0.24.10` interrupts Android file downloads, preventing drawing subjects from loading. Do not upgrade it until the upstream Android regression is fixed.

### Push Notification Troubleshooting
- When using Firebase Console "Test on device", confirm the FCM token has no leading or trailing spaces.
- In Firebase Console -> Project settings -> Cloud Messaging, confirm the iOS APNs Key ID and Team ID match the current Apple Developer account.
- Direct APNs delivery can work while Firebase Cloud Messaging still fails; use FCM v1 REST/API sends to get the real Firebase/APNs error.
- Android debug uses the dev Firebase project, Android release uses production, and iOS uses the bundled `ios/GoogleService-Info.plist`.

### iOS
#### Requirements:
 - XCode
 - An iPhone X Simulator, which you can run from XCode.
 - To run on an iOS device see [Running on device - iOS]https://reactnative.dev/docs/running-on-device?platform=ios
#### Steps:
On the command line, from the `mobile` directory, run:
1. Run `bundle install`, then `cd ios && bundle exec pod install && cd ..`.
2. `npm run ios`

### Android
#### Requirements:
 - Android Studio
 - The following local files are intentionally excluded from Git and must be created or obtained before building:
    * `android/local.properties` identifies the local Android SDK path. Android Studio normally creates it; otherwise add `sdk.dir=/absolute/path/to/Android/sdk`.
    * `android/app/key.properties` contains the release keystore path and credentials. Obtain it and the referenced keystore securely from an existing maintainer. The current Gradle configuration reads this file during debug and release builds.
 - You'll need at least one emulator.  To get one:
    *  Within Android Studio, open the "AVD Manager" -  in the toolbar click the icon with the purple device and small android (fourth from the right)
    *  Click 'Create Virtual Device' - bottom left-hand corner
    *  Create at least one using the latest Android Release.  I have a few different size and Android Release configurations
 - You can also use an Android device that is plugged into your computer. Run `adb devices` and confirm you see your device listed. If not use [Running on device - android]https://reactnative.dev/docs/running-on-device?platform=android for troubleshooting
 - Also you'll need a Gradle properties file outside the project for keeping secrets that aren't checked into source control. This should be in ~/.gradle/gradle.properties and contain the following:
```
MYAPP_RELEASE_STORE_FILE=/path/to/your/keystore.jks
MYAPP_RELEASE_KEY_ALIAS=android
MYAPP_RELEASE_STORE_PASSWORD=android
MYAPP_RELEASE_KEY_PASSWORD=**you can find this in passbolt**
```

You will have to get the key _itself_ from an existing maintainer. We are looking for a way to securely store this so you can get it without worrying about corruption. You don't need it to build for debugging—only for release to the Play Store.
#### Steps:
1. To run in the emulator from the command line (you'll need device connected or emulator already running): `npm run android`. Shortly, your emulator should boot with the Zooniverse app on it.
    - You need to have either a device emulator open already or a physical device plugged into your computer. Otherwise, you'll need to run through Android Studio
    - If Android studio prompts you to update Gradle files, you should do it.
    - The command `react-native run-android` will install the build, but fail in launching the app due to a bug with the `react-native` script with having a separate `applicationId` for development builds.

## If you Work for The Zooniverse

You may also want to set up error reporting from your local copy of the application to our reporting service, Sentry. [Here are instructions on how to do that!](https://github.com/zooniverse/mobile/wiki/Enabling-Sentry-for-your-Local-Builds)

### Tools:
This project is setup with Reactotron. Learn more [here](https://github.com/infinitered/reactotron). Reactotron is useful for:
1. Inspecting network requestsl.
2. As an alternative for console.log (Separates the logs for each device/simulator being used).
In order to use with an android device/emulator you must run `adb reverse tcp:9090 tcp:9090` before running the project.

## Releasing

### Android
Notes: 
 - It used to be standard to build the Android project in Android Studio but the preferred way is now through the command line.
 - Google requires API 35 but this requires a higher version of gradle than what our current version of React Native provides. Until we upgrade RN, add this line to the gradle.properties before you build for release `android.aapt2FromMavenOverride=/Users/XXX/Library/Android/sdk/build-tools/35.0.0/aapt2` and update the XXX to correct directory. If you do not have 35.0.0 open Android Studio and download the SDK 35. This suggestion comes from https://stackoverflow.com/questions/78678063/android-15-update-compilesdk-android-35-cause-an-error-res-table-type-type-e.

Steps:
1) Reach out to a developer to get the upload key and the key.properties file. 
2) Place both in the android/app folder. 
3) Run `npx react-native build-android --mode=release`
4) The file will be built to android/app/build/outputs/bundle/release/app-release.aab.
5) Drag n drop the file into the "App bundles" in Google Play store where you would normally create the internal testing release.

### iOS
Note: Nothing has changed with the iOS release process, continue to build and archive via Xcode.
