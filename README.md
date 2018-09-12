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

## Testing
Unit tests utilize Jests' Snapshots, located in src/****/__tests__ directories.  Mocks are located under root /__mocks__ directory.
To run the test suite, use `npm test`.  

About Snapshots:  Facebook's native apps use a system called "snapshot testing":  a snapshot test system that renders UI components, takes a screenshot and subsequently compares a recorded screenshot with changes made by an engineer.  It is meant to make sure components don't change unexpectedly.  The first time a test is run, Jest will create a snapshot file that needs to be committed alongside code changes.  On subsequent test runs Jest will simply compare the rendered output with the previous snapshot. If they match, the test will pass. If they don't match, either the implementation has changed and the snapshot needs to be updated with `npm test -- -u TESTNAME` or it indicates there is a bug that needs to be fixed.

Snapshots should be committed to the repo and any changes to snapshots should be reviewed along with their PRs.

## Building For Release

### Automated 
Our build scripts are powered by [Fastlane](https://fastlane.tools/). 99% of the time you should use the automated scripts to build and push the Android and iOS apps to Google Beta and Testflight because they will automatically clean the projects and node modules and handle incrementing the build numbers.

That being said, there are few things you will need to do in order to get your dev environment ready to use the build scripts.

#### General Preperation:

- Make sure Ruby is installed on your machine  
- Install Fastlane using either  
RubyGems: 
	`sudo gem install fastlane -NV`  
or Hombrew `brew cask install fastlane`


#### iOS Preperations: 
   Before getting everything setup it is probably worth spending some time understanding how [Fastlane match](https://codesigning.guide/) works. 

- Make sure that you have access to the [private repo](https://github.com/zooniverse/mobile-provisioning-profiles) that houses our provisioning profiles.
- Make sure that you have access to the zooniverse Passbolt password manager 
- Download the development and distribution certs from the [Apple Developer Portal](https://developer.apple.com/account/ios/certificate/?teamId=888MXXMABP) to your keychain.

Now you should be able to run the build script in the main directory.  
	`./buildiOS.sh`
	
If this is your first time building for iOS using fastlane you will be prompted for a password to decrypt the provisioning profiles stored in git. You can find the password in Passbolt under 'fastlane'.  
  
  If everything runs correctly, you will be prompted to enter in a new version number and then the script will build and push your build to Testflight, where you can eventually promote that build manually for release.
  
#### Android Preperations:
	
To start, you need to download a service account JSON. This gives your machine rights to upload Android builds to the Google Play console.
  
- Navigate [Service accounts](https://console.developers.google.com/iam-admin/serviceaccounts/project?project=643622617518) under the google developer portal. Make sure you are logged in android@zooniverse.org.
- From the list of Service accounts select the actions menu for the account named 'fastlane' from there select 'Create Key' and download it as a JSON
- Save the json key anywhere on your machine (make sure it is not saved to version control)
- Update your `.bash_profile` to contain export `export SERVICE_ACCOUNT_JSON={LOCATION OF SERVICE JSON}`

Now you should be able to run the build script from the main directory.  
`./buildAndroid.sh`

If everything runs correctly, you will be prompted to enter in a new version number and then the script will build and push your build to PlayStore Beta, where you can eventually promote that build manually for release.

#### Building both

Once both builds are building successfully, you should be able to run:

`./buildAndroidAndIOS.sh`  

This will basically do a clean build and open up the iOS and Android  fastlane scripts in two new windows. Don't forget to answer the prompts the on both of the scripts.


### Manual

Manual instructions for [Android](https://docs.google.com/document/d/14yNuwpYofV2m5hYle3zg19fJKUk3ymYU2RkkN75DlF8/) and [iOS](https://docs.google.com/document/d/1kMbryj3tvJhnXkdIgHcnmOJQqwh_VMLspuCFYJfn_0s/edit) can be found in our google drive. 

## Debugging 
If you want to setup redux debugging and monitoring, the app is equipped with [`remote-redux-devtools`](https://github.com/zalmoxisus/remote-redux-devtools). If you want to monitor redux through the app, check out their list of [monitoring options](https://github.com/zalmoxisus/remote-redux-devtools#monitoring). This is not required to run the app, it is just a development tool.

This tool tends to be a little finicky. If you are having trouble setting it up, try restarting the simulator.


## Push Notifications 

Both the Android and iOS apps can receive push notifications. All of our push notification sending is handled through [Firebase](https://firebase.google.com/). If you want to send push notifications, it's fairly easy, just follow these instructions:
	
1. Log in to the [Firebase console](https://console.firebase.google.com) with the account `android@zooniverse.org` (password is in passbolt) 
2. Select either the production (Zooniverse-production) or the development (zooniverse-mobile-dev) accounts
3. Under the "Grow" menu on the left side, select "Cloud Messaging"
4. Select the "New Message" button
5. From here you can compose a message:
	* The "Message Text" is the body of the notification
	* If you want to give it a title or any custom data, check under the "Advanced Options" section
6. When sending notifications, there are a few different "topics" you can send them to. These topics serve as subjects users can subscribe/unsubscribe to. The topics are as follows:
	* `new_projects`- Notifications for when a new project is released
	* `new_beta_projects`- Notifications for when a new beta project is released
   * `urgent_notifications`- Notifications for when users help is needed urgently
   * For project-specific notifications just use the project id
7. Once everything is filled out, select "Send Message", the notification should be sent to both iOS and Android
