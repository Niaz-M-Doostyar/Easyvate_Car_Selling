// app/api/footer/route.js
import { NextResponse } from 'next/server';
import { getContactData } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const contacts = await getContactData(locale);
    const contact = contacts.length > 0 ? contacts[0] : null;
    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Footer API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}