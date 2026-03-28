import { NextResponse } from 'next/server';
import { getVehicleById } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    // ✅ Await the params Promise
    const { id } = await params;

    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error('Vehicle detail API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}