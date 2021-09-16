package com.meetlete;

// [react-native-bootsplash] 
import android.os.Bundle; 

import com.facebook.react.ReactActivity;

import com.zoontek.rnbootsplash.RNBootSplash; 
// [react-native-bootsplash] - end

public class MainActivity extends ReactActivity {
  // [react-native-bootsplash] 
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    RNBootSplash.init(R.drawable.bootsplash, MainActivity.this); 
  }
  // [react-native-bootsplash] - end
  
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "meetlete";
  }
}
