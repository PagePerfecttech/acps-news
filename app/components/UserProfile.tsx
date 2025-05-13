'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getUserById } from '../lib/userService';
import { User } from '../types';

interface UserProfileProps {
  authorName: string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

export default function UserProfile({ authorName = 'Unknown', size = 'small', showName = true }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Ensure authorName is a string
  const safeAuthorName = authorName || 'Unknown';

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // In a real app, we would search for users by name
        // For now, we'll create a mock user based on the author name
        const mockUser: User = {
          id: '1',
          email: `${safeAuthorName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          name: safeAuthorName,
          role: 'contributor',
          created_at: new Date().toISOString(),
          profile_pic: '' // No profile pic for mock user
        };
        setUser(mockUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [safeAuthorName]);

  // Size classes
  const sizeClasses = {
    small: {
      container: 'h-6 w-6',
      text: 'text-xs'
    },
    medium: {
      container: 'h-8 w-8',
      text: 'text-sm'
    },
    large: {
      container: 'h-10 w-10',
      text: 'text-base'
    }
  };

  // If loading or user not found, show placeholder
  if (loading || !user) {
    return (
      <div className="flex items-center">
        <div className={`${sizeClasses[size].container} rounded-full bg-gray-200 flex items-center justify-center text-gray-500`}>
          {safeAuthorName.charAt(0).toUpperCase()}
        </div>
        {showName && (
          <span className={`ml-2 ${sizeClasses[size].text} text-gray-700`}>{safeAuthorName}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className={`${sizeClasses[size].container} relative`}>
        {user.profile_pic ? (
          <Image
            src={user.profile_pic}
            alt={user.name}
            fill
            className="rounded-full object-cover"
          />
        ) : (
          <div className={`${sizeClasses[size].container} rounded-full bg-gray-200 flex items-center justify-center text-gray-500`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {showName && (
        <span className={`ml-2 ${sizeClasses[size].text} text-gray-700`}>{user.name}</span>
      )}
    </div>
  );
}
