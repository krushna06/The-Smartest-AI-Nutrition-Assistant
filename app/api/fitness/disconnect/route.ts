import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    cookies().delete('google_access_token');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google Fit:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Fit' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
