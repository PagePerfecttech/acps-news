'use client';

import AdminLayout from '../../components/AdminLayout';
import RssFeedManager from '../../components/RssFeedManager';

export default function RssPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">RSS Feeds</h1>
          <RssFeedManager />
        </div>
      </div>
    </AdminLayout>
  );
}
