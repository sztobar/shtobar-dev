import { MarkdownInstance } from 'astro';

export interface PostData {
  url: string;
  pubDate: string;
  title: string;
  description: string;
  tag: string;
  image?: string;
  draft?: boolean;
}

export function getSortedPosts(
  markdownPosts: MarkdownInstance<PostData>[]
): PostData[] {
  if (process.env['NODE_ENV'] === 'production') {
    markdownPosts = markdownPosts.filter(
      ({ file, frontmatter }) =>
        !file.match('/posts/test.md$') && !frontmatter.draft
    );
  }

  const posts = markdownPosts.map(({ frontmatter, url }) => ({
    url,
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
