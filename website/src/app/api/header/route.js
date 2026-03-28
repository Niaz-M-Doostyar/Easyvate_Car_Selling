// app/api/header/route.js
import { NextResponse } from 'next/server';
import { getContactData } from '@/lib/db';

export async function GET() {
  try {
    // Fetch the first contact record for English (adjust language as needed)
    const contacts = await getContactData('en');
    const contact = contacts.length > 0 ? contacts[0] : null;
    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Header API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}