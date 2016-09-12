/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "Orientation.h"

#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"

#import <Pusher/Pusher.h>

@import HockeySDK;


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.pusher = [PTPusher pusherWithKey:@"ed07dc711db7079f2401" delegate:self encrypted:YES];
  
  
  UIUserNotificationType notificationTypes = UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound;
  UIUserNotificationSettings *pushNotificationSettings = [UIUserNotificationSettings settingsForTypes:notificationTypes categories: NULL];
  [application registerUserNotificationSettings:pushNotificationSettings];
  [application registerForRemoteNotifications];
  

  [[BITHockeyManager sharedHockeyManager] configureWithIdentifier:@"a64221f0d73b46829478d405c90e6638"];
  // Do some additional configuration if needed here
  [[BITHockeyManager sharedHockeyManager] startManager];
  [[BITHockeyManager sharedHockeyManager].authenticator
   authenticateInstallation];

  NSURL *jsCodeLocation;

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"ZooniverseMobile"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
  return [Orientation getOrientation];
}


- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [[[self pusher] nativePusher] registerWithDeviceToken:deviceToken];
  [[[self pusher] nativePusher] subscribe:@"general"];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification {
  NSLog(@"Received remote notification: %@", notification);
}

@end
