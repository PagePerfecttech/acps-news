'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TempIndex() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the static page
    router.push('/static');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Redirecting to static page...</p>
      </div>
    </div>
  );
}
