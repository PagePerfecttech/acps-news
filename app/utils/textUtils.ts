/**
 * Extracts a description from an HTML element, limiting to a specified number of words
 * @param element The HTML element to extract text from
 * @param wordLimit Maximum number of words to include
 * @returns A string containing the extracted description
 */
export const getDescriptionFromElement = (element: HTMLElement | null, wordLimit: number = 40): string => {
  if (!element) return '';
  
  // Try to find the content paragraph
  const contentParagraph = element.querySelector('p');
  if (!contentParagraph) return '';
  
  // Extract words from the paragraph
  const words = contentParagraph.textContent?.split(/\s+/) || [];
  
  // Limit to specified number of words
  const limitedWords = words.slice(0, wordLimit);
  
  // Add ellipsis if text was truncated
  const description = limitedWords.join(' ') + (words.length > wordLimit ? '...' : '');
  
  return description;
};
