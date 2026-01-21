//--------------------------------------------------------------
// Backend URL — Uses environment variable in production
//--------------------------------------------------------------

export function getApiBase() {
  // In production (same origin), use empty string for relative URLs
  // In development, use localhost:3001
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If running on localhost (dev), use the backend port
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return "http://localhost:3001";
  }
  // In production, use relative URLs (same origin)
  return "";
}

//--------------------------------------------------------------
// Build full path to API route
//--------------------------------------------------------------

export function apiPath(path) {
  return `${getApiBase()}${path}`;
}
