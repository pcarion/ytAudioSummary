function extractDomainFromUrl(url: string) {
  const urlObj = new URL(url);
  return urlObj.hostname;
}

export { extractDomainFromUrl };