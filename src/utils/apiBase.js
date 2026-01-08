//--------------------------------------------------------------
// Backend URL — Uses environment variable in production
//--------------------------------------------------------------

export function getApiBase() {
  // Use VITE_API_URL from environment, fallback to localhost for development
  return import.meta.env.VITE_API_URL || "http://localhost:3001";
}

//--------------------------------------------------------------
// Build full path to API route
//--------------------------------------------------------------

export function apiPath(path) {
  return `${getApiBase()}${path}`;
}
