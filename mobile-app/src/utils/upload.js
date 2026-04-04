export const toMultipartFile = (asset, fallbackType = 'application/octet-stream') => ({
  uri: asset.uri,
  name: asset.name || `upload-${Date.now()}`,
  type: asset.mimeType || asset.type || fallbackType,
});

export const buildMultipartData = (fields = {}, files = []) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, String(value));
  });

  files.forEach(({ fieldName, asset, fallbackType }) => {
    if (!asset) return;
    formData.append(fieldName, toMultipartFile(asset, fallbackType));
  });

  return formData;
};