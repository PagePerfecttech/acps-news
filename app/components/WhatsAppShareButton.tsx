'use client';

import { useState, useEffect, useRef } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../contexts/SettingsContext';
import { getDescriptionFromElement } from '../utils/textUtils';

interface WhatsAppShareButtonProps {
  title: string;
  elementId: string;
}

export default function WhatsAppShareButton({ title, elementId }: WhatsAppShareButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { settings } = useSettings();

  // Show button after scrolling a bit
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation effect
  useEffect(() => {
    if (isVisible) {
      const animationInterval = setInterval(() => {
        setIsAnimating(prev => !prev);
      }, 2000);

      return () => clearInterval(animationInterval);
    }
  }, [isVisible]);

  const handleWhatsAppShare = () => {
    try {
      // Get share link from settings
      const shareLink = settings?.share_link || 'https://flipnews.vercel.app';

      // Get description from the article element
      const articleElement = document.getElementById(elementId);
      const description = getDescriptionFromElement(articleElement, 40);

      // Create share text
      const shareText = `${title}\n\n${description}\n\nRead More: ${shareLink}`;

      // Encode for URL
      const encodedText = encodeURIComponent(shareText);

      // Check if mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Create appropriate WhatsApp URL
      const whatsappUrl = isMobile
        ? `whatsapp://send?text=${encodedText}`
        : `https://web.whatsapp.com/send?text=${encodedText}`;

      // Try to open WhatsApp
      window.open(whatsappUrl, '_blank');

      // Fallback for mobile if the app link doesn't work
      if (isMobile) {
        setTimeout(() => {
          window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
        }, 800);
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      alert('Could not open WhatsApp. Please try sharing manually.');
    }
  };

  if (!isVisible) return null;

  return (
    <button
      ref={buttonRef}
      onClick={handleWhatsAppShare}
      className={`fixed right-4 z-50 flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg p-3 transition-all duration-300 hover:bg-green-600 ${
        isAnimating ? 'whatsapp-pulse' : ''
      }`}
      style={{
        bottom: '80px',
        transform: isVisible ? 'translateX(0)' : 'translateX(100px)'
      }}
      aria-label="Share on WhatsApp"
    >
      <FaWhatsapp size={28} />
    </button>
  );
}
