//
//  FirebaseManager.swift
//  ZooniverseMobile
//
//  Created by Noah Malmed on 5/14/18.
//  Copyright © 2018 Zooniverse. All rights reserved.
//

import Firebase

@objc class FirebaseManager: NSObject, MessagingDelegate {
  
  @objc static let shared = FirebaseManager()
  
  // Stub out initializer to enforce this class as a singleton
  private override init() {}
  
  func configureFirebase() {
    let plistNameValue = Bundle.main.object(forInfoDictionaryKey: "GOOGLE_SERVICE_PLIST")
    guard let plistName = plistNameValue as? String else {
      assertionFailure("Could not find google service plist");
      return
    }
    
    // We want to configure Firebase
    let filePathValue = Bundle.main.path(forResource: plistName, ofType: "plist")
    guard let filePathString = filePathValue, let fileopts = FirebaseOptions(contentsOfFile: filePathString) else {
      assertionFailure("Couldn't load config file")
      return
    }
    FirebaseApp.configure(options: fileopts)
    Messaging.messaging().delegate = self
  }
  
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String) {
    print("Firebase registration token: \(fcmToken)")
  }
  
}
