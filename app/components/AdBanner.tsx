'use client';

import Image from 'next/image';
import { Ad } from '../types';

interface AdBannerProps {
  ad: Ad;
  fullScreen?: boolean;
}

export default function AdBanner({ ad, fullScreen = false }: AdBannerProps) {
  // Handle invalid or undefined ad objects
  if (!ad || !ad.id || ad.active === false) {
    // Return a fallback ad banner
    return (
      <div className={`${fullScreen ? 'h-full' : 'h-[200px]'} w-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center`}>
        <span className="text-gray-500 text-lg font-medium">Advertisement Placeholder</span>
      </div>
    );
  }

  // Function to render the appropriate ad content based on type
  const renderAdContent = () => {
    if (ad.video_url && ad.video_type === 'youtube') {
      // Extract YouTube video ID
      const videoId = ad.video_url.split('v=')[1]?.split('&')[0];

      return (
        <div className={`relative ${fullScreen ? 'h-[40vh]' : 'h-[200px]'} w-full`}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
            title={ad.title}
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      );
    } else if (ad.video_url) {
      // Uploaded video
      return (
        <div className={`relative ${fullScreen ? 'h-[40vh]' : 'h-[200px]'} w-full`}>
          <video
            src={ad.video_url}
            controls
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
          />
        </div>
      );
    } else if (ad.image_url) {
      // Image
      return (
        <div className={`relative ${fullScreen ? 'h-[40vh]' : 'h-[200px]'} w-full`}>
          <Image
            src={ad.image_url}
            alt={ad.title}
            fill
            className="object-cover"
          />
        </div>
      );
    } else if (ad.text_content) {
      // Text-only ad
      return (
        <div className={`${fullScreen ? 'h-[40vh]' : 'h-[200px]'} w-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center p-4`}>
          <p className="text-center text-lg font-bold text-gray-800">{ad.text_content}</p>
        </div>
      );
    }

    // Fallback
    return (
      <div className={`${fullScreen ? 'h-[40vh]' : 'h-[200px]'} w-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center`}>
        <span className="text-white text-xl font-bold">Advertisement</span>
      </div>
    );
  };

  // Full screen ad layout
  if (fullScreen) {
    return (
      <div className="w-full h-full flex flex-col bg-white">
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative flex-grow flex flex-col"
        >
          {/* Ad label */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs font-bold px-2 py-1 z-10 rounded-full">
            Advertisement
          </div>

          {/* Render the appropriate ad content */}
          <div className="flex-grow flex flex-col justify-center">
            {renderAdContent()}
          </div>

          <div className="p-6 flex flex-col">
            <h3 className="font-bold text-xl mb-2">{ad.title}</h3>
            {ad.description && (
              <p className="text-gray-700 text-base mb-4">{ad.description}</p>
            )}
            <div className="mt-auto flex justify-center">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-full text-base transition-colors">
                Learn More
              </button>
            </div>
          </div>

          {/* Removed swipe instruction */}
        </a>
      </div>
    );
  }

  // Regular ad layout (for non-fullscreen)
  return (
    <div className="w-full overflow-hidden shadow-lg bg-white rounded-lg">
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative"
      >
        {/* Ad label */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs font-bold px-2 py-1 z-10 rounded-full">
          Ad
        </div>

        {/* Render the appropriate ad content */}
        {renderAdContent()}

        <div className="p-4">
          <h3 className="font-bold text-lg">{ad.title}</h3>
          {ad.description && (
            <p className="text-gray-700 text-sm mt-1">{ad.description}</p>
          )}
          <div className="mt-3 flex justify-end">
            <button className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-full">
              Learn More
            </button>
          </div>
        </div>
      </a>
    </div>
  );
}
