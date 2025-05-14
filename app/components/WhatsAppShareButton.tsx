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

  // Always show the button
  useEffect(() => {
    // Set visible immediately
    setIsVisible(true);
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

      // Get description from the article element - with error handling
      let description = '';
      try {
        const articleElement = document.getElementById(elementId);
        if (articleElement) {
          description = getDescriptionFromElement(articleElement, 40);
        }
      } catch (descError) {
        console.warn('Error getting description:', descError);
        // Continue with empty description if there's an error
      }

      // Create share text (with fallback if description fails)
      const shareText = `${title}\n\n${description || 'Check out this interesting news article!'}\n\nRead More: ${shareLink}`;

      // Encode for URL - with error handling
      let encodedText;
      try {
        encodedText = encodeURIComponent(shareText);
      } catch (encodeError) {
        console.warn('Error encoding text:', encodeError);
        // Fallback to a simpler message if encoding fails
        encodedText = encodeURIComponent(`${title}\n\nRead More: ${shareLink}`);
      }

      // Check if mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Create appropriate WhatsApp URL
      const whatsappUrl = isMobile
        ? `whatsapp://send?text=${encodedText}`
        : `https://web.whatsapp.com/send?text=${encodedText}`;

      // Try multiple sharing methods with fallbacks
      try {
        // First try: Use window.open
        const newWindow = window.open(whatsappUrl, '_blank');

        // Check if window was blocked
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          throw new Error('Window was blocked');
        }
      } catch (windowError) {
        console.warn('Primary sharing method failed:', windowError);

        // Second try: Create and click a link
        try {
          const link = document.createElement('a');
          link.href = whatsappUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Fallback for mobile if the app link doesn't work
          if (isMobile) {
            setTimeout(() => {
              try {
                const apiUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
                const fallbackLink = document.createElement('a');
                fallbackLink.href = apiUrl;
                fallbackLink.target = '_blank';
                fallbackLink.rel = 'noopener noreferrer';
                document.body.appendChild(fallbackLink);
                fallbackLink.click();
                document.body.removeChild(fallbackLink);
              } catch (fallbackError) {
                console.warn('Mobile fallback failed:', fallbackError);
                // Last resort: Show manual instructions
                showManualSharingInstructions(shareText);
              }
            }, 800);
          }
        } catch (linkError) {
          console.warn('Secondary sharing method failed:', linkError);
          // Last resort: Show manual instructions
          showManualSharingInstructions(shareText);
        }
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      // Show user-friendly error with manual sharing instructions
      showManualSharingInstructions(title);
    }
  };

  // Helper function to show manual sharing instructions
  const showManualSharingInstructions = (textToCopy: string) => {
    try {
      // Try to copy the text to clipboard
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          alert('We couldn\'t open WhatsApp automatically.\n\n' +
                'The share text has been copied to your clipboard.\n\n' +
                'Please open WhatsApp manually and paste the text.');
        })
        .catch(() => {
          // If clipboard fails, just show instructions
          alert('We couldn\'t open WhatsApp automatically.\n\n' +
                'Please open WhatsApp manually and share the article link.');
        });
    } catch (clipboardError) {
      // If all else fails, just show a simple message
      alert('Please open WhatsApp manually to share this article.');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 right-0 top-1/2 -translate-y-1/2 flex flex-col items-center whatsapp-share-container"
      style={{
        transform: 'translateY(-50%)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Button only - no labels */}
      <button
        ref={buttonRef}
        onClick={handleWhatsAppShare}
        className={`flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg p-3 transition-all duration-300 hover:bg-green-600 ${
          isAnimating ? 'whatsapp-pulse' : ''
        }`}
        style={{
          boxShadow: '0 0 10px rgba(0,0,0,0.3)'
        }}
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp size={28} />
      </button>
    </div>
  );
}
