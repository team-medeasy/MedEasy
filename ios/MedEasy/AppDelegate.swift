import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore
// 카카오 SDK 추가
import KakaoSDKCommon
import KakaoSDKAuth

@main
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "MedEasy"
    self.dependencyProvider = RCTAppDependencyProvider()

    // 카카오 SDK 초기화 - 앱 시작시 반드시 필요
    KakaoSDK.initSDK(appKey: "9779801f476eafda8410589c1fb3fc92")
    
    // Firebase 초기화
    FirebaseApp.configure()

    self.initialProps = [:]
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  
  // URL 스킴 처리 메서드 수정
  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    print("앱 딥링크 호출됨: \(url.absoluteString)")
    
    // 카카오 로그인 URL 처리 추가
    if AuthApi.isKakaoTalkLoginUrl(url) {
      return AuthController.handleOpenUrl(url: url)
    }
    
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
