# AIR Android prototype

This is a separate experiment, not a replacement for the working WebView APK.

The Windows package's AIR descriptor launches HelmetHeroesDesktop.swf (SWF 41, 1,523 bytes). Decoded launcher strings identify https://hh-rewritten.com/client/game.swf, URLLoader binary downloads, Loader.loadBytes, and desktop native-window functions. This prototype replaces the desktop launcher and embeds the downloaded game in an Android AIR package.

The downloaded game is 4,562,146 bytes, SHA-256 5b1a60566e6af68977771a716df2cb8c789a42c0a5596589e23377d6cd125f26. Static strings reference Stage3D, Starling, and socket networking; no successful Android execution, server login, touch input, or performance measurement has been established.

## Build

Install the official AIR SDK after reviewing its license at https://airsdk.wxlift.com/download. With Java and the Android prerequisites available, run:

```powershell
.\air-mobile\build.ps1 -AirSdk 'C:\path\to\AIRSDK'
```

The build downloads the game from the desktop launcher's HTTPS URL, compiles the launcher, creates a development certificate, and packages an ARM64 APK with AIR. Downloaded game files, SDKs, certificates and output are ignored by Git.

The prototype uses a separate app ID. Controls start hidden. Touch controls use provisional arrows/Space/A/S keyboard events. Width buttons affect the display-list loader; the game's independently managed Stage3D viewport may need adaptation. Dynamic code loading or desktop-only APIs may also need changes.

The launcher compiled with AIR SDK 51.5.1.1 on November 1, 2026. Standard ADT packaging encountered a local Gradle loopback error. The test APK was instead built from ADT's android-studio export with the installed Android SDK tools, using Android's built-in multidex support (minimum Android 8) and the ARM64 runtime. Signature verification and 16 KB ZIP alignment passed. This does not establish successful startup or gameplay. The standard build command above still requires a functioning Gradle environment.

Local outputs: `output/Helmet-Heroes-AIR-prototype.apk` and its ZIP. These are test artifacts and have not been uploaded to GitHub Releases.

This prototype bundles a snapshot of the game; it does not implement automatic game updates. Runtime networking is controlled by the embedded game. Static inspection does not establish which server it will reach successfully on Android.
