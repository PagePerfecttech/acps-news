import { SiteSettings } from './settingsService';

/**
 * Utility functions for working with theme colors
 */

/**
 * Convert hex color to RGB values
 * @param hex Hex color string (e.g., #FFFFFF or #FFF)
 * @returns RGB object or null if invalid
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  let r, g, b;
  if (hex.length === 3) {
    // Short notation (#RGB)
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else if (hex.length === 6) {
    // Full notation (#RRGGBB)
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return null; // Invalid hex
  }

  return { r, g, b };
};

/**
 * Convert RGB values to hex color
 * @param r Red value (0-255)
 * @param g Green value (0-255)
 * @param b Blue value (0-255)
 * @returns Hex color string
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Apply CSS variables for theme colors
 * @param settings Site settings object
 */
export const applyThemeColors = (settings: SiteSettings): void => {
  if (typeof document === 'undefined') return; // Skip on server-side

  // Set primary color
  document.documentElement.style.setProperty('--primary-color', settings.primary_color);

  // Set secondary color
  document.documentElement.style.setProperty('--secondary-color', settings.secondary_color);

  // Set RGB values for opacity variants
  const primaryRgb = hexToRgb(settings.primary_color);
  if (primaryRgb) {
    const { r, g, b } = primaryRgb;
    document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
  }

  const secondaryRgb = hexToRgb(settings.secondary_color);
  if (secondaryRgb) {
    const { r, g, b } = secondaryRgb;
    document.documentElement.style.setProperty('--secondary-rgb', `${r}, ${g}, ${b}`);
  }

  // Update site name in title and any elements with data-site-name attribute
  if (settings.site_name) {
    document.title = settings.site_name;

    // Update any elements with data-site-name attribute
    const siteNameElements = document.querySelectorAll('[data-site-name]');
    siteNameElements.forEach(element => {
      element.textContent = settings.site_name;
    });
  }
};

/**
 * Get color with opacity
 * @param color Hex color
 * @param opacity Opacity value (0-1)
 * @returns RGBA color string
 */
export const getColorWithOpacity = (color: string, opacity: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Get a lighter or darker version of a color
 * @param color Hex color
 * @param percent Percent to lighten (positive) or darken (negative)
 * @returns Modified hex color
 */
export const adjustColor = (color: string, percent: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;

  const factor = percent / 100;
  const adjustValue = (value: number): number => {
    return Math.round(Math.min(255, Math.max(0, value + value * factor)));
  };

  return rgbToHex(
    adjustValue(r),
    adjustValue(g),
    adjustValue(b)
  );
};
