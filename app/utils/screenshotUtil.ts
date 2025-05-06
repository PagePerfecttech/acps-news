import html2canvas from 'html2canvas';

/**
 * Captures a screenshot of a DOM element
 * @param element The DOM element to capture
 * @returns A Promise that resolves to a data URL of the screenshot
 */
export const captureScreenshot = async (element: HTMLElement): Promise<string> => {
  try {
    // Optimize screenshot capture for better performance
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      scale: 1, // Lower scale for better performance
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 0, // No timeout for images
      ignoreElements: (el) => {
        // Ignore elements that are not visible or not important for the screenshot
        return el.classList.contains('ignore-screenshot') ||
               el.tagName === 'SCRIPT' ||
               el.tagName === 'STYLE';
      },
      onclone: (document, clonedElement) => {
        // Simplify the cloned element to improve performance
        const elementsToSimplify = clonedElement.querySelectorAll('.simplify-for-screenshot');
        elementsToSimplify.forEach(el => {
          el.innerHTML = '';
        });
        return clonedElement;
      }
    });

    // Use lower quality for better performance
    return canvas.toDataURL('image/jpeg', 0.7);
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
  files?: File[]
): Promise<void> => {
  try {
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
    } else {
      // Fallback for browsers that don't support Web Share API
      console.log('Web Share API not supported');

      // Create a temporary input to copy the URL
      const input = document.createElement('input');
      input.value = `${title}\n${text}\n${url}`;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);

      alert('Share link copied to clipboard!');
    }
  } catch (error) {
    console.error('Error sharing content:', error);
    throw error;
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
