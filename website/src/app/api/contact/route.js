import { NextResponse } from 'next/server';
import { getContactData } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const contacts = await getContactData(locale);
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}