/**
 * Extracts a description from an HTML element, limiting to a specified number of words
 * @param element The HTML element to extract text from
 * @param wordLimit Maximum number of words to include
 * @returns A string containing the extracted description
 */
export const getDescriptionFromElement = (element: HTMLElement | null, wordLimit: number = 40): string => {
  try {
    if (!element) return '';

    // Try multiple selectors to find content
    let contentText = '';

    // First try: Look for paragraph tags
    const contentParagraph = element.querySelector('p');
    if (contentParagraph && contentParagraph.textContent) {
      contentText = contentParagraph.textContent;
    }
    // Second try: Look for div with text content
    else if (!contentText) {
      const contentDivs = element.querySelectorAll('div');
      for (const div of contentDivs) {
        if (div.textContent && div.textContent.trim().length > 50) {
          contentText = div.textContent;
          break;
        }
      }
    }
    // Third try: Just get any text content from the element
    if (!contentText && element.textContent) {
      contentText = element.textContent;
    }

    // If still no content, return empty string
    if (!contentText) return '';

    // Clean up the text - remove extra whitespace
    contentText = contentText.replace(/\s+/g, ' ').trim();

    // Extract words safely
    const words = contentText.split(/\s+/).filter(word => word.length > 0);

    // Limit to specified number of words
    const limitedWords = words.slice(0, wordLimit);

    // Add ellipsis if text was truncated
    const description = limitedWords.join(' ') + (words.length > wordLimit ? '...' : '');

    return description;
  } catch (error) {
    console.warn('Error extracting description:', error);
    return ''; // Return empty string on error
  }
};
