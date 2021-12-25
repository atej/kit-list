import { IOptions as translateOptions } from '@vitalets/google-translate-api';
import { SelectorType } from 'cheerio';

export type ItemSelectors = {
  containerSelector: SelectorType;
  titleSelector?: SelectorType;
  hrefSelector?: SelectorType;
  descriptionSelector?: SelectorType;
  metaSelector?: SelectorType;
};

export type ItemData = {
  url: string;
  title: string;
  description: string;
  meta: string;
};

export type ListOptions = {
  translate?: translateOptions;
  meta?: MetaOptions;
};

type MetaOptions = {
  hide?: boolean;
  afterTitle?: boolean;
};
