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
      }, 3000); // 3 seconds timeout
    });

    try {
      const element = document.getElementById(elementId);
      if (element) {
        // Race between screenshot capture and timeout
        const dataUrl = await Promise.race([
          captureScreenshot(element),
          timeoutPromise
        ]);
        setScreenshotUrl(dataUrl);
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

      await shareContent(title, shareText, shareUrl, [file]);
    } catch (error) {
      console.error('Error sharing content:', error);
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
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <FiFacebook size={20} />
              </button>
              <button className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 transition-colors">
                <FiTwitter size={20} />
              </button>
              <button className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 transition-colors">
                <FiInstagram size={20} />
              </button>
              <button className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors">
                <FiLink size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
