//
//  ImageSizer.m
//  ZooniverseMobile
//
//  Created by Noah Malmed on 5/31/18.
//  Copyright © 2018 Zooniverse. All rights reserved.
//

#import "ImageSizer.h"
#import <React/RCTLog.h>

@implementation ImageSizer

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getImageDimensions:(NSString *)imagePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  UIImage * image = [UIImage imageWithContentsOfFile:imagePath];
  if (!image) {
    reject(@"ImageSizer Error", [@"Could not find image at path: " stringByAppendingString: imagePath], nil);
  }
  
  CGSize imageSize = [image size];
  NSNumber * width = [NSNumber numberWithDouble:imageSize.width];
  NSNumber * height = [NSNumber numberWithDouble:imageSize.height];
  
  resolve(@{@"width": width, @"height": height});
}

@end
