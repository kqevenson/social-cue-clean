//--------------------------------------------------------------
// Backend URL — uses VITE_API_URL env var for production
//--------------------------------------------------------------

export function getApiBase() {
  return import.meta.env.VITE_API_URL || "http://localhost:3001";
}

//--------------------------------------------------------------
// Build full path to API route
//--------------------------------------------------------------

export function apiPath(path) {
  return `${getApiBase()}${path}`;
}
