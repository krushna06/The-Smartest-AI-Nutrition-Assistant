'use client';

import { useEffect, useState, memo } from 'react';
import Image from 'next/image';
import { Loader2, User as UserIcon } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { makeApiCall } from '@/app/utils/api';

interface UserProfileProps {
  isCollapsed: boolean;
}

type UserProfileData = {
  name: string;
  picture: string;
  email: string;
} | null;



const UserProfile = ({ isCollapsed }: UserProfileProps) => {
  const [profile, setProfile] = useState<UserProfileData>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await makeApiCall('/api/auth/me');
      setProfile(data);
    } catch (error: any) {
      if (error.message.includes('401')) {
        setProfile(null);
        document.cookie = 'google_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'google_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      } else {
        console.error('Failed to fetch user profile:', error);
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'google_access_token' && !e.newValue) {
        setProfile(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = () => {
    setIsLoggingIn(true);
    window.location.href = '/api/auth/google';
  };


  const getProfilePictureUrl = (url: string) => {
    if (!url) return url;
    if (url.includes('googleusercontent.com')) {
      return url.replace(/=s\d+(-c)?/g, '=s96-c');
    }
    return url;
  };

  if (isLoading) {
    return null;
  }

  if (!profile) {
    return (
      <div className={`p-4 border-t border-gray-700 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start w-full'} text-gray-300`}
          title={isCollapsed ? 'Connect Fit' : ''}
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <FaGoogle className="w-5 h-5" />
              {!isCollapsed && <span className="ml-3 text-sm">Connect Fit</span>}
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 border-t border-gray-700 ${isCollapsed ? 'flex justify-center' : ''}`}>
      <div className="flex items-center space-x-3 min-w-0">
        <div className="relative w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
          {profile.picture ? (
            <Image
              src={getProfilePictureUrl(profile.picture)}
              alt={profile.name}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              unoptimized={true}
            />
          ) : (
            <UserIcon className="w-5 h-5 text-gray-300" />
          )}
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile.name}</p>
            <p className="text-xs text-gray-400 truncate">{profile.email}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MemoizedUserProfile = memo(UserProfile);
MemoizedUserProfile.displayName = 'UserProfile';

export { MemoizedUserProfile as UserProfile };
export type { UserProfileProps };
