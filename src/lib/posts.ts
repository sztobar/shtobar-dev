import { MarkdownInstance } from 'astro';

export interface PostData {
  url: string;
  pubDate: string;
  title: string;
  description: string;
  tag: string;
  image?: string;
}

export function getSortedPosts(
  markdownPosts: MarkdownInstance<Omit<PostData, 'url'>>[]
): PostData[] {
  if (process.env['NODE_ENV'] === 'production') {
    markdownPosts = markdownPosts.filter(
      ({ frontmatter }) => !frontmatter.draft
    );
  }

  const posts = markdownPosts.map(({ frontmatter, url, file }) => ({
    url: url ?? file,
    ...frontmatter,
  }));

  return sortByDate(posts);
}

export function sortByDate<T extends { pubDate: string }>(coll: T[]) {
  return [...coll].sort(({ pubDate: a }, { pubDate: b }) => {
    if (a < b) {
      return 1;
    } else if (a > b) {
      return -1;
    } else {
      return 0;
    }
  });
}
