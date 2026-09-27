# Mitu

Mitu is a Bengali-first hands-free Android assistant with a web control room, usage limits, translation, gesture controls, and WhatsApp automation boundaries.

## Repository layout

```text
android/                 Native Android Studio project
backend/
  api-server/            Express API export
  admin-dashboard/       React/Vite control room export
  shared/                OpenAPI, generated clients, validators, and Drizzle DB
artifacts/               Replit-hosted previews
lib/                     Replit workspace source-of-truth packages
```

## Android Studio

1. Open the `android/` directory in Android Studio.
2. Let Android Studio sync the Gradle project.
3. Set `MITU_API_BASE_URL` in `android/gradle.properties` or pass `-PmituApiBaseUrl=https://your-api.example.com`.
4. Run the `app` configuration on an Android 8.0+ device.
5. Grant camera, microphone, notification, and AccessibilityService access from the app.

The package name is `com.mitu.assistant`. The release build enables shrinking and uses the project ProGuard file.

The Android app includes the MediaPipe hand landmark model in `android/app/src/main/assets/hand_landmarker.task`. Wake-word matching supports `Mitu` and `মিতু`; the detector prefers Android's offline speech recognizer and is isolated behind `WakeWordDetector` so a dedicated wake-word model can be swapped in without changing the service contract.

## Backend and control room

From the repository root:

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/mitu-dashboard run dev
```

The API requires `DATABASE_URL`. The native client uses the same `/api/remote-config`, `/api/mobile/usage`, and `/api/mobile/translate` routes as the Expo client.

## Verification

```bash
pnpm run typecheck
cd android
./gradlew assembleDebug
```

The Android project is intentionally kept separate from the Expo preview. The Expo app remains useful for hosted UI previews, while `/android` is the Android Studio source for native background services.