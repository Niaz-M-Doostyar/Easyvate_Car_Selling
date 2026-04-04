import { Linking, Alert } from 'react-native';


export const openLink = async (url) => {
  if (!url) return;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Cannot Open', 'Your device cannot handle this type of link.');
    }
  } catch {
    Alert.alert('Error', 'Could not open the link. Please try again.');
  }
};
