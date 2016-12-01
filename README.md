# Zooniverse Mobile App
[React Native](https://facebook.github.io/react-native/) app to house a list of zooniverse projects

## Requirements
### General
Node >= 5.12.0
React Native CLI (`npm install -g react-native-cli` - may need sudo/admin depending on your setup)

### iOS
OSX, Xcode >= 8.0.

### Android
Android SDK Platform 23
You may set up Android Studio following the instructions here:
http://facebook.github.io/react-native/releases/0.23/docs/android-setup.html
(up to the instructions to Install Genymotion)
You'll also need to install the Google Play Services SDK for  Google Analytics and Firebase Messaging (Push Notifications).  To do this, go to SDK Manager (from the toolbar or Android Studio -> Preferences -> Android SDK) -> SDK Tools -> Check "Google Play Services" to install.

You'll also need at least one emulator.  I've found the easiest way to add Virtual Device:
  *  Within Android Studio, open the "AVD Manager" -  in the toolbar click the icon with the purple device and small android (fourth from the right)
  *  Click 'Create Virtual Device' - bottom left-hand corner
  *  Create at least one using the latest Android Release (Nougat).  I have a few different size and Android Release configurations

Also you'll need a Gradle properties file outside the project for keeping secrets that aren't checked into source control.  This should be in ~/.gradle/gradle.properties and contain the following:
`MYAPP_RELEASE_STORE_FILE=
MYAPP_RELEASE_KEY_ALIAS=
PUSHER_API_KEY=`

## Run
npm install

### iOS
To run in the simulator from the command line:
react-native run-ios

Using Xcode:
Open iOS/ZooniverseMobile.xcworkspace in Xcode and press the run button (or `⌘-R`).
*Note*  There is a bug in Xcode 8 with react-native's RCTWebSocket.  If you receive an error, follow the instructions here:
http://stackoverflow.com/questions/38710654/rctwebsocket-ignoring-return-value-of-function-declared-with-warn-unused-resul

### Android
To run in the emulator from the command line (you'll need device connected or emulator already running)
react-native run-android
*Note* You need to have either a device emulator open already or a physical device plugged into your computer - otherwise you'll need to run through Android Studio
*Note* If Android studio prompts you to update Gradle Files, you should do it
