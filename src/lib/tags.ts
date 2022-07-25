import { PostData } from './posts';

export function getAllTags(posts: PostData[]) {
  const tags = posts.map((post) => post.tag);
  const tagsSet = new Set(tags);
  const uniqueTags = Array.from(tagsSet);
  return uniqueTags;
}

export function getPostsForTag(tag: string, posts: PostData[]) {
  return posts.filter(({ tag: postTag }) => postTag === tag);
}
