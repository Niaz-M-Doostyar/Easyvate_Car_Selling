// The legacy namespace keeps createDownloadResumable available across the
// Expo SDK used by both the Android and iOS builds.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADMIN_API_URL } from '../api/config';
import apiClient from '../api/client';
import { bytesToBase64 } from './base64';

async function sharePdf(uri, dialogTitle) {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle, UTI: 'com.adobe.pdf' });
    }
  } catch (_) {
    // The PDF is still saved when an emulator has no share target.
  }
}

/** Download a protected backend PDF directly to the device filesystem. */
export async function downloadAndSharePdf(path, fileName, dialogTitle) {
  const token = await AsyncStorage.getItem('token');
  const destination = `${FileSystem.documentDirectory}${fileName}`;
  // A previous export can leave the same filename behind.  Remove it first so
  // Android does not reject the native download as a duplicate destination.
  await FileSystem.deleteAsync(destination, { idempotent: true });
  if (Platform.OS === 'ios') {
    // iOS simulator background URLSession is unreliable for protected PDF
    // downloads (it can fail before the request reaches the server). Use the
    // authenticated Axios client and write the response directly instead.
    const response = await apiClient.get(path, { responseType: 'arraybuffer', timeout: 120000 });
    if (response.status < 200 || response.status >= 300) throw new Error(`PDF request failed (${response.status})`);
    await FileSystem.writeAsStringAsync(destination, bytesToBase64(response.data), { encoding: FileSystem.EncodingType.Base64 });
  } else {
    const task = FileSystem.createDownloadResumable(
      `${ADMIN_API_URL}${path}`,
      destination,
      { headers: token ? { Authorization: `Bearer ${token}`, Accept: 'application/pdf' } : { Accept: 'application/pdf' } },
    );
    const result = await task.downloadAsync();
    if (!result || result.status < 200 || result.status >= 300) {
      throw new Error(`PDF request failed (${result?.status || 'unknown'})`);
    }
  }
  await sharePdf(destination, dialogTitle);
  return destination;
}
