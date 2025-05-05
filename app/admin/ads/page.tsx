'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiEdit, FiTrash2, FiPlus, FiEye, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { Ad } from '../../types';

// Mock data for demonstration
const mockAds: Ad[] = [
  {
    id: '1',
    title: 'ప్రీమియం సబ్‌స్క్రిప్షన్ - అన్లిమిటెడ్ యాక్సెస్ పొందండి',
    description: 'ఇప్పుడే సబ్‌స్క్రైబ్ చేసుకొని యాడ్-ఫ్రీ రీడింగ్, ఎక్స్‌క్లూజివ్ కంటెంట్ మరియు మరిన్ని ఆనందించండి!',
    image_url: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1470&auto=format&fit=crop',
    link_url: '/subscribe',
    frequency: 3, // Show after every 3 articles
    active: true,
    created_at: '2023-05-01T00:00:00Z',
    updated_at: '2023-05-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'నూతన స్మార్ట్‌ఫోన్ లాంచ్',
    description: 'అత్యాధునిక ఫీచర్లతో కొత్త స్మార్ట్‌ఫోన్ మార్కెట్లోకి',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_type: 'youtube',
    link_url: '/smartphone',
    frequency: 5,
    active: true,
    created_at: '2023-05-02T00:00:00Z',
    updated_at: '2023-05-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'ఆన్‌లైన్ షాపింగ్ ఆఫర్స్',
    text_content: 'ఇప్పుడే కొనుగోలు చేసి 50% వరకు పొదుపు చేయండి!',
    image_url: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1470&auto=format&fit=crop',
    link_url: '/shopping',
    frequency: 4,
    active: false,
    created_at: '2023-05-03T00:00:00Z',
    updated_at: '2023-05-03T00:00:00Z',
  }
];

export default function AdManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Filter ads based on search term and status
  const filteredAds = mockAds.filter(ad => {
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
    // In a real app, this would update the database
    console.log(`Toggling status for ad with ID: ${id}`);
  };
  
  const handleDelete = (id: string) => {
    // In a real app, this would delete from the database
    console.log(`Deleting ad with ID: ${id}`);
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
