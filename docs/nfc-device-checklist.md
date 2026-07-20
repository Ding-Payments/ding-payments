# NFC device checklist

Devices to test
- iPhone with Core NFC support (physical device)
- Pixel-class Android device
- Samsung/other OEM device to capture vendor variance

Checklist
- Ensure NFC is enabled in system settings.
- For iOS: confirm entitlement and Info.plist usage string present in `app.config.ts`.
- For Android: confirm `android.permission.NFC` is declared and app handles foreground dispatch.
