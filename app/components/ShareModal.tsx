'use client';

import { useState, useEffect } from 'react';
import { FiX, FiShare2, FiDownload, FiCopy, FiFacebook, FiTwitter, FiInstagram, FiLink } from 'react-icons/fi';
import { captureScreenshot, shareContent, dataUrlToFile, downloadDataUrl } from '../utils/screenshotUtil';
import { useSettings } from '../contexts/SettingsContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  elementId: string;
}

export default function ShareModal({ isOpen, onClose, title, elementId }: ShareModalProps) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { settings } = useSettings();

  // Capture screenshot when modal opens
  useEffect(() => {
    if (isOpen) {
      captureElement();
    }
  }, [isOpen]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setScreenshotUrl(null);
      setCopySuccess(false);
    }
  }, [isOpen]);

  // Capture the element as a screenshot with timeout
  const captureElement = async () => {
    setIsCapturing(true);

    // Set a timeout to ensure we don't wait too long
    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(() => {
        // Use a fallback image if it takes too long
        resolve('/images/fallback-share-image.svg');
      }, 5000); // 5 seconds timeout (increased from 3s)
    });

    try {
      // First, make sure the element is fully visible and rendered
      const element = document.getElementById(elementId);
      if (element) {
        // Ensure all images are loaded before capturing
        const images = element.querySelectorAll('img');
        if (images.length > 0) {
          await Promise.all(
            Array.from(images).map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve(); // Continue even if image fails
                // Set a timeout in case the image never loads
                setTimeout(resolve, 2000);
              });
            })
          );
        }

        // Wait a moment for any animations or transitions to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Race between screenshot capture and timeout
        const dataUrl = await Promise.race([
          captureScreenshot(element),
          timeoutPromise
        ]);

        // Verify that we got a valid data URL
        if (dataUrl.startsWith('data:image/')) {
          setScreenshotUrl(dataUrl);
        } else {
          console.error('Invalid screenshot data URL');
          setScreenshotUrl('/images/fallback-share-image.svg');
        }
      } else {
        console.error('Element not found:', elementId);
        setScreenshotUrl('/images/fallback-share-image.svg');
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      setScreenshotUrl('/images/fallback-share-image.svg');
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle share button click
  const handleShare = async () => {
    try {
      if (!screenshotUrl) return;

      // Use the share link from settings, or fallback to a default
      const shareLink = settings?.share_link || 'https://flipnews.vercel.app';
      const siteName = settings?.site_name || 'FlipNews';

      const shareText = `${title}\n\nRead More News like this at ${shareLink}`;
      const shareUrl = shareLink;

      // Create a file from the screenshot
      const file = dataUrlToFile(screenshotUrl, `${siteName}-news.png`);

      // Use the Web Share API with the screenshot
      await shareContent(title, shareText, shareUrl, [file]);
    } catch (error) {
      console.error('Error sharing content:', error);
      alert('There was an error sharing. Please try a different sharing option.');
    }
  };

  // Handle platform-specific sharing
  const handlePlatformShare = async (platform: 'whatsapp' | 'facebook' | 'twitter') => {
    try {
      if (!screenshotUrl) return;

      // Use the share link from settings, or fallback to a default
      const shareLink = settings?.share_link || 'https://flipnews.vercel.app';
      const siteName = settings?.site_name || 'FlipNews';

      const shareText = `${title}\n\nRead More News like this at ${shareLink}`;
      const shareUrl = shareLink;

      // Share to the specific platform
      await shareContent(title, shareText, shareUrl, undefined, platform);
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
    }
  };

  // Handle download button click
  const handleDownload = () => {
    if (!screenshotUrl) return;
    const siteName = settings?.site_name || 'FlipNews';
    downloadDataUrl(screenshotUrl, `${siteName}-news.png`);
  };

  // Handle copy link button click
  const handleCopyLink = () => {
    const shareLink = settings?.share_link || 'https://flipnews.vercel.app';
    const shareMessage = `${title}\n\nRead More News like this at ${shareLink}`;
    navigator.clipboard.writeText(shareMessage);
    setCopySuccess(true);

    // Reset copy success message after 2 seconds
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-yellow-500 px-4 py-3 flex justify-between items-center">
          <h3 className="font-bold text-black">Share News</h3>
          <button
            onClick={onClose}
            className="bg-yellow-600 p-1 text-black rounded-full hover:bg-yellow-700 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Screenshot preview */}
          <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
            {isCapturing ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            ) : screenshotUrl ? (
              <div className="relative">
                <img
                  src={screenshotUrl}
                  alt="News Screenshot"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-2 right-2 bg-white bg-opacity-70 px-2 py-1 rounded text-xs">
                  {settings?.site_name || 'FlipNews'}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Failed to capture screenshot
              </div>
            )}
          </div>

          {/* Share options */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={handleShare}
              disabled={!screenshotUrl}
              className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShare2 className="mr-2" />
              Share
            </button>
            <button
              onClick={handleDownload}
              disabled={!screenshotUrl}
              className="flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className="mr-2" />
              Download
            </button>
          </div>

          {/* Copy share message */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share Message
            </label>
            <div className="flex items-center">
              <textarea
                rows={3}
                value={`${title}\n\nRead More News like this at ${settings?.share_link || 'https://flipnews.vercel.app'}`}
                readOnly
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-r-md h-full"
              >
                <FiCopy />
              </button>
            </div>
            {copySuccess && (
              <p className="text-green-600 text-xs mt-1">Share message copied to clipboard!</p>
            )}
          </div>

          {/* Social media sharing */}
          <div>
            <p className="text-sm text-gray-700 mb-2">Share on social media:</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handlePlatformShare('whatsapp')}
                disabled={isCapturing}
                className="bg-green-500 text-white py-2 px-3 rounded-md hover:bg-green-600 disabled:bg-green-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>

              <button
                onClick={() => handlePlatformShare('facebook')}
                disabled={isCapturing}
                className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center"
              >
                <FiFacebook size={18} className="mr-1" />
                Facebook
              </button>

              <button
                onClick={() => handlePlatformShare('twitter')}
                disabled={isCapturing}
                className="bg-blue-400 text-white py-2 px-3 rounded-md hover:bg-blue-500 disabled:bg-blue-300 flex items-center justify-center"
              >
                <FiTwitter size={18} className="mr-1" />
                Twitter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
