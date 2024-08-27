export function encodeUrl(originalUrl) {
  return originalUrl.replace(/:\/\//g, "__SLASH__");
}
export function decodeUrl(encodedUrl) {
  return encodedUrl.replace(/__SLASH__/g, "://");
}
