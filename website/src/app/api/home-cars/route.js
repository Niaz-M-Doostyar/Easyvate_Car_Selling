import { NextResponse } from 'next/server';
import { getHomeCars, getCarouselItems, getTestimonials, getChooseVideo } from '@/lib/db';

export async function GET(request) {
  try {
    // Extract locale from query string, default to 'en'
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const [cars, carousel, testimonials, chooseVideo] = await Promise.all([
      getHomeCars(),
      getCarouselItems(),
      getTestimonials(locale),        // pass the locale
      getChooseVideo()
    ]);
    return NextResponse.json({ cars, carousel, testimonials, chooseVideo });
  } catch (error) {
    console.error('Home data API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}