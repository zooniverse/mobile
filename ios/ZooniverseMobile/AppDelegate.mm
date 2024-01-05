#import "AppDelegate.h"
#import <Firebase.h>

#import <React/RCTBundleURLProvider.h>
#import "RNSplashScreen.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"ZooniverseMobile";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  [super application:application didFinishLaunchingWithOptions:launchOptions];
  
  NSString* firebaseOptionsFilename;
  #ifdef DEBUG
  NSLog(@"[FIREBASE] Development mode.");
  firebaseOptionsFilename = @"GoogleService-Info-Debug";
  #else
  NSLog(@"[FIREBASE] Production mode.");
  firebaseOptionsFilename = @"GoogleService-Info-Release";
  #endif
  NSString *filePath = [[NSBundle mainBundle] pathForResource:firebaseOptionsFilename ofType:@"plist"];
  FIROptions *options = [[FIROptions alloc] initWithContentsOfFile:filePath];
  [FIRApp configureWithOptions:options];
  [RNSplashScreen show];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
