#import "AppDelegate.h"

// [@react-native-firebase/app] - start
#import <Firebase.h>
// [@react-native-firebase/app] - end

// [react-native-voip-push-notification] - start
#import <PushKit/PushKit.h>  
#import "RNVoipPushNotificationManager.h"
// [react-native-voip-push-notification] - end

// [react-native-callkeep]
#import "RNCallKeep.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

// [react-native-unimodules] - start
#import <UMCore/UMModuleRegistry.h>
#import <UMReactNativeAdapter/UMNativeModulesProxy.h>
#import <UMReactNativeAdapter/UMModuleRegistryAdapter.h>
// [react-native-unimodules] - end

// [react-native-bootsplash] - start
#import "RNBootSplash.h"
// [react-native-bootsplash] - end

// [react-native-fbsdk-next] - start
#import <FBSDKCoreKit/FBSDKCoreKit.h>
// [react-native-fbsdk-next] - end

// [react-native-firebase/dynamicLinks] - start: https://github.com/invertase/react-native-firebase/issues/4548
#import <RNFBDynamicLinksAppDelegateInterceptor.h>
// [react-native-firebase/dynamicLinks] - end

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@interface AppDelegate () <RCTBridgeDelegate>

@property (nonatomic, strong) UMModuleRegistryAdapter *moduleRegistryAdapter;

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{

  // [@react-native-firebase/app] - start
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }
  // [@react-native-firebase/app] - end

  // [react-native-unimodules] - start
  self.moduleRegistryAdapter = [[UMModuleRegistryAdapter alloc] initWithModuleRegistryProvider:[[UMModuleRegistryProvider alloc] init]];
  // [react-native-unimodules] - end

  #ifdef FB_SONARKIT_ENABLED
    InitializeFlipper(application);
  #endif

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

  // [react-native-voip-push-notification] - start
  // ===== (THIS IS OPTIONAL BUT RECOMMENDED) =====
  // --- register VoipPushNotification here ASAP rather than in JS. Doing this from the JS side may be too slow for some use cases
  // --- see: https://github.com/react-native-webrtc/react-native-voip-push-notification/issues/59#issuecomment-691685841
  [RNVoipPushNotificationManager voipRegistration];
  // ===== (THIS IS OPTIONAL BUT RECOMMENDED) =====
  // [react-native-voip-push-notification] - end

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"meetlete"
                                            initialProperties:nil];

  if (@available(iOS 13.0, *)) {
      rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
      rootView.backgroundColor = [UIColor whiteColor];
  }

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  // [react-native-bootsplash] - start
  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:rootView]; 
  // [react-native-bootsplash] - end

  // [react-native-fbsdk-next] - start
  [[FBSDKApplicationDelegate sharedInstance] application:application
                        didFinishLaunchingWithOptions:launchOptions];
  // [react-native-fbsdk-next] - end

  return YES;
}

// [react-native-voip-push-notification] - start
/* Add PushKit delegate method */
// --- Handle updated push credentials
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
  // Register VoIP push token (a property of PKPushCredentials) with server
  [RNVoipPushNotificationManager didUpdatePushCredentials:credentials forType:(NSString *)type];
}

// --- Handle incoming pushes
- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type
 {
   // --- The system calls this method when a previously provided push token is no longer valid for use. No action is necessary on your part to reregister the push type. Instead, use this method to notify your server not to send push notifications using the matching push token.
 }

 // --- Handle incoming pushes
 - (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
   // --- NOTE: apple forced us to invoke callkit ASAP when we receive voip push
   // --- see: react-native-callkeep

   // --- Retrieve information from your voip push payload
  NSDictionary *content = [payload.dictionaryPayload valueForKey:@"custom"];
  NSDictionary *action = [content valueForKey:@"a"];
  NSDictionary *uuid = [content valueForKey:@"i"];
  NSDictionary *data = [action valueForKey:@"payload"];
  NSDictionary *call = [data valueForKey:@"call"];
  NSDictionary *caller = [call valueForKey:@"athlete"];

  //  NSString *uuid = [[[NSUUID UUID] UUIDString] lowercaseString];
   NSString *callerName = [caller valueForKey:@"name"];
   NSString *handle = [call valueForKey:@"_id"];

   // --- this is optional, only required if you want to call `completion()` on the js side
//   [RNVoipPushNotificationManager addCompletionHandler:uuid completionHandler:completion];

   // --- Process the received push
   [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];

   // --- You should make sure to report to callkit BEFORE execute `completion()`
   [RNCallKeep reportNewIncomingCall: uuid
                              handle: handle
                          handleType: @"generic"
                            hasVideo: YES
                 localizedCallerName: callerName
                     supportsHolding: YES
                        supportsDTMF: YES
                    supportsGrouping: YES
                  supportsUngrouping: YES
                         fromPushKit: YES
                             payload: data
               withCompletionHandler: completion];

   // --- You don't need to call it if you stored `completion()` and will call it on the js side.
  //  completion();
 }
// [react-native-voip-push-notification] - end


// [react-native-unimodules] - start
- (NSArray<id<RCTBridgeModule>> *)extraModulesForBridge:(RCTBridge *)bridge
{
    NSArray<id<RCTBridgeModule>> *extraModules = [_moduleRegistryAdapter extraModulesForBridge:bridge];
    // If you'd like to export some custom RCTBridgeModules that are not Expo modules, add them here!
    return extraModules;
}
// [react-native-unimodules] - end

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// [react-native-callkeep] - start
// - (BOOL)application:(UIApplication *)application 
// continueUserActivity:(NSUserActivity *)userActivity
//   restorationHandler:(void(^)(NSArray * __nullable restorableObjects))restorationHandler
// {
//   return [RNCallKeep application:application
//            continueUserActivity:userActivity
//              restorationHandler:restorationHandler];
// }
// [react-native-callkeep] - end

// [react-native-fbsdk-next] Start
 - (BOOL)application:(UIApplication *)app
             openURL:(NSURL *)url
             options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
 {
   return [[FBSDKApplicationDelegate sharedInstance]application:app
                                                        openURL:url
                                                        options:options];
 }
 // [react-native-fbsdk-next] End

 // [react-native-firebase/dynamicLinks] - start: https://github.com/invertase/react-native-firebase/issues/4548
// - (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
//   return [[RNFBDynamicLinksAppDelegateInterceptor sharedInstance] application:app openURL:url options:options];
// }

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id> * _Nullable))restorationHandler {
  return [[RNFBDynamicLinksAppDelegateInterceptor sharedInstance] application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}
// [react-native-firebase/dynamicLinks] - end
@end
