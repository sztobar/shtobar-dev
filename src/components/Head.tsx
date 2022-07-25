import {
  META_IMAGE,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
} from '../../tools/lib/constants';

interface Props {
  title?: string;
  description?: string;
  canonicalURL: string | URL;
  metaImage?: string;
  scripts?: string[];
}

export default function Head({
  title = PAGE_TITLE,
  description = PAGE_DESCRIPTION,
  canonicalURL,
  metaImage = META_IMAGE,
  scripts,
}: Props) {
  return (
    <>
      {/* Global Metadata */}
      <meta charSet="utf-8" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <meta name="viewport" content="width=device-width, minimum-scale=1.0" />
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Shtobar-dev Blog"
        href="/rss.xml"
      />

      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalURL.toString()} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={metaImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalURL.toString()} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={metaImage} />

      {scripts?.map((src) => (
        <script async src={src} />
      ))}
    </>
  );
}
