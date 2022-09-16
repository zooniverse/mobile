More detailed information on the [wiki](https://github.com/zooniverse/mobile/wiki). In particular, check out our [contributor guidelines](https://github.com/zooniverse/mobile/wiki/Contributor-Guidelines)!

# Zooniverse Mobile App
The Zooniverse Mobile app is a [React Native](https://facebook.github.io/react-native/) app that allows folks like you and me to contribute to astronomy, ecology, and anthropology research from their couch, bathtub, or bus stop (but don't swipe and drive, please).

## Setting Up for Local Development
Setting up to work on a react-native app is a little tricky, and setting up to work on this one in particular is trickier. The guide below attempts to be comprehensive. If you run into any further issues while attempting to get set up, please reach out to contact@zooniverse.org.

### Preparing The React Native Framework
#### Requirements:
 - Node >= 10
 - React Native CLI (`npm install -g react-native-cli` - may need sudo/admin depending on your setup)
#### Steps:
1. Follow the instructions for Android and iOS setup in [this guide](https://reactnative.dev/docs/0.62/environment-setup).
2. Clone down this repo and navigate to its directory (called `mobile`).
3. Run `npm install` (later, if you need to reinstall dependencies for some reason, you can run `rm -rf node_modules/ && npm install`)
4. Run `npm start`.
#### Troubleshooting:
- [Troubleshooting wiki](https://github.com/zooniverse/mobile/wiki/Troubleshooting) for additional help

### iOS
#### Requirements:
 - XCode
 - An iPhone X Simulator, which you can run from XCode.
#### Steps:
On the command line, from the `mobile` directory, run:
1. `cd ios && rm -rf Podfile.lock && pod install && cd ..`. You may need to `brew install cocoapods` first.
2. `react-native run-ios`

### Android
#### Requirements:
 - Android Studio
 - You'll need at least one emulator.  To get one:
    *  Within Android Studio, open the "AVD Manager" -  in the toolbar click the icon with the purple device and small android (fourth from the right)
    *  Click 'Create Virtual Device' - bottom left-hand corner
    *  Create at least one using the latest Android Release.  I have a few different size and Android Release configurations
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
    - The command `react-native run-android` will install the build, but fail in launching the app due to a bug with the `react-native` script with having a seperate `applicationId` for development builds.

## If you Work for The Zooniverse

You may also want to set up error reporting from your local copy of the application to our reporting service, Sentry. [Here are instructions on how to do that!](https://github.com/zooniverse/mobile/wiki/Enabling-Sentry-for-your-Local-Builds)
