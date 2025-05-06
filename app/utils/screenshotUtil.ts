import html2canvas from 'html2canvas';

/**
 * Captures a screenshot of a DOM element
 * @param element The DOM element to capture
 * @returns A Promise that resolves to a data URL of the screenshot
 */
export const captureScreenshot = async (element: HTMLElement): Promise<string> => {
  try {
    // First, make sure all images are loaded
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails
        });
      })
    );

    // Create a clone of the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;

    // Set fixed dimensions to ensure consistent capture
    clone.style.width = '100%';
    clone.style.height = 'auto';
    clone.style.position = 'absolute';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.zIndex = '-1';
    clone.style.transform = 'none'; // Remove any transforms

    // Append to body temporarily
    document.body.appendChild(clone);

    // Optimize screenshot capture for better quality and reliability
    const canvas = await html2canvas(clone, {
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
        // Make sure all elements are visible
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.visibility = 'visible';
            el.style.opacity = '1';
          }
        });
        return clonedElement;
      }
    });

    // Remove the clone from the DOM
    document.body.removeChild(clone);

    // Use higher quality for better image
    return canvas.toDataURL('image/png', 0.9);
  } catch (error) {
    console.error('Error capturing screenshot:', error);
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
          shareUrl = `https://${isMobile ? 'api' : 'web'}.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank');
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
    const shareMessage = 'Share options:\n\n' +
      '1. Text copied to clipboard!\n' +
      '2. Open in WhatsApp: ' +
      `https://${isMobile ? 'api' : 'web'}.whatsapp.com/send?text=${encodeURIComponent(`${title}\n\n${text} ${url}`)}`;

    alert(shareMessage);
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
