import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getFitnessData } from '@/app/services/googleFitService';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('google_access_token')?.value;
  
  if (!accessToken) {
    return new NextResponse('Not authenticated', { status: 401 });
  }

  try {
    const data = await getFitnessData(accessToken);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching fitness data:', error);
    return new NextResponse('Failed to fetch fitness data', { status: 500 });
  }
}
