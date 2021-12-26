# kit-list

A helper for the [Script Kit](https://scriptkit.com) automation app to generate a list of choices from an HTML document.

## Why this exists?

I made this to scratch an itch of mine. There are sites I visit from time to time to check out what's new. Many of these sites don't provide an API. This helper allows you to 'API-fy' a regular HTML page using CSS selectors and spits out the data in a format that can be readily consumed by [John Lindquist's very cool Kit app](https://github.com/johnlindquist/kit).

## Install

`cd` into your `~/.kenv` folder:

```shell
npm install @aseemtaneja/kit-list@latest
```

## Examples

### Get a list of all Frontend Masters courses

Create a new script e.g. `~/.kenv/scripts/frontend-masters.js`

```javascript
// Name: Frontend Masters
// Description: Browse courses from frontendmasters.com
// Author: Aseem Taneja
// Twitter: @aseemtaneja

import '@johnlindquist/kit';
const list = await npm('@aseemtaneja/kit-list');

const { choices } = await list('https://frontendmasters.com/courses/', {
        containerSelector: '.MediaItem',
        hrefSelector: 'h2 a',
        descriptionSelector: '.description',
        metaSelector: '.Instructor .name',
      });

const itemUrl = await arg('Go to', choices);

await $`open ${itemUrl}`;
```

### Choose from a list of pages before getting the list of courses
Create a new script e.g. `~/.kenv/scripts/courses.js`

```javascript
// Name: List
// Description: Browse latest courses from your favourite sites
// Author: Aseem Taneja
// Twitter: @aseemtaneja
// Shortcode: course

import '@johnlindquist/kit';
const list = await npm('@aseemtaneja/kit-list');

const PAGES = [
  {
    name: '🥋 frontendmasters',
    description: 'Courses from frontendmasters.com',
    value: {
      url: 'https://frontendmasters.com/courses/',
      selectors: {
        containerSelector: '.MediaItem',
        hrefSelector: 'h2 a',
        descriptionSelector: '.description',
        metaSelector: '.Instructor .name',
      },
    },
  },
  {
    name: '🥚 egghead',
    description: 'Courses from egghead.io',
    value: {
      url: 'https://egghead.io/q?sortBy=created',
      selectors: {
        containerSelector: 'a[href^="/playlists"]',
        titleSelector: '[data-egghead-card-body] h3',
        descriptionSelector: '[data-egghead-card-author] > span',
      },
    },
  },
];

const { url: pageUrl, selectors, options } = await arg('Select', PAGES);

const { choices } = await list(pageUrl, selectors, options);

const itemUrl = await arg('Go to', choices);

await $`open ${itemUrl}`;
```

## API

```typescript
function list(
  url: string,
  selectors: ItemSelectors,
  listOptions?: ListOptions | undefined
): Promise<{
  data: ItemData[];
  choices: Choice<string>[];
}>
```

### Arguments

#### `url` (required)
##### Type: `string`
A valid http/https url of the page to be scraped.

#### `selectors` (required)
##### Type: `object`
- `containerSelector` (required) - selector for a wrapper element (doubles as the url selector if no `urlSelector` is specified – useful for 'card' layouts where the 'card' is an anchor tag).
  > 🚨 All other selectors use the container element (specified by the `containerSelector`) as context
- `urlSelector` (optional) - selector for the anchor tag which specifies the item url (doubles as the title selector if no `titleSelector` is specified)/
- `titleSelector` (optional) - selector for item title.
- `descriptionSelector` (optional) - selector for item description.
- `metaSelector` (optional) - selector for item meta (prepended to the title).

#### `listOptions` (optional)
##### Type: `object`
- `meta` - object that controls how item meta appears in the choices.
  - `hide` - hide item meta.
  - `afterTitle` - append meta to title (instead of prepending it).
- `translate` - an [options](https://github.com/vitalets/google-translate-api#options) object as expected by [@vitalets/google-translate-api](https://github.com/vitalets/google-translate-api) which can be used to translate the item titles and descriptions to the desired language.

### Return Value
A `Promise` which resolves to an `object` with the following properties:

#### `choices`
##### Type: `array`
An array of 'choice' objects. Each item is a 'choice' object (structurally expected by the Kit app) with the following properties:
- `name` - the item title and item meta (if any)
- `description` - the item description (if any) or the item url
- `value` - the item url


#### `data`
##### Type: `array`
An array of `item data' objects. Each item in the array has the following properties:
- `title` - the item title or `'No title'` if one couldn't be found
- `url` - the item url or the page url if no item url could be found
- `description` - the item description or an empty string
- `meta` - the item meta or an empty string
> 💡 `data` can be used to format your results in the way you want if what `choices` returns does not cut it for you.
