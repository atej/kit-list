export function validateUrl(str: string) {
  let urlObj: URL;
  try {
    urlObj = new URL(str);
  } catch (err) {
    return `'Oops! ${str} is not a valid a HTTP URL!`;
  }
  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    throw new Error(`Oops! ${str} is not a valid HTTP URL`);
  }
  return urlObj.href;
}

export function getUrl(str: string, origin: string) {
  if (str.includes('http:')) {
    return validateUrl(str);
  }

  return validateUrl(`${origin}${str}`);
}
