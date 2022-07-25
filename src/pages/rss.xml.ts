import rss from '@astrojs/rss';
import { PAGE_DESCRIPTION, PAGE_TITLE } from '../../tools/lib/constants';

export const get = () =>
  rss({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    site: import.meta.env.SITE,
    items: import.meta.glob('./posts/*.md'),
    customData: `<language>en-uk</language>`,
    stylesheet: '/rss/styles.xsl',
  });
