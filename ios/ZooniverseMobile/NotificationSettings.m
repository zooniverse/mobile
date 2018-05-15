//
//  NotificationSettings.m
//  ZooniverseMobile
//
//  Created by Robin Schaaf on 11/3/16.
//  Copyright © 2016 Zooniverse. All rights reserved.
//

#import "NotificationSettings.h"
#import "RCTLog.h"

@implementation NotificationSettings

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setInterestSubscription:(NSString *)interest
                  subscribed:(BOOL)subscribed
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  if (subscribed) {
    [[FIRMessaging messaging] subscribeToTopic:interest];
  } else {
    [[FIRMessaging messaging] unsubscribeFromTopic:interest];
  }
  
  resolve(@"Interest subscription set");
}


@end
