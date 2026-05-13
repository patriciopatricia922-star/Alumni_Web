// ============================================================================
// TEXT HELPER UTILITIES
// ============================================================================
// Purpose: Helper functions for safely handling HTML content from rich text
//          editors. Use for previews, snippets, and safe text display.
// ============================================================================

/**
 * 
 * @param {string} html 
 * @returns {string} 
 */
export const stripHtml = (html) => {
  if (!html) return '';
  
  // Handle string input
  if (typeof html !== 'string') {
    html = String(html);
  }
  
  // Use DOMParser for better handling of malformed HTML
  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const text = doc.body.textContent || '';
      // Decode common HTML entities
      return decodeHtmlEntities(text);
    } catch (error) {
      console.warn('DOMParser failed, falling back to regex:', error);
      return stripHtmlRegex(html);
    }
  }
  
  // Fallback command for older browsers or if DOMParser fails
  return stripHtmlRegex(html);
};

/**
 * 
 * @param {string} html 
 * @returns {string} 
 */
export const stripHtmlRegex = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')  // Replace tags with spaces
    .replace(/&nbsp;/g, ' ')   // Replace &nbsp; with spaces
    .replace(/&amp;/g, '&')    // Replace &amp; with &
    .replace(/&lt;/g, '<')     // Replace &lt; with <
    .replace(/&gt;/g, '>')     // Replace &gt; with >
    .replace(/&quot;/g, '"')   // Replace &quot; with "
    .replace(/&#39;/g, "'")    // Replace &#39; with '
    .replace(/\s+/g, ' ')      // Collapse multiple spaces
    .trim();
};

/**
 * Decodes HTML entities to their character equivalents
 * @param {string} text - Text with HTML entities
 * @returns {string} - Decoded text
 */
export const decodeHtmlEntities = (text) => {
  if (!text) return '';
  
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&#8203;': '', // Zero-width space
    '&#x27;': "'",
    '&#x2F;': '/',
  };
  
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;|&#8203;|&#x27;|&#x2F;/g, 
    match => entities[match] || match);
};

/**
 * Truncates HTML content to plain text with maximum length
 * @param {string} html - The HTML string to truncate
 * @param {number} maxLength - Maximum length before truncation (default: 120)
 * @param {string} ellipsis - Ellipsis character(s) (default: '...')
 * @returns {string} - Truncated plain text
 */
export const truncateHtml = (html, maxLength = 120, ellipsis = '...') => {
  const plainText = stripHtml(html);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + ellipsis;
};

/**
 * Gets a plain text excerpt from HTML content
 * @param {string} html - The HTML string
 * @param {number} length - Desired excerpt length (default: 100)
 * @returns {string} - Plain text excerpt
 */
export const getExcerpt = (html, length = 100) => {
  return truncateHtml(html, length);
};

/**
 * Safely renders HTML content for full display
 * WARNING: Only use for admin-created content, not user-submitted
 * @param {string} html - The HTML content to render
 * @returns {Object} - Props object for dangerouslySetInnerHTML
 */
export const createMarkup = (html) => {
  return { __html: html || '' };
};

/**
 * Checks if HTML content contains any formatting tags
 * @param {string} html - The HTML string to check
 * @returns {boolean} - True if content has HTML formatting
 */
export const hasHtmlFormatting = (html) => {
  if (!html) return false;
  const formattingTags = /<(\/)?(b|strong|i|em|u|p|br|ul|ol|li|h[1-6]|div|span)(\s[^>]*)?>/i;
  return formattingTags.test(html);
};

/**
 * Converts plain text to HTML paragraphs
 * @param {string} text - Plain text input
 * @returns {string} - HTML with paragraph tags
 */
export const textToHtml = (text) => {
  if (!text) return '';
  // Split by double line breaks to create paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
};

/**
 * Removes excessive whitespace and normalizes spaces
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
export const normalizeWhitespace = (text) => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Converts rich-text HTML to readable plain text preserving paragraph breaks
 * @param {string} html - HTML from rich text editor
 * @returns {string} - Plain text with newlines between paragraphs
 */
export const htmlToReadableText = (html) => {
  if (!html) return '';
  return html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')  // collapse 3+ newlines to 2
    .trim();
};


// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  stripHtml,
  stripHtmlRegex,
  decodeHtmlEntities,
  truncateHtml,
  getExcerpt,
  createMarkup,
  hasHtmlFormatting,
  textToHtml,
  normalizeWhitespace,
  htmlToReadableText, 
};