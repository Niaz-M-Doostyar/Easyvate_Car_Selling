import { asObject, ensureArray, isHtmlPayload, isPlainObject } from '../utils/apiResponse';

export const FALLBACK_ABOUT = {
  name: 'Niazi Khpalwak Car Showroom',
  title: 'Welcome to Niazi Khpalwak Car Showroom',
  subtitle: 'Your Trusted Platform for Buying and Selling Vehicles',
  description: 'Niazay Khpalwak Car Showroom is a trusted platform for buying, selling, and exchanging quality vehicles. We focus on reliable cars, transparent pricing, and smooth customer service for buyers across Afghanistan.',
};

export const FALLBACK_CONTACT = {
  id: 'main-branch',
  branchName: 'Niazi Khpalwak Car Showroom (Main Branch)',
  phone: null,
  email: null,
  facebook: null,
  tiktok: null,
  instagram: null,
  x: null,
  youtube: null,
  weekdays: 'Sat-Thur 08:00 AM - 05:00 PM',
  friday: 'Fri 08:00 AM - 12:00 PM',
  address: 'Spin Boldak Highway, Kandahar, Afghanistan',
};

const hasAboutContent = (value) => Boolean(value && (value.title || value.subtitle || value.description || value.name));

const hasContactContent = (value) => Boolean(value && (value.phone || value.email || value.address || value.branchName));

const normalizeContact = (value) => ({
  ...value,
  phone: value?.phone ? String(value.phone).trim() : value?.phone,
  email: value?.email ? String(value.email).trim() : value?.email,
  x: value?.x || value?.twitter || null,
  tiktok: value?.tiktok || value?.tikTok || null,
});

export const mergeAboutWithFallback = (value) => ({
  ...FALLBACK_ABOUT,
  ...(isPlainObject(value) ? value : {}),
});

export const mergeContactWithFallback = (value) => ({
  ...FALLBACK_CONTACT,
  ...(isPlainObject(value) ? normalizeContact(value) : {}),
});

const hasContactValue = (value) => value !== null
  && value !== undefined
  && (typeof value !== 'string' || value.trim().length > 0);

// Contact details such as phone numbers and social links are often entered only
// once in English, while the localized tables contain just the translated branch
// name/address. Preserve every localized value and fill only blank fields from
// the matching English contact.
export const mergeLocalizedContact = (localized, english) => {
  const fallback = isPlainObject(english) ? normalizeContact(english) : {};
  const translated = isPlainObject(localized) ? normalizeContact(localized) : {};
  const localizedValues = Object.fromEntries(
    Object.entries(translated).filter(([, value]) => hasContactValue(value)),
  );

  return mergeContactWithFallback({ ...fallback, ...localizedValues });
};

export const mergeLocalizedContacts = (localizedContacts, englishContacts) => {
  const localized = ensureArray(localizedContacts).filter(hasContactContent);
  const english = ensureArray(englishContacts).filter(hasContactContent);

  if (!localized.length) return english.map(contact => mergeLocalizedContact(null, contact));

  return localized.map((contact, index) => {
    const matchingEnglish = english.find(candidate => candidate?.id === contact?.id)
      || english[index]
      || english[0]
      || null;
    return mergeLocalizedContact(contact, matchingEnglish);
  });
};

export const selectPrimaryContact = (contacts) => {
  const usable = ensureArray(contacts).filter(hasContactContent);
  if (!usable.length) return null;
  return [...usable].sort((a, b) => {
    const aTime = Date.parse(a?.updatedAt || a?.createdAt || '') || 0;
    const bTime = Date.parse(b?.updatedAt || b?.createdAt || '') || 0;
    if (aTime !== bTime) return bTime - aTime;
    return (Number(b?.id) || 0) - (Number(a?.id) || 0);
  })[0];
};

// Convert Afghanistan numbers entered in the admin as 070..., 70..., 0093...
// or +93... into an international number suitable for tel: and wa.me links.
export const normalizePhone = (value, countryCode = '93') => {
  if (value === null || value === undefined) return '';
  const digits = String(value)
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith(countryCode)) return digits;
  if (digits.startsWith('0')) return `${countryCode}${digits.slice(1)}`;
  return `${countryCode}${digits}`;
};

export const phoneUrl = (value) => {
  const phone = normalizePhone(value);
  return phone ? `tel:+${phone}` : null;
};

export const whatsappUrl = (value) => {
  const phone = normalizePhone(value);
  return phone ? `https://wa.me/${phone}` : null;
};

export const socialUrl = (value) => {
  const url = String(value || '').trim();
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

export const extractAboutPayload = (payload) => {
  if (!payload || isHtmlPayload(payload)) {
    return { about: null, logos: [] };
  }

  const root = asObject(payload);
  const nested = asObject(root.data);
  const about = [root.about, nested.about, root, nested].find(hasAboutContent) || null;
  const logos = [root.logos, nested.logos].find(Array.isArray) || [];

  return { about, logos };
};

export const extractTeamMembers = (payload) => {
  if (!payload || isHtmlPayload(payload)) {
    return [];
  }

  const root = asObject(payload);
  const nested = asObject(root.data);

  return [
    root.members,
    nested.members,
    Array.isArray(root.data) ? root.data : null,
    Array.isArray(payload) ? payload : null,
  ].find(Array.isArray) || [];
};

export const extractContacts = (payload) => {
  if (!payload || isHtmlPayload(payload)) {
    return [];
  }

  const root = asObject(payload);
  const nested = asObject(root.data);
  const arrayCandidate = [
    root.contacts,
    nested.contacts,
    Array.isArray(root.data) ? root.data : null,
    Array.isArray(payload) ? payload : null,
  ].find(Array.isArray);

  if (arrayCandidate?.length) {
    return arrayCandidate.filter(Boolean).map(normalizeContact);
  }

  const single = [root.contact, nested.contact, root, nested].find(hasContactContent);
  return ensureArray(single).map(normalizeContact);
};
