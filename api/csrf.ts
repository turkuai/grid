// Helper function to get CSRF token from meta tag or cookie
export function getCsrfToken(): string {
  // Try meta tag first (Laravel convention)
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content') || '';
  }
  
  // Fallback to cookie
  const name = 'XSRF-TOKEN';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    try {
      return decodeURIComponent(parts.pop()?.split(';')?.shift() || '');
    } catch (e) {
      return '';
    }
  }
  
  return '';
}
