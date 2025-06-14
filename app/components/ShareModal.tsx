'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiShare2, FiDownload, FiCopy, FiFacebook, FiTwitter } from 'react-icons/fi';
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

  // Store all timeout IDs for cleanup
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);

  // Safe setTimeout that automatically registers for cleanup
  const safeSetTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const id = setTimeout(callback, delay);
    timeoutIds.current.push(id);
    return id;
  };

  // Cleanup all timeouts when component unmounts
  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(id => clearTimeout(id));
      timeoutIds.current = [];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps;

  // Capture the element as a screenshot with timeout
  const captureElement = async () => {
    setIsCapturing(true);

    // Reference to store the timeout ID
    let timeoutId: NodeJS.Timeout;

    // Set a timeout to ensure we don&apos;t wait too long
    const timeoutPromise = new Promise<string>((resolve) => {
      timeoutId = setTimeout(() => {
        // Use a fallback image if it takes too long
        resolve('/images/fallback-share-image.svg');
      }, 6000); // 6 seconds timeout (increased for better reliability)
    });

    // Cleanup function to clear the timeout if component unmounts
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    try {
      // First, make sure the element is fully visible and rendered
      const element = document.getElementById(elementId);
      if (!element) {
        console.error('Element not found:', elementId);
        setScreenshotUrl('/images/fallback-share-image.svg');
        setIsCapturing(false);
        return;
      }

      // Make sure the element is visible in the viewport
      try {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('Element has zero dimensions:', elementId);
          // Continue anyway, as the element might still be renderable
        }
      } catch (e) {
        console.warn('Error checking element dimensions:', e);
      }

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
              const imgTimeoutId = setTimeout(resolve, 2000);

              // Store the timeout ID for cleanup
              const originalOnload = img.onload;
              img.onload = () => {
                clearTimeout(imgTimeoutId);
                if (originalOnload && typeof originalOnload === 'function') {
                  originalOnload.call(img);
                }
                resolve();
              };
            });
          })
        );
      }

      // Wait a moment for any animations or transitions to complete
      await new Promise(resolve => {
        const animTimeoutId = setTimeout(resolve, 200); // Increased from 100ms

        // Add to cleanup list
        const originalCleanup = cleanup;
        cleanup = () => {
          clearTimeout(animTimeoutId);
          originalCleanup();
        };
      });

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
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      setScreenshotUrl('/images/fallback-share-image.svg');
    } finally {
      setIsCapturing(false);
      // Call cleanup function to clear any remaining timeouts
      cleanup();
    }
  };

  // Handle share button click
  const handleShare = async () => {
    try {
      if (!screenshotUrl) {
        console.warn('No screenshot URL available for sharing');
        alert('Screenshot is not ready yet. Please try again in a moment.');
        return;
      }

      // Use the share link from settings, or fallback to a default
      const shareLink = settings?.share_link || 'https://flipnews.vercel.app';
      const siteName = settings?.site_name || 'FlipNEWS';

      // Get the article element to extract content
      const articleElement = document.getElementById(elementId);
      let description = '';

      if (articleElement) {
        // Try to find the content paragraph
        const contentParagraph = articleElement.querySelector('p');
        if (contentParagraph) {
          // Extract first 40 words for description
          const words = contentParagraph.textContent?.split(/\s+/) || [];
          description = words.slice(0, 40).join(' ');
          if (words.length > 40) {
            description += '...';
          }
        }
      }

      // Create enhanced share text with title, description and read more link
      const enhancedShareText = `${title}\n\n${description}\n\nRead More: ${shareLink}`;

      try {
        // Get the media element (image or video)
        const mediaElement = articleElement?.querySelector('img, video');
        let mediaFile: File | null = null;

        if (mediaElement instanceof HTMLImageElement && mediaElement.src) {
          try {
            // Try to fetch the image and convert to file
            const response = await fetch(mediaElement.src);
            const blob = await response.blob();
            mediaFile = new File([blob], `${siteName}-media.${blob.type.split('/')[1] || 'png'}`, { type: blob.type });
          } catch (e) {
            console.error('Error fetching media file:', e);
          }
        }

        // If we have a media file, share it along with the text
        if (mediaFile) {
          await shareContent(title, enhancedShareText, shareLink, [mediaFile]);
        } else {
          // Fallback to screenshot if media file couldn't be fetched
          const file = dataUrlToFile(screenshotUrl, `${siteName}-news.png`);
          await shareContent(title, enhancedShareText, shareLink, [file]);
        }
      } catch (fileError) {
        console.error('Error creating file for sharing:', fileError);

        // Fallback to sharing without any media
        await shareContent(title, enhancedShareText, shareLink);
      }
    } catch (error) {
      console.error('Error sharing content:', error);
      alert('There was an error sharing. Please try a different sharing option.');
    }
  };

  // Handle platform-specific sharing
  const handlePlatformShare = async (platform: 'facebook' | 'twitter') => {
    try {
      if (!screenshotUrl) {
        console.warn(`No screenshot URL available for sharing to ${platform}`);
        alert('Screenshot is not ready yet. Please try again in a moment.');
        return;
      }

      // Use the share link from settings, or fallback to a default
      const shareLink = settings?.share_link || 'https://flipnews.vercel.app';
      const siteName = settings?.site_name || 'FlipNEWS';

      // Get the article element to extract content
      const articleElement = document.getElementById(elementId);
      let description = '';

      if (articleElement) {
        // Try to find the content paragraph
        const contentParagraph = articleElement.querySelector('p');
        if (contentParagraph) {
          // Extract first 40 words for description
          const words = contentParagraph.textContent?.split(/\s+/) || [];
          description = words.slice(0, 40).join(' ');
          if (words.length > 40) {
            description += '...';
          }
        }
      }

      // Customize share text based on platform with enhanced "Read More" text
      let shareText = `${title}\n\n${description}\n\nRead More: ${shareLink}`;

      // Twitter has character limits, so make it more concise
      if (platform === 'twitter') {
        // Limit to 280 characters for Twitter
        const maxLength = 280;
        const urlLength = shareLink.length + 5; // 5 for "Read More: "
        const titleLength = title.length;
        const availableLength = maxLength - urlLength - titleLength - 5; // 5 for spacing and separators

        if (availableLength > 20 && description) {
          // Include a shortened description if there's room
          const shortDesc = description.substring(0, availableLength) + '...';
          shareText = `${title}\n\n${shortDesc}\n\nRead More: ${shareLink}`;
        } else {
          // Just title and link if description won't fit
          shareText = `${title} | Read More: ${shareLink}`;
        }
      }

      const shareUrl = shareLink;

      // Share to the specific platform
      await shareContent(title, shareText, shareUrl, undefined, platform);
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      alert(`There was an error sharing to ${platform}. Please try a different sharing option.`);
    }
  };

  // Handle download button click
  const handleDownload = () => {
    try {
      if (!screenshotUrl) {
        console.warn('No screenshot URL available for download');
        alert('Screenshot is not ready yet. Please try again in a moment.');
        return;
      }
      const siteName = settings?.site_name || 'Vizag News';
      downloadDataUrl(screenshotUrl, `${siteName}-news.png`);
    } catch (error) {
      console.error('Error downloading screenshot:', error);
      alert('There was an error downloading the image. Please try again.');
    }
  };

  // Helper function to get description for sharing
  const getDescriptionForShare = (): string => {
    // Get the article element to extract content
    const articleElement = document.getElementById(elementId);
    let description = '';

    if (articleElement) {
      // Try to find the content paragraph
      const contentParagraph = articleElement.querySelector('p');
      if (contentParagraph) {
        // Extract first 40 words for description
        const words = contentParagraph.textContent?.split(/\s+/) || [];
        description = words.slice(0, 40).join(' ');
        if (words.length > 40) {
          description += '...';
        }
      }
    }

    return description;
  };

  // Handle copy link button click
  const handleCopyLink = () => {
    try {
      const shareLink = settings?.share_link || 'https://flipnews.vercel.app';
      const description = getDescriptionForShare();
      const shareMessage = `${title}\n\n${description}\n\nRead More: ${shareLink}`;

      // Modern clipboard API with fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareMessage)
          .then(() => {
            setCopySuccess(true);
            // Reset copy success message after 2 seconds
            const copyTimeoutId = setTimeout(() => {
              setCopySuccess(false);
            }, 2000);

            // Store the timeout ID for cleanup
            timeoutIds.current.push(copyTimeoutId);
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
            // Fallback to older method
            fallbackCopyTextToClipboard(shareMessage);
          });
      } else {
        // Fallback for browsers that don&apos;t support clipboard API
        fallbackCopyTextToClipboard(shareMessage);
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  // Fallback method for copying text
  const fallbackCopyTextToClipboard = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      if (successful) {
        setCopySuccess(true);
        // Reset copy success message after 2 seconds
        const copyTimeoutId = setTimeout(() => {
          setCopySuccess(false);
        }, 2000);

        // Store the timeout ID for cleanup
        timeoutIds.current.push(copyTimeoutId);
      } else {
        console.warn('Fallback clipboard copy failed');
      }

      document.body.removeChild(textArea);
    } catch (err) {
      console.error('Fallback clipboard error:', err);
    }
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
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
                <div className="absolute bottom-2 right-2 bg-white bg-opacity-70 px-2 py-1 rounded text-xs font-bold">
                  <span data-site-name>{settings?.site_name || 'Vizag News'}</span>
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
                rows={4}
                value={`${title}\n\n${getDescriptionForShare()}\n\nRead More: ${settings?.share_link || 'https://vizag-news.vercel.app'}`}
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
            <div className="grid grid-cols-2 gap-3">
              {/* WhatsApp share button disabled */}

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
