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

Also you'll need a Gradle properties file outside the project for keeping secrets that aren't checked into source control.  This should be in ~/.gradle/gradle.properties and contain the following:
`MYAPP_RELEASE_STORE_FILE=
MYAPP_RELEASE_KEY_ALIAS=
PUSHER_API_KEY=
PUSHER_API_KEY_DEV=`

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

### Testing
Unit tests utilize Jests' Snapshots, located in src/****/__tests__ directories.  Mocks are located under root /__mocks__ directory.
To run the test suite, use `npm test`.  

About Snapshots:  Facebook's native apps use a system called "snapshot testing":  a snapshot test system that renders UI components, takes a screenshot and subsequently compares a recorded screenshot with changes made by an engineer.  It is meant to make sure components don't change unexpectedly.  The first time a test is run, Jest will create a snapshot file that needs to be committed alongside code changes.  On subsequent test runs Jest will simply compare the rendered output with the previous snapshot. If they match, the test will pass. If they don't match, either the implementation has changed and the snapshot needs to be updated with `npm test -- -u TESTNAME` or it indicates there is a bug that needs to be fixed.

Snapshots should be committed to the repo and any changes to snapshots should be reviewed along with their PRs.

### Debugging 
If you want to setup redux debugging and monitoring, the app is equipped with [`remote-redux-devtools`](https://github.com/zalmoxisus/remote-redux-devtools). If you want to monitor redux through the app, check out their list of [monitoring options](https://github.com/zalmoxisus/remote-redux-devtools#monitoring). This is not required to run the app, it is just a development tool.

This tool tends to be a little finicky. If you are having trouble setting it up, try restarting the simulator.
