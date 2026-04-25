# NFC Research Report: Android P2P Payment Flows

## 1. Executive Summary
True Peer-to-Peer NFC (Android Beam) is **deprecated and removed** from modern Android devices (Android 10+). The modern replacement for device-to-device "tap" interactions is **Host Card Emulation (HCE)**. In this model, one device acts as an NFC Reader while the other acts as an emulated NFC Card (Tag).

For the **Ding-Payments** flow (Receiver → Sender data transfer):
- **Receiver (Merchant/Requestor):** Acts as an emulated NFC Tag (HCE) containing payment details.
- **Sender (Payer):** Acts as an NFC Reader to "scan" the receiver's phone.

## 2. Key Research Findings

| Question | Answer |
| :--- | :--- |
| **Direct P2P Support?** | No. Android Beam is gone. Use HCE (Host Card Emulation) instead. |
| **Internet Required?** | No for the NFC handshake; Yes for final payment verification/processing. |
| **Max Payload Size?** | ~255 bytes per APDU frame. Practical limit for NDEF is ~1KB–32KB (segmented). |
| **Reliability?** | High, provided devices are within 4cm and held for ~300ms. |
| **iOS Compatibility?** | **Limited.** iOS supports reading tags (Reader Mode) but **blocks** third-party HCE for general apps (reserved for Apple Pay). |

## 3. Recommended Library Stack

### **For Reader Mode (Sender Side)**
- **Library:** `react-native-nfc-manager`
- **Status:** Industry standard, actively maintained.
- **Role:** Scans the other device and extracts the NDEF message or APDU data.

### **For Card Emulation (Receiver Side)**
- **Library:** `react-native-hce` (or Custom Native Module)
- **Status:** `react-native-hce` is available but lightly maintained. 
- **Recommendation:** For a production payment app, implement a small **Custom Native Module** (Kotlin/Java) for Android HCE to ensure reliability and modern OS support.

## 4. Implementation Details

### Required Permissions (Android)
Add these to your `AndroidManifest.xml`:
```xml
<!-- Basic NFC usage -->
<uses-permission android:name="android.permission.NFC" />
<!-- Required for HCE -->
<uses-feature android:name="android.hardware.nfc.hce" android:required="true" />

<!-- HCE Service Registration -->
<service android:name=".MyHostApduService" android:exported="true"
         android:permission="android.permission.BIND_NFC_SERVICE">
    <intent-filter>
        <action android:name="android.nfc.cardemulation.action.HOST_APDU_SERVICE"/>
    </intent-filter>
    <meta-data android:name="android.nfc.cardemulation.host_apdu_service"
               android:resource="@xml/apduservice"/>
</service>
```

### Expo Setup (Managed vs Bare)
- **Managed Workflow:** Supported via **Development Builds**.
- **Requirement:** You **cannot** use Expo Go. You must use `npx expo prebuild` and create a custom development client.
- **Config Plugin:** Use the `react-native-nfc-manager` config plugin in `app.json`.

## 5. Proof of Concept (PoC) Code Snippets

### **A. Receiver Side (Emulating a Tag via HCE)**
Using a conceptual HCE library or custom module:
```javascript
import HCE from 'react-native-hce';

const startPaymentBroadcasting = async (paymentUri) => {
  const content = new HCE.NDEFRecord.URI(paymentUri);
  const tag = new HCE.NFCTag(HCE.TYPE_4, content);
  
  await HCE.setTag(tag);
  await HCE.start();
  console.log("Receiver is ready to be scanned!");
};
```

### **B. Sender Side (Reading the Receiver)**
Using `react-native-nfc-manager`:
```javascript
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

const scanReceiver = async () => {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const tag = await NfcManager.getTag();
    console.log("Payment Data Received:", tag.ndefMessage);
  } catch (ex) {
    console.warn(ex);
  } finally {
    NfcManager.cancelTechnologyRequest();
  }
};
```

## 6. Recommendations & Next Steps

1.  **Architecture:** Adopt the **Reader/HCE model**. Do not attempt legacy P2P/Beam APIs.
2.  **Fallback:** Always provide a **QR Code** as a fallback. NFC positioning can be finicky for some users.
3.  **Cross-Platform Note:** Since iOS blocks HCE, the "Receiver" (Merchant) should ideally be an Android device, or use a QR code if the Receiver is an iPhone. iPhones can still be the "Sender" (Payer) as they can read Android HCE tags.
4.  **Payload:** Keep the data payload under **512 bytes** (e.g., a simple transaction ID or deep link) to ensure a "tap" takes less than 200ms.
