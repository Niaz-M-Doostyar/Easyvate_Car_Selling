import { NextResponse } from 'next/server';
import { getTeamData } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const members = await getTeamData(locale);
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Team API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}