//--------------------------------------------------------------
// Backend URL — FORCE port 3001 (fixes ERR_CONNECTION_REFUSED)
//--------------------------------------------------------------

export function getApiBase() {
  // Hard-code backend during development
  return "http://localhost:3001";
}

//--------------------------------------------------------------
// Build full path to API route
//--------------------------------------------------------------

export function apiPath(path) {
  return `${getApiBase()}${path}`;
}
