import '@johnlindquist/kit';
import translate from '@vitalets/google-translate-api';
import cheerio from 'cheerio';
import { validateUrl, getUrl } from './utils/url';
export default async function list(url, selectors, pageOptions) {
    const { containerSelector, titleSelector, hrefSelector, descriptionSelector, metaSelector, } = selectors;
    const { origin, href: pageUrl } = new URL(validateUrl(url));
    const response = await get(pageUrl);
    const $ = cheerio.load(response.data);
    const data = $(containerSelector)
        .map((_, container) => {
        const href = hrefSelector
            ? $(hrefSelector, container)
                ? $(hrefSelector, container).attr('href')
                : null
            : $(container).attr('href')
                ? $(container).attr('href')
                : null;
        const url = href ? getUrl(href, origin) : pageUrl;
        const title = titleSelector
            ? $(titleSelector, container).text().trim()
            : hrefSelector
                ? $(hrefSelector, container).text().trim()
                : 'No title';
        const description = descriptionSelector && $(descriptionSelector, container)
            ? $(descriptionSelector, container).text().trim()
            : '';
        const meta = metaSelector && $(metaSelector, container)
            ? $(metaSelector, container).text().trim()
            : '';
        return { title, url, description, meta };
    })
        .toArray();
    const shouldTranslate = !!pageOptions && 'translate' in pageOptions;
    const choices = await Promise.all(data.map(async ({ meta, title, description, url: itemUrl }) => {
        const metaPart = meta ? ` [${meta}] ` : '';
        const translatedTitle = shouldTranslate
            ? (await translate(title, pageOptions.translate)).text
            : title;
        const translatedDescription = description
            ? shouldTranslate
                ? (await translate(description, pageOptions.translate)).text
                : description
            : '';
        const translatedTitleWithMeta = (pageOptions?.meta?.afterTitle
            ? `${translatedTitle}${metaPart}`
            : `${metaPart}${translatedTitle}`).trim();
        const choice = {
            name: pageOptions?.meta?.hide
                ? translatedTitle
                : translatedTitleWithMeta,
            description: translatedDescription || itemUrl,
            value: itemUrl,
        };
        return choice;
    }));
    return { data, choices };
}
