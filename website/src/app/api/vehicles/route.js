// app/api/vehicles/route.js
import { NextResponse } from 'next/server';
import { getAllVehicles } from '@/lib/db';

export async function GET() {
  try {
    const vehicles = await getAllVehicles();
    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Vehicles API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}