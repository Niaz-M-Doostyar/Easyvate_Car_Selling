import { NextResponse } from 'next/server';
import { getAboutData } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const payload = await getAboutData(locale);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('About API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}