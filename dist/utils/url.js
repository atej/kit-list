"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrl = exports.validateUrl = void 0;
function validateUrl(str) {
    let urlObj;
    try {
        urlObj = new URL(str);
    }
    catch (err) {
        return `'Oops! ${str} is not a valid a HTTP URL!`;
    }
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        throw new Error(`Oops! ${str} is not a valid HTTP URL`);
    }
    return urlObj.href;
}
exports.validateUrl = validateUrl;
function getUrl(str, origin) {
    if (str.includes('http:') || str.includes('https:')) {
        return validateUrl(str);
    }
    return validateUrl(`${origin}${str}`);
}
exports.getUrl = getUrl;
