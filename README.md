More detailed information on the [wiki](https://github.com/zooniverse/mobile/wiki)

# Zooniverse Mobile App
The Zooniverse Mobile app is a [React Native](https://facebook.github.io/react-native/) app that allows folks like you and me to contribute to astronomy, ecology, and anthropology research from their couch, bathtub, or bus stop (but don't swipe and drive, please).

## Setting Up for Local Development
Setting up to work on a react-native app is a little tricky, and setting up to work on this one in particular is trickier. The guide below attempts to be comprehensive. If you run into any further issues while attempting to get set up, please reach out to either Will Granger (will@zooniverse.org) or Chelsea Troy (chelsea@zooniverse.org)

### Preparing The React Native Framework
#### Requirements:
 - Node >= 6.9.0
 - React Native CLI (`npm install -g react-native-cli` - may need sudo/admin depending on your setup)
#### Steps:
1. Follow the instructions for Android and iOS setup in [this guide](https://facebook.github.io/react-native/docs/getting-started.html).
1. Clone down this repo and navigate to its directory (called `mobile`).
1. Run `npm install` (later, if you need to reinstall dependencies for some reason, you can run `rm -rf node_modules/ && npm install`)
1. Run `npm start`.

### Setting up to run on iOS
#### Requirements:
 - XCode 10.1 or 10.2
 - An iPhone X Simulator, which you can run from XCode.
#### Steps:
1. Open XCode, and in XCode open `mobile/ios/ZooniverseMobile.xcworkspace`. We now need to manually link up the `react-native-svg` dependency. Follow [these instructions](http://facebook.github.io/react-native/docs/linking-libraries-ios.html#manual-linking) to manually link `RNSVG.xcodeproj`, found at `mobile/node_modules/react-native-svg/ios/RNSVG.xcodeproj`. For our app, you _do_ need to do step 3 in that tutorial, adding `$(SRCROOT)/../node_modules/react-native-svg/ios/RNSVG` to our Header Search Paths for both debug and release at Build Settings > Header Search Paths.
1. Switch the project to the XCode Legacy Build System as described [here](https://github.com/facebook/react-native/issues/19573) under the section named **"Opting out of the new Xcode build system."**
1. Build and run the project from XCode on an iPhone X simulator. Shortly, your simulator should boot with the Zooniverse app on it.

**Note**:  There is a bug in Xcode 8 with react-native's RCTWebSocket.  If you receive an error, follow the instructions here:
http://stackoverflow.com/questions/38710654/rctwebsocket-ignoring-return-value-of-function-declared-with-warn-unused-resul

### Android
#### Requirements:
 - Android Studio (these instructions developed with AS 3.1.1)
 - You'll need at least one emulator.  To get one:
    *  Within Android Studio, open the "AVD Manager" -  in the toolbar click the icon with the purple device and small android (fourth from the right)
    *  Click 'Create Virtual Device' - bottom left-hand corner
    *  Create at least one using the latest Android Release (Nougat).  I have a few different size and Android Release configurations
 - Also you'll need a Gradle properties file outside the project for keeping secrets that aren't checked into source control. This should be in ~/.gradle/gradle.properties and contain the following:
`MYAPP_RELEASE_STORE_FILE=`
`MYAPP_RELEASE_KEY_ALIAS=`
Which should contain the keystore file name and alias. Talk to Will Granger (will@zooniverse.org) for more information on this.
#### Steps:
1. To run in the emulator from the command line (you'll need device connected or emulator already running): `npm run android`. Shortly, your emulator should boot with the Zooniverse app on it.
    - You need to have either a device emulator open already or a physical device plugged into your computer. Otherwise, you'll need to run through Android Studio
    - If Android studio prompts you to update Gradle files, you should do it.
    - The command `react-native run-android` will install the build, but fail in launching the app due to a bug with the `react-native` script with having a seperate `applicationId` for development builds.

[![pullreminders](https://pullreminders.com/badge.svg)](https://pullreminders.com?ref=badge)
