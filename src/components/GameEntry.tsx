import Image from './Image';

interface Props {
  label: string;
  url: string;
  image: string;
  year: string;
  description: string;
  key?: string;
}

const getImagePath = (imageName: string) => `/images/games/${imageName}`;

export default function GameEntry({
  label,
  url,
  image,
  year,
  description,
}: Props) {
  return (
    <li className="card gap-3 md:gap-5 flex flex-col md:flex-row">
      <Image
        className="object-contain mx-auto w-[256px]"
        pictureClassName="flex-shrink-0"
        alt={`${label} image`}
        src={getImagePath(image)}
      />
      <div>
        <h3 className="text-xl mb-1">
          {label} &middot; {year}
        </h3>
        <a
          className="dark:text-emerald-400 hover:underline mb-3 block"
          href={url}
        >
          {url}
        </a>
        <p>{description}</p>
      </div>
    </li>
  );
}
