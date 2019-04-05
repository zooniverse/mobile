More detailed information on the [wiki](https://github.com/zooniverse/mobile/wiki)

# Zooniverse Mobile App
[React Native](https://facebook.github.io/react-native/) app to house a list of zooniverse projects

## Requirements
### General
Node >= 5.12.0
React Native CLI (`npm install -g react-native-cli` - may need sudo/admin depending on your setup)

### Setting up the environment
Head to https://facebook.github.io/react-native/docs/getting-started.html and follow the instructions for both Android and iOS setup.

### iOS
OSX, Xcode >= 8.0.

### Android
You'll need at least one emulator.  I've found the easiest way to add Virtual Device:
  *  Within Android Studio, open the "AVD Manager" -  in the toolbar click the icon with the purple device and small android (fourth from the right)
  *  Click 'Create Virtual Device' - bottom left-hand corner
  *  Create at least one using the latest Android Release (Nougat).  I have a few different size and Android Release configurations

Also you'll need a Gradle properties file outside the project for keeping secrets that aren't checked into source control. This should be in ~/.gradle/gradle.properties and contain the following:
`MYAPP_RELEASE_STORE_FILE=`    
`MYAPP_RELEASE_KEY_ALIAS=`

Which should contain the keystore file name and alias. Talk to either Will Granger (will@zooniverse.org) or Noah Malmed (noah@zooniverse.org) for more information on this.

## Run
npm install

### iOS
To run in the simulator from the command line:


`react-native run-ios` or `npm run ios`

Using Xcode:
Open iOS/ZooniverseMobile.xcworkspace in Xcode and press the run button (or `⌘-R`).
*Note*  There is a bug in Xcode 8 with react-native's RCTWebSocket.  If you receive an error, follow the instructions here:
http://stackoverflow.com/questions/38710654/rctwebsocket-ignoring-return-value-of-function-declared-with-warn-unused-resul

### Android
To run in the emulator from the command line (you'll need device connected or emulator already running):

`npm run android`


*Notes*

- You need to have either a device emulator open already or a physical device plugged into your computer otherwise you'll need to run through Android Studio
- If Android studio prompts you to update Gradle files, you should do it.
- The command `react-native run-android` will install the build, but fail in launching the app due to a bug with the `react-native` script with having a seperate `applicationId` for development builds

[![pullreminders](https://pullreminders.com/badge.svg)](https://pullreminders.com?ref=badge)
