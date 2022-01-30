"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const google_translate_api_1 = __importDefault(require("@vitalets/google-translate-api"));
const url_1 = require("./utils/url");
async function list(url, selectors, listOptions) {
    const { containerSelector, titleSelector, hrefSelector, descriptionSelector, metaSelector, } = selectors;
    const { origin, href: pageUrl } = new URL((0, url_1.validateUrl)(url));
    const { data: responseData } = await axios_1.default.get(pageUrl);
    if (typeof responseData !== 'string') {
        throw new Error('Oops! Not a valid HTML document.');
    }
    const $ = cheerio_1.default.load(responseData);
    const data = $(containerSelector)
        .map((_, container) => {
        const href = hrefSelector
            ? $(hrefSelector, container)
                ? $(hrefSelector, container).attr('href')
                : null
            : $(container).attr('href')
                ? $(container).attr('href')
                : null;
        const url = href
            ? href[0] === '#'
                ? (0, url_1.getUrl)(href, pageUrl)
                : (0, url_1.getUrl)(href, origin)
            : pageUrl;
        const title = titleSelector
            ? $(titleSelector, container).text().trim()
            : hrefSelector
                ? $(hrefSelector, container).text().trim()
                : $(container).text().trim() || 'No title';
        const description = descriptionSelector && $(descriptionSelector, container)
            ? $(descriptionSelector, container).text().trim()
            : '';
        const meta = metaSelector && $(metaSelector, container)
            ? $(metaSelector, container).text().trim()
            : '';
        return { title, url, description, meta };
    })
        .toArray();
    const shouldTranslate = !!listOptions && 'translate' in listOptions;
    const choices = await Promise.all(data.map(async ({ meta, title, description, url: itemUrl }) => {
        const metaPart = meta ? ` [${meta}] ` : '';
        const translatedTitle = shouldTranslate
            ? (await (0, google_translate_api_1.default)(title, listOptions.translate)).text
            : title;
        const translatedDescription = description
            ? shouldTranslate
                ? (await (0, google_translate_api_1.default)(description, listOptions.translate)).text
                : description
            : '';
        const translatedTitleWithMeta = (listOptions?.meta?.afterTitle
            ? `${translatedTitle}${metaPart}`
            : `${metaPart}${translatedTitle}`).trim();
        const choice = {
            name: listOptions?.meta?.hide
                ? translatedTitle
                : translatedTitleWithMeta,
            description: translatedDescription || itemUrl,
            value: itemUrl,
        };
        return choice;
    }));
    return { data, choices };
}
exports.default = list;
