import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL + '/api/auth/google/callback'
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const cookieStore = cookies();

  if (!code) {
    return new NextResponse('Authorization code not found', { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    const response = NextResponse.redirect(new URL('/', request.url));

    response.cookies.set({
      name: 'google_access_token',
      value: tokens.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    if (tokens.refresh_token) {
      response.cookies.set({
        name: 'google_refresh_token',
        value: tokens.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Error during Google OAuth callback:', error);
    return new NextResponse('Authentication failed', { status: 500 });
  }
}
