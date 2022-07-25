import { ImageType } from './image-type';
import { getMimeType, getSrcForType } from './utils';

interface Props {
  path: string;
  type: ImageType;
  responsive?: boolean;
  key: string;
}

export function Source({ path, type, responsive = false }: Props) {
  const mimeType = getMimeType(type);

  return (
    <source
      srcSet={getSrcForType({ path, type })}
      {...(mimeType ? { type: mimeType } : null)}
      {...(responsive
        ? { media: '(-webkit-min-device-pixel-ratio: 1.5)' }
        : null)}
    />
  );
}
