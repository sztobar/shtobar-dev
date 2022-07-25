import { ImageType } from './image-type';

export interface ImageSources {
  path: string;
  types: ImageType[];
  responsive?: boolean;
}

export function getSources(src: string) {
  const extIndex = src.lastIndexOf('.');
  const path = src.substring(0, extIndex);

  return [
    {
      path: `${path}-2x`,
      types: [ImageType.AVIF, ImageType.WEBP, ImageType.JPG],
      responsive: true,
    },
    {
      path: path,
      types: [ImageType.AVIF, ImageType.WEBP],
    },
  ];
}

export function getMimeType(type: ImageType) {
  switch (type) {
    case ImageType.AVIF:
      return 'image/avif';
    case ImageType.WEBP:
      return 'image/webp';
    default:
      return null;
  }
}

export function getSrcForType({
  path,
  type,
}: {
  path: string;
  type: ImageType;
}) {
  return `${path}.${getExtension(type)}`;
}

export function getExtension(type: ImageType) {
  return {
    [ImageType.AVIF]: 'avif',
    [ImageType.WEBP]: 'webp',
    [ImageType.JPG]: 'jpg',
  }[type];
}
