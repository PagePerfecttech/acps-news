'use client';

import { useState } from 'react';
import { FiShare2 } from 'react-icons/fi';
import ShareModal from './ShareModal';

interface ShareButtonProps {
  title: string;
  elementId: string;
  className?: string;
  iconSize?: number;
}

export default function ShareButton({ 
  title, 
  elementId, 
  className = '', 
  iconSize = 20 
}: ShareButtonProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <button 
        onClick={handleShare} 
        className={`flex items-center justify-center ${className}`}
        aria-label="Share"
      >
        <FiShare2 size={iconSize} />
      </button>
      
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        title={title} 
        elementId={elementId} 
      />
    </>
  );
}
