import { ImageType } from './image-type';
import { getSources, ImageSources } from './utils';
import { Source } from './Source';

interface Props {
  className?: string;
  pictureClassName?: string;
  alt?: string;
  types?: ImageType[];
  responsive?: boolean;
  src: string;
  width?: string;
  height?: string;
}

export default function Image({
  className,
  pictureClassName,
  alt,
  src,
  width,
  height,
}: Props) {
  const sources = getSources(src);

  return (
    <picture className={pictureClassName}>
      {sources.map(({ path, types, responsive }) =>
        types.map((type) => (
          <Source
            key={`${path}${type}${responsive}`}
            path={path}
            type={type}
            responsive={responsive}
          />
        ))
      )}
      <img
        className={className}
        alt={alt}
        loading="lazy"
        src={src}
        width={width}
        height={height}
      />
    </picture>
  );
}
