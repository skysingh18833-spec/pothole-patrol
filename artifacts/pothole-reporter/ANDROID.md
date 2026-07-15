# Building the Android APK

This app is configured with [Capacitor](https://capacitorjs.com/) so it can be
packaged as a native Android APK. The web layer stays unchanged; Capacitor wraps
it in an Android WebView.

## Prerequisites (local machine or CI)

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| pnpm | ≥ 8 |
| Java (JDK) | 17 or 21 |
| Android Studio | Ladybug or newer |
| Android SDK | API level 22+ (min), 34+ (target) |

> **Replit note:** Java and the Android SDK are not available in the Replit
> workspace, so the final Gradle build must be run locally or in a CI
> environment. Everything else (web build + `cap sync`) works here.

## Step 1 — Deploy your API server

The Android app cannot use relative `/api/*` URLs because there is no server
running on the device. Before building, publish the project on Replit and note
the production URL (e.g. `https://your-app.replit.app`).

## Step 2 — Build the web bundle and sync

Run this from the **workspace root** (or the `artifacts/pothole-reporter`
directory):

```bash
# From workspace root:
VITE_API_BASE_URL=https://your-app.replit.app \
  BASE_PATH=/ PORT=3000 \
  pnpm --filter @workspace/pothole-reporter run android:build
```

`android:build` runs `vite build` then `cap sync android`, which copies
`dist/public/` into `android/app/src/main/assets/public/`.

## Step 3 — Open in Android Studio

```bash
pnpm --filter @workspace/pothole-reporter run android:open
```

This opens the `android/` project in Android Studio. From there you can:

- Run on an emulator or connected device (**Run ▶**)
- Build a debug APK: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Build a release APK: **Build → Generate Signed Bundle / APK**

The APK ends up in:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Step 4 — Install on a device

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or share the `.apk` file directly.

## Permissions granted

The `AndroidManifest.xml` already declares:

| Permission | Used for |
|------------|---------|
| `INTERNET` | API calls to the server |
| `CAMERA` | Capturing road damage photos |
| `ACCESS_FINE_LOCATION` | GPS coordinates for each report |
| `ACCESS_COARSE_LOCATION` | Fallback coarse location |

## Re-syncing after code changes

Whenever you change the web app, re-run:

```bash
VITE_API_BASE_URL=https://your-app.replit.app \
  BASE_PATH=/ PORT=3000 \
  pnpm --filter @workspace/pothole-reporter run android:build
```

Then rebuild in Android Studio (or run `./gradlew assembleDebug` in the
`android/` directory).
