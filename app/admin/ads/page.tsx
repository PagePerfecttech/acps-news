'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiEdit, FiTrash2, FiPlus, FiEye, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { Ad } from '../../types';
import { getAds, deleteAd, updateAd } from '../../lib/dataService';

export default function AdManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ads, setAds] = useState<Ad[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load ads when component mounts
  useEffect(() => {
    const loadedAds = getAds();
    setAds(loadedAds);
  }, []);

  // Filter ads based on search term and status
  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ad.description && ad.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (ad.text_content && ad.text_content.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && ad.active) ||
                         (statusFilter === 'inactive' && !ad.active);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleToggleStatus = (id: string) => {
    try {
      // Find the ad
      const adToUpdate = ads.find(ad => ad.id === id);

      if (!adToUpdate) {
        throw new Error('Ad not found');
      }

      // Toggle the status
      const updatedAd: Ad = {
        ...adToUpdate,
        active: !adToUpdate.active,
        updated_at: new Date().toISOString()
      };

      // Update the ad
      const success = updateAd(updatedAd);

      if (success) {
        // Update the ads list
        setAds(prev => prev.map(ad => ad.id === id ? updatedAd : ad));
        setMessage({
          type: 'success',
          text: `Ad ${updatedAd.active ? 'activated' : 'deactivated'} successfully!`
        });

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        throw new Error('Failed to update ad status');
      }
    } catch (error) {
      console.error('Error updating ad status:', error);
      setMessage({ type: 'error', text: 'Failed to update ad status. Please try again.' });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      setIsDeleting(true);

      try {
        const success = deleteAd(id);

        if (success) {
          // Update the ads list
          setAds(prev => prev.filter(ad => ad.id !== id));
          setMessage({ type: 'success', text: 'Ad deleted successfully!' });

          // Clear message after 3 seconds
          setTimeout(() => {
            setMessage({ type: '', text: '' });
          }, 3000);
        } else {
          throw new Error('Failed to delete ad');
        }
      } catch (error) {
        console.error('Error deleting ad:', error);
        setMessage({ type: 'error', text: 'Failed to delete ad. Please try again.' });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getAdType = (ad: Ad) => {
    if (ad.video_url && ad.video_type === 'youtube') return 'YouTube Video';
    if (ad.video_url) return 'Uploaded Video';
    if (ad.image_url && !ad.video_url) return 'Image';
    if (ad.text_content && !ad.image_url && !ad.video_url) return 'Text Only';
    return 'Unknown';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ad Management</h1>
        <Link
          href="/admin/ads/add"
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add New Ad
        </Link>
      </div>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by title or content..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-1/4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {ad.image_url && (
                        <div className="flex-shrink-0 h-16 w-16 mr-4 relative">
                          <Image
                            src={ad.image_url}
                            alt={ad.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">
                          {ad.description || ad.text_content || 'No description'}
                        </div>
                        <div className="text-xs text-blue-500 mt-1">
                          {ad.link_url}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getAdType(ad)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Every {ad.frequency} articles
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(ad.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(ad.id)}
                      className={`flex items-center ${
                        ad.active ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {ad.active ? (
                        <>
                          <FiToggleRight size={24} className="mr-1" />
                          <span className="text-xs font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <FiToggleLeft size={24} className="mr-1" />
                          <span className="text-xs font-medium">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/ads/edit/${ad.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 size={18} />
                      </button>
                      <Link
                        href={ad.link_url}
                        target="_blank"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <FiEye size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAds.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No ads found. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  );
}
