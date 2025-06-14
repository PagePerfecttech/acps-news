import html2canvas from 'html2canvas';

/**
 * Enhanced screenshot capture utility for better page screenshots
 */

export interface ScreenshotOptions {
  quality?: number;
  scale?: number;
  timeout?: number;
  maxWidth?: number;
  maxHeight?: number;
  includeBackground?: boolean;
}

/**
 * Captures a high-quality screenshot of the entire page or specific element
 * @param elementId The ID of the element to capture (optional, captures full page if not provided)
 * @param options Screenshot configuration options
 * @returns Promise that resolves to a data URL of the screenshot
 */
export const capturePageScreenshot = async (
  elementId?: string,
  options: ScreenshotOptions = {}
): Promise<string> => {
  const {
    quality = 0.9,
    scale = 1.5,
    timeout = 12000,
    maxWidth = 1200,
    maxHeight = 1600,
    includeBackground = true
  } = options;

  try {
    console.log('Starting enhanced screenshot capture...');

    // Get the target element or use document body
    let targetElement: HTMLElement;
    
    if (elementId) {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`Element with ID ${elementId} not found, using document body`);
        targetElement = document.body;
      } else {
        targetElement = element;
      }
    } else {
      targetElement = document.body;
    }

    // Ensure all images are loaded
    await waitForImages(targetElement, 3000);

    // Scroll to top to ensure we capture from the beginning
    const originalScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    window.scrollTo(0, 0);

    // Wait for scroll to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // Get element dimensions
    const rect = targetElement.getBoundingClientRect();
    const elementWidth = Math.min(rect.width || window.innerWidth, maxWidth);
    const elementHeight = Math.min(rect.height || window.innerHeight, maxHeight);

    console.log('Capturing element:', {
      width: elementWidth,
      height: elementHeight,
      scale: scale
    });

    // Create screenshot with timeout
    const screenshotPromise = html2canvas(targetElement, {
      allowTaint: true,
      useCORS: true,
      scale: scale,
      logging: false,
      backgroundColor: includeBackground ? '#ffffff' : null,
      imageTimeout: 8000,
      foreignObjectRendering: false,
      removeContainer: true,
      width: elementWidth,
      height: elementHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      onclone: (clonedDoc) => {
        // Enhance cloned document for better rendering
        const clonedBody = clonedDoc.body;
        if (clonedBody) {
          // Remove any overlay elements that might interfere
          const overlays = clonedBody.querySelectorAll('.modal, .popup, .overlay, .tooltip');
          overlays.forEach(overlay => overlay.remove());
          
          // Ensure all images have proper dimensions
          const images = clonedBody.querySelectorAll('img');
          images.forEach(img => {
            if (img.naturalWidth && img.naturalHeight) {
              img.style.width = img.naturalWidth + 'px';
              img.style.height = img.naturalHeight + 'px';
            }
          });
        }
      },
      ignoreElements: (element) => {
        // Ignore elements that shouldn't be in screenshots
        return (
          element.classList.contains('ignore-screenshot') ||
          element.tagName === 'SCRIPT' ||
          element.tagName === 'STYLE' ||
          element.style.display === 'none' ||
          element.style.visibility === 'hidden' ||
          element.classList.contains('share-modal') ||
          element.classList.contains('whatsapp-share-container')
        );
      }
    });

    // Race between screenshot and timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Screenshot timeout')), timeout);
    });

    const canvas = await Promise.race([screenshotPromise, timeoutPromise]);

    // Restore original scroll position
    window.scrollTo(0, originalScrollTop);

    // Convert canvas to data URL with specified quality
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    
    console.log('Screenshot captured successfully:', {
      size: `${canvas.width}x${canvas.height}`,
      dataUrlLength: dataUrl.length
    });

    return dataUrl;

  } catch (error) {
    console.error('Enhanced screenshot capture failed:', error);
    
    // Restore scroll position on error
    try {
      const originalScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo(0, originalScrollTop);
    } catch (scrollError) {
      console.warn('Failed to restore scroll position:', scrollError);
    }
    
    // Return fallback image
    return '/images/fallback-share-image.svg';
  }
};

/**
 * Waits for all images in an element to load
 * @param element The element to check for images
 * @param timeout Maximum time to wait in milliseconds
 */
const waitForImages = async (element: HTMLElement, timeout: number = 5000): Promise<void> => {
  const images = Array.from(element.querySelectorAll('img'));
  
  if (images.length === 0) {
    return Promise.resolve();
  }

  console.log(`Waiting for ${images.length} images to load...`);

  const imagePromises = images.map(img => {
    if (img.complete && img.naturalHeight !== 0) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('Image load timeout:', img.src);
        resolve();
      }, timeout / images.length);

      const onLoad = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      const onError = () => {
        clearTimeout(timeoutId);
        console.warn('Image load error:', img.src);
        resolve();
      };

      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onError, { once: true });
    });
  });

  await Promise.all(imagePromises);
  console.log('All images loaded or timed out');
};

/**
 * Converts a data URL to a File object
 * @param dataUrl The data URL to convert
 * @param filename The filename for the file
 * @returns File object
 */
export const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
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
 * @param filename The filename for the download
 */
export const downloadDataUrl = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
