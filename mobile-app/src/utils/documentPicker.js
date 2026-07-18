import * as DocumentPicker from 'expo-document-picker';

export const getDocumentAsync = async (options = {}) => {
  return DocumentPicker.getDocumentAsync(options);
};
