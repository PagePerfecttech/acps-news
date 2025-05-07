'use client';

import { useState, useEffect } from 'react';
import { FiRss } from 'react-icons/fi';
import { isSupabaseConfigured } from '../../lib/supabase';
import AdminLayout from '../../components/AdminLayout';
import RssFeedManager from '../../components/RssFeedManager';
import EnvironmentStatus from '../../components/EnvironmentStatus';

export default function RssPage() {
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSupabase = async () => {
      const configured = await isSupabaseConfigured();
      setSupabaseConfigured(configured);
      setLoading(false);
    };

    checkSupabase();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">RSS Feeds</h1>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : !supabaseConfigured ? (
            <div className="space-y-4">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                <p className="font-medium">Supabase is not configured</p>
                <p className="mt-1">RSS feeds require a database connection. Please set up your Supabase environment variables to use this feature.</p>
              </div>

              <EnvironmentStatus showDetails={true} />
            </div>
          ) : (
            <RssFeedManager />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
