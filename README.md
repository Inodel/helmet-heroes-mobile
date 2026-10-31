# Mobile Helmet Heroes

Controls start hidden to keep login unobstructed. Tap **Show controls** at the top left after logging in. Tap **Hide controls** to hide movement, actions, and menus again; held inputs are released immediately. Each new page load starts hidden.

Android landscape WebView wrapper for https://hh-rewritten.com/play, with green touch controls inspired by the supplied references, simultaneous movement/action input, and an expandable menu. No game artwork is redistributed.

Open this folder in Android Studio, select JDK 17 for Gradle, sync, then Build > Build APK(s). Requires Android SDK 35 and Gradle 8.9. A Gradle wrapper is not bundled. With Gradle installed, run `gradle :app:assembleDebug`.

The website could not be reached during development. Gameplay, login, canvas sizing, embedded frames, and actual keyboard mappings need device verification. The wrapper preserves the website's layout and scales through WebView; arbitrary game aspect ratios cannot be guaranteed without inspecting its renderer. The overlay adapts to landscape screen dimensions and safe areas.

Use ☰ > Controls to change keyboard codes. Default movement: arrows; jump: Space; attack: A; block: S. These and menu shortcuts are provisional. Synthetic keyboard events may be rejected by the game, and a cross-origin game iframe would require a different integration. Menu buttons send keyboard shortcuts; they do not recreate the game's internal screens. No webhook or server is needed for this wrapper.

Only HTTPS navigation to hh-rewritten.com and www.hh-rewritten.com is allowed inside the wrapper. External login redirects may need explicit integration after inspection. Network failures provide a retry dialog.
