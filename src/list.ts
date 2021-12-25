import axios from 'axios';
import cheerio from 'cheerio';
import translate from '@vitalets/google-translate-api';
import { validateUrl, getUrl } from './utils/url';
import type { Choice } from '@johnlindquist/kit/types/core';
import type { ListOptions, ItemSelectors, ItemData } from '../types';

export default async function list(
  url: string,
  selectors: ItemSelectors,
  pageOptions?: ListOptions
) {
  const {
    containerSelector,
    titleSelector,
    hrefSelector,
    descriptionSelector,
    metaSelector,
  } = selectors;

  const { origin, href: pageUrl } = new URL(validateUrl(url));

  const { data: responseData } = await axios.get(pageUrl);

  if (typeof responseData !== 'string') {
    throw new Error('Oops! Not a valid HTML document.');
  }

  const $ = cheerio.load(responseData);

  const data: ItemData[] = $(containerSelector)
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

      const description =
        descriptionSelector && $(descriptionSelector, container)
          ? $(descriptionSelector, container).text().trim()
          : '';

      const meta =
        metaSelector && $(metaSelector, container)
          ? $(metaSelector, container).text().trim()
          : '';

      return { title, url, description, meta };
    })
    .toArray();

  const shouldTranslate = !!pageOptions && 'translate' in pageOptions;

  const choices = await Promise.all(
    data.map(async ({ meta, title, description, url: itemUrl }) => {
      const metaPart = meta ? ` [${meta}] ` : '';

      const translatedTitle = shouldTranslate
        ? (await translate(title, pageOptions.translate)).text
        : title;

      const translatedDescription = description
        ? shouldTranslate
          ? (await translate(description, pageOptions.translate)).text
          : description
        : '';

      const translatedTitleWithMeta = (
        pageOptions?.meta?.afterTitle
          ? `${translatedTitle}${metaPart}`
          : `${metaPart}${translatedTitle}`
      ).trim();

      const choice: Choice<string> = {
        name: pageOptions?.meta?.hide
          ? translatedTitle
          : translatedTitleWithMeta,
        description: translatedDescription || itemUrl,
        value: itemUrl,
      };

      return choice;
    })
  );

  return { data, choices };
}
