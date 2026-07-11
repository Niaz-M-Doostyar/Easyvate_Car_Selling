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
  phone: '0700000000',
  email: 'info@gmail.com',
  facebook: 'facebook.com',
  instagram: 'instagram.com',
  x: 'x.com',
  youtube: 'youtube.com',
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
});

export const mergeAboutWithFallback = (value) => ({
  ...FALLBACK_ABOUT,
  ...(isPlainObject(value) ? value : {}),
});

export const mergeContactWithFallback = (value) => ({
  ...FALLBACK_CONTACT,
  ...(isPlainObject(value) ? value : {}),
});

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