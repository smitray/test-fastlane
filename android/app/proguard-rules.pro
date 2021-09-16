# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# [react-native-svg]
-keep public class com.horcrux.svg.** {*;}

# [react-native-reanimated] v2
# -keep class com.facebook.react.turbomodule.** { *; }

# [react-native-config]
-keep class com.pregnancydiet.BuildConfig { *; }

# [react-native-fast-image]
-keep public class com.dylanvann.fastimage.* {*;}
-keep public class com.dylanvann.fastimage.** {*;}
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

# [react-native-twilio-video-webrtc]
  -keep class org.webrtc.** { *; }
  -keep class com.twilio.** { *; }
  -keep class tvi.webrtc.** { *; }

# [react-native-contacts]
-keep class com.rt2zz.reactnativecontacts.** {*;}
-keepclassmembers class com.rt2zz.reactnativecontacts.** {*;}

# [react-native-device-info]
-keepclassmembers class com.android.installreferrer.api.** {
  *;
}