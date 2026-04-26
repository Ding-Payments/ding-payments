import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import NfcManager, { NfcEvents, Ndef } from 'react-native-nfc-manager';

const NFCDemo = () => {
  const [hasNfc, setHasNfc] = useState<boolean | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [tag, setTag] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    async function checkNfc() {
      const supported = await NfcManager.isSupported();
      setHasNfc(supported);
      if (supported) {
        await NfcManager.start();
      }
    }
    checkNfc();
  }, []);

  const startScan = async () => {
    try {
      setIsScanning(true);
      setTag(null);
      // On iOS, this triggers the system NFC dialog
      await NfcManager.requestTechnology([NfcManager.requestTechnology.ndef]);
      const foundTag = await NfcManager.getTag();
      setTag(foundTag);
    } catch (ex) {
      console.warn(ex);
    } finally {
      NfcManager.cancelTechnologyRequest();
      setIsScanning(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>NFC Capability Validator</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Device Status</Text>
        <Text style={styles.statusText}>
          NFC Supported: {hasNfc === null ? 'Checking...' : hasNfc ? '✅ Yes' : '❌ No'}
        </Text>
        {Platform.OS === 'ios' && (
          <Text style={styles.infoText}>
            Note: On iOS, NFC requires a physical device and a Development Build.
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Peer-to-Peer (P2P) Validation</Text>
        <Text style={styles.warningText}>
          ⚠️ Status: NOT SUPPORTED ON IOS
        </Text>
        <Text style={styles.descText}>
          The `react-native-nfc-manager` and Apple's Core NFC do not expose P2P APIs. 
          The only supported mode for third-party apps is Reader/Writer.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Test Reader Mode</Text>
        <TouchableOpacity 
          style={[styles.button, isScanning && styles.buttonDisabled]} 
          onPress={startScan}
          disabled={!hasNfc || isScanning}
        >
          <Text style={styles.buttonText}>
            {isScanning ? 'Scanning...' : 'Scan NDEF Tag'}
          </Text>
        </TouchableOpacity>
        
        {tag && (
          <View style={styles.tagInfo}>
            <Text style={styles.tagTitle}>Tag Detected!</Text>
            <Text style={styles.tagContent}>{JSON.stringify(tag, null, 2)}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recommended Direction</Text>
        <Text style={styles.descText}>
          Since P2P NFC is unavailable, we recommend using **QR Codes** for the Ding Payments P2P flow. 
          QR codes provide a similar "proximity" experience without the restrictive iOS hardware gatekeeping.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#208AEF',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  warningText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#208AEF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tagInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  tagTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tagContent: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  }
});

export default NFCDemo;
