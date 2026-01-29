//--------------------------------------------------------------
// Backend URL — Uses environment variable in production
//--------------------------------------------------------------

export function getApiBase() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return "http://localhost:3001";
  }
  return "";
}

//--------------------------------------------------------------
// Build full path to API route
//--------------------------------------------------------------

export function apiPath(path) {
  return `${getApiBase()}${path}`;
}
