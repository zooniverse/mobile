import UIKit
import UserNotifications
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  // Keep the React Native delegate alive for the lifetime of this scene.
  // RCTReactNativeFactory does not retain it.
  // swiftlint:disable:next weak_delegate
  private var reactNativeDelegate: ReactNativeDelegate?
  private var reactNativeFactory: RCTReactNativeFactory?
  private var needsSplashScreen = true

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    // Some native dependencies still look up the window through UIApplicationDelegate.
    appDelegate.window = window

    let delegate = ReactNativeDelegate()
    delegate.dependencyProvider = RCTAppDependencyProvider()
    let factory = RCTReactNativeFactory(delegate: delegate)
    reactNativeDelegate = delegate
    reactNativeFactory = factory

    var launchOptions = appDelegate.launchOptions ?? [:]
    if let response = connectionOptions.notificationResponse {
      launchOptions[.remoteNotification] = response.notification.request.content.userInfo
      // Scene-based cold launches deliver the response here. Forward it to the
      // existing Firebase delegate before JS asks for getInitialNotification().
      let center = UNUserNotificationCenter.current()
      center.delegate?.userNotificationCenter?(
        center,
        didReceive: response,
        withCompletionHandler: {}
      )
    }

    factory.startReactNative(
      withModuleName: "ZooniverseMobile",
      in: window,
      launchOptions: launchOptions
    )
  }

  func sceneDidBecomeActive(_ scene: UIScene) {
    // SplashView needs an active scene to create its overlay window. Show it
    // once per connection; the existing JS startup effect dismisses it.
    guard needsSplashScreen else { return }
    needsSplashScreen = false
    if let splashClass = NSClassFromString("SplashView") as? NSObject.Type,
       let splashInstance = splashClass.perform(NSSelectorFromString("sharedInstance"))?
         .takeUnretainedValue() as? NSObject {
      splashInstance.perform(NSSelectorFromString("showSplash"))
    }
  }
}
