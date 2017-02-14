//
//  NotificationSettings.h
//  ZooniverseMobile
//
//  Created by Robin Schaaf on 11/3/16.
//  Copyright © 2016 Zooniverse. All rights reserved.
//

#import "RCTBridgeModule.h"
#import "AppDelegate.h"
#import <Pusher/Pusher.h>

@interface NotificationSettings : NSObject <RCTBridgeModule, PTPusherDelegate>

@property (nonatomic, strong) PTPusher *pusher;

@end
