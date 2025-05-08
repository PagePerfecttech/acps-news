import html2canvas from 'html2canvas';

/**
 * Captures a screenshot of a DOM element
 * @param element The DOM element to capture
 * @returns A Promise that resolves to a data URL of the screenshot
 */
export const captureScreenshot = async (element: HTMLElement): Promise<string> => {
  try {
    // First, make sure all images are loaded with timeout
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails
          // Add timeout to prevent hanging on image load
          setTimeout(resolve, 2000); // 2 second timeout per image
        });
      })
    );

    // Create a clone of the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;

    // Get the original element's dimensions and styles
    const originalRect = element.getBoundingClientRect();
    const originalStyles = window.getComputedStyle(element);

    // Create a wrapper div to maintain the original dimensions and styling
    const wrapper = document.createElement('div');
    wrapper.style.width = `${originalRect.width}px`;
    wrapper.style.maxWidth = '100%';
    wrapper.style.margin = '0 auto';
    wrapper.style.backgroundColor = originalStyles.backgroundColor || '#ffffff';
    wrapper.style.borderRadius = originalStyles.borderRadius;
    wrapper.style.overflow = 'hidden';
    wrapper.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';

    // Prepare the clone for screenshot
    clone.style.width = '100%';
    clone.style.height = 'auto';
    clone.style.position = 'relative'; // Use relative instead of fixed
    clone.style.transform = 'none'; // Remove any transforms
    clone.style.backgroundColor = originalStyles.backgroundColor || '#ffffff';
    clone.style.overflow = 'visible'; // Make sure content is visible
    clone.style.borderRadius = originalStyles.borderRadius;

    // Make sure the clone is visible but not interactive
    clone.style.pointerEvents = 'none';
    clone.style.opacity = '1';
    clone.style.visibility = 'visible';

    // Add the clone to the wrapper
    wrapper.appendChild(clone);

    // Position the wrapper for screenshot
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.right = '0';
    wrapper.style.zIndex = '9999';

    // Fix Next.js Image components which might not render properly
    const nextImages = clone.querySelectorAll('[data-nimg]');
    nextImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        try {
          // Try to get the original image source
          const originalImg = element.querySelector(`img[src="${img.src}"]`);
          if (originalImg instanceof HTMLImageElement) {
            img.style.objectFit = 'cover';
            img.style.width = '100%';
            img.style.height = '100%';
          }
        } catch (e) {
          console.warn('Error fixing Next.js image:', e);
        }
      }
    });

    // Append to body temporarily
    document.body.appendChild(wrapper);

    // Wait a moment for the clone to render properly - increased for better reliability
    await new Promise(resolve => setTimeout(resolve, 500));

    // Optimize screenshot capture for better quality and reliability
    const canvas = await html2canvas(wrapper, {
      allowTaint: true,
      useCORS: true,
      scale: 2, // Higher scale for better quality
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 5000, // 5 second timeout for images
      foreignObjectRendering: false, // More compatible rendering
      removeContainer: true, // Clean up after capture
      ignoreElements: (el) => {
        // Ignore elements that are not visible or not important for the screenshot
        return el.classList.contains('ignore-screenshot') ||
               el.tagName === 'SCRIPT' ||
               el.tagName === 'STYLE';
      },
      onclone: (document, clonedElement) => {
        try {
          // Make sure all elements are visible
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.visibility = 'visible';
              el.style.opacity = '1';

              // Fix any elements with relative positioning
              if (window.getComputedStyle(el).position === 'relative') {
                el.style.position = 'static';
              }
            }
          });
        } catch (e) {
          console.warn('Error in onclone handler:', e);
        }
        return clonedElement;
      }
    });

    // Remove the wrapper from the DOM
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }

    // Use higher quality for better image
    return canvas.toDataURL('image/png', 0.9);
  } catch (error) {
    console.error('Error capturing screenshot:', error);

    // Clean up any wrappers or clones that might be left in the DOM
    try {
      // Clean up wrappers
      const orphanedWrappers = document.querySelectorAll('[style*="z-index: 9999"][style*="position: fixed"]');
      orphanedWrappers.forEach(wrapper => {
        if (wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
      });

      // Also check for any orphaned clones with our specific styling
      const orphanedClones = document.querySelectorAll('[style*="pointerEvents: none"][style*="position: relative"]');
      orphanedClones.forEach(clone => {
        if (clone.parentNode) {
          clone.parentNode.removeChild(clone);
        }
      });
    } catch (e) {
      console.warn('Error cleaning up orphaned elements:', e);
    }

    // Return a fallback image URL if screenshot fails
    return '/images/fallback-share-image.svg';
  }
};

/**
 * Shares content using the Web Share API if available
 * @param title The title of the content to share
 * @param text The text description of the content to share
 * @param url The URL to share
 * @param files Optional files to share (e.g., screenshot)
 * @returns A Promise that resolves when sharing is complete
 */
export const shareContent = async (
  title: string,
  text: string,
  url: string,
  files?: File[],
  platform?: 'whatsapp' | 'facebook' | 'twitter' | 'default'
): Promise<void> => {
  try {
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // If platform is specified, use platform-specific sharing
    if (platform && platform !== 'default') {
      const encodedText = encodeURIComponent(`${title}\n\n${text}`);
      const encodedUrl = encodeURIComponent(url);

      let shareUrl = '';

      switch (platform) {
        case 'whatsapp':
          // Use the proper WhatsApp URL scheme for mobile devices
          if (isMobile) {
            // Direct WhatsApp app URL for mobile
            shareUrl = `whatsapp://send?text=${encodedText}%20${encodedUrl}`;
          } else {
            // Web WhatsApp for desktop
            shareUrl = `https://web.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
          }
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
          break;
      }

      if (shareUrl) {
        // For WhatsApp on mobile, try to use the app directly
        if (platform === 'whatsapp' && isMobile) {
          try {
            // First try the direct app URL scheme
            const link = document.createElement('a');
            link.href = shareUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.click();

            // Fallback in case the app link doesn't work (after a short delay)
            setTimeout(() => {
              // Try the web API version as a fallback
              window.open(`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`, '_blank');
            }, 800); // Increased timeout for better reliability
          } catch (error) {
            console.error('Error opening WhatsApp:', error);
            // Final fallback - just open the web version
            window.open(`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`, '_blank');
          }
        } else {
          // For desktop or other platforms
          window.open(shareUrl, '_blank');
        }
        return;
      }
    }

    // Try using the Web Share API if available
    if (navigator.share) {
      const shareData: ShareData = {
        title,
        text,
        url
      };

      // Add files if provided and supported
      if (files && files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
        shareData.files = files;
      }

      await navigator.share(shareData);
      console.log('Content shared successfully');
      return;
    }

    // Fallback for browsers that don't support Web Share API
    console.log('Web Share API not supported, showing share options');

    // Create a temporary input to copy the URL
    const input = document.createElement('input');
    input.value = `${title}\n${text}\n${url}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);

    // Show share options
    const whatsappUrl = isMobile
      ? `whatsapp://send?text=${encodeURIComponent(`${title}\n\n${text} ${url}`)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(`${title}\n\n${text} ${url}`)}`;

    const shareMessage = 'Share options:\n\n' +
      '1. Text copied to clipboard!\n' +
      '2. Open in WhatsApp: Click the link below\n\n' +
      'If the link doesn\'t open WhatsApp automatically, copy the text and share manually.';

    // Create a clickable link for WhatsApp instead of showing the URL in the alert
    if (confirm(shareMessage)) {
      // If user clicks OK, try to open WhatsApp
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();

      // Fallback for mobile if the app link doesn't work
      if (isMobile) {
        setTimeout(() => {
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n\n${text} ${url}`)}`, '_blank');
        }, 500);
      }
    }
  } catch (error) {
    console.error('Error sharing content:', error);

    // Fallback if sharing fails
    try {
      // Create a temporary input to copy the URL
      const input = document.createElement('input');
      input.value = `${title}\n${text}\n${url}`;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);

      alert('Share text copied to clipboard!');
    } catch (e) {
      console.error('Fallback sharing failed:', e);
      alert('Sharing failed. Please try again.');
    }
  }
};

/**
 * Converts a data URL to a File object
 * @param dataUrl The data URL to convert
 * @param filename The name of the file
 * @returns A File object
 */
export const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

/**
 * Downloads a data URL as a file
 * @param dataUrl The data URL to download
 * @param filename The name of the file
 */
export const downloadDataUrl = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
};
