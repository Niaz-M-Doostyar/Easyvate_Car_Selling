import { pick } from '@react-native-documents/picker';

const mapType = (type) => {
  if (!type || type === '*/*') return ['public.item'];
  if (type === 'image/*') return ['public.image'];
  if (type === 'video/*') return ['public.movie'];
  if (type === 'text/plain') return ['public.plain-text'];
  return ['public.item'];
};

const mapTypes = (types) => {
  if (!Array.isArray(types)) return mapType(types);
  const mapped = types.flatMap(mapType);
  return [...new Set(mapped)];
};

export const getDocumentAsync = async (options = {}) => {
  const { type = '*/*', multiple = false } = options;
  const rnTypes = Array.isArray(type) ? mapTypes(type) : mapType(type);
  try {
    const results = await pick({
      type: rnTypes,
      allowMultiSelection: multiple,
      mode: 'open'
    });
    const assets = results.map((r) => ({ uri: r.uri, name: r.name, mimeType: r.type }));
    return { canceled: false, assets };
  } catch (e) {
    if (e.code === 'DOCUMENT_PICKER_CANCELED') return { canceled: true, assets: [] };
    throw e;
  }
};
