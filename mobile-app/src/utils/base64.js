const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let result = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = index + 1 < bytes.length ? bytes[index + 1] : 0;
    const third = index + 2 < bytes.length ? bytes[index + 2] : 0;
    const hasSecond = index + 1 < bytes.length;
    const hasThird = index + 2 < bytes.length;

    result += BASE64_CHARS[first >> 2];
    result += BASE64_CHARS[((first & 3) << 4) | (second >> 4)];
    result += hasSecond ? BASE64_CHARS[((second & 15) << 2) | (third >> 6)] : '=';
    result += hasThird ? BASE64_CHARS[third & 63] : '=';
  }

  return result;
}