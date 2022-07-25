import Tag from './Tag';
import Date from './Date';
import { PostData } from '../lib/posts';

interface Props extends PostData {
  key: string;
}

export default function PostCard({ url, title, description, pubDate, tag }: Props) {
  return (
    <a
      href={url}
      className="card flex flex-col gap-2 md:gap-4 group hover:no-underline base"
    >
      <div>
        <div className="text-lg text-link group-hover:underline">{title}</div>
        <div className="text-md">{description}</div>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2 md:gap-4">
          <Date dateString={pubDate} />
          <Tag tag={tag} />
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          />
        </svg>
      </div>
    </a>
  );
}
