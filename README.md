# Mobile Helmet Heroes

Unofficial Android WebView wrapper for https://hh-rewritten.com/play.

Version 1.0.3 removes the burger menu and scales the entire desktop page uniformly into the landscape viewport. Different aspect ratios may leave empty borders. Live game layout and input compatibility still need phone testing.

Controls start hidden. Tap Show controls after login, and Hide controls to dismiss them. The Controls button opens keyboard mappings directly.

Requires Android SDK 35, Gradle 8.9 or newer, and JDK 17 or newer. Open in Android Studio to build. APK and ZIP outputs are in build/ and are uploaded separately to GitHub Releases.

Version 1.0.4: Show controls > Settings provides a live game width slider (50–150% of automatic fit), saved on the device. Reset width restores 100%. Height and touch controls remain unchanged; widening beyond the screen crops the sides.

Version 1.0.5 reduces wrapper layout work: no subtree mutation watcher on game HUD/chat updates, no resetting transforms on each fit, cached width/transform writes, and coalesced resize handling. Actual device frame rate has not been measured.
