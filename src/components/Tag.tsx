interface Props {
  tag: string;
  link?: boolean;
}

const Tag = ({ tag, link = false }: Props) =>
  link ? (
    <a href={`/tags/${tag}`}>{`#${tag}`}</a>
  ) : (
    <span className="tag">{`#${tag}`}</span>
  );

export default Tag;
