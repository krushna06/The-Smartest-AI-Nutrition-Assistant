import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function getProfilePictureUrl(pictureUrl?: string | null): string | undefined {
  if (!pictureUrl) return undefined;
  
  let secureUrl = pictureUrl.startsWith('http://') 
    ? pictureUrl.replace('http://', 'https://')
    : pictureUrl;
    
  if (secureUrl.includes('googleusercontent.com')) {
    secureUrl = secureUrl.replace(/=s\d+(-c)?/g, '');
    secureUrl += '=s96-c';
  }
  
  return secureUrl;
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      acc[name] = value;
    }
    return acc;
  }, {});
  
  const accessToken = cookies['google_access_token'];

  if (!accessToken) {
    return new NextResponse('Not authenticated', { 
      status: 401,
      headers: {
        'Set-Cookie': [
          'google_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;',
          'google_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        ].join(', ')
      }
    });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const userInfo = await oauth2.userinfo.get();
    
    const pictureUrl = getProfilePictureUrl(userInfo.data.picture || undefined);

    return NextResponse.json({
      name: userInfo.data.name,
      email: userInfo.data.email,
      picture: pictureUrl,
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return new NextResponse('Authentication failed', { 
      status: 401,
      headers: {
        'Set-Cookie': [
          'google_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;',
          'google_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        ].join(', ')
      }
    });
  }
}
