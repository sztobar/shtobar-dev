interface Props {
  tags: string[];
  active?: string;
}

export default function TagsFilters({ tags, active }: Props) {
  return tags.length > 1 ? (
    <div className="flex gap-2 mb-4">
      <p>Quick filters:</p>
      {tags.map((tag) => (
        <a
          key={tag}
          className={active === tag ? 'font-bold' : ''}
          href={`/tags/${tag}`}
        >
          #{tag}
        </a>
      ))}
    </div>
  ) : null;
}
