import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// Helper to get the current month in YYYY-MM format
function getCurrentMonthKey() {
  const now = new Date();
  //
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

// API function to GET the current stats
export async function GET() {
  const monthKey = getCurrentMonthKey();
  const visitsKey = `visits:${monthKey}`;
  const downloadsKey = `downloads:${monthKey}`;

  try {
    const [visits, downloads] = await Promise.all([
      kv.get(visitsKey),
      kv.get(downloadsKey)
    ]);
    
    // Return 0 if the values are null (first time for the month)
    return NextResponse.json({
      visits: visits || 0,
      downloads: downloads || 0,
    });

  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// API function to POST (increment) a stat
export async function POST(request) {
  const { statToIncrement } = await request.json();
  const monthKey = getCurrentMonthKey();

  if (statToIncrement !== 'visits' && statToIncrement !== 'downloads') {
    return new NextResponse('Invalid stat type', { status: 400 });
  }

  const key = `${statToIncrement}:${monthKey}`;

  try {
    const newValue = await kv.incr(key); // Atomically increment the value
    return NextResponse.json({ success: true, newValue });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}