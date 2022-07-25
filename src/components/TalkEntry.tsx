interface Props {
  label: string;
  videoUrl?: string;
  slidesUrl: string;
  year: string;
  description: string;
  key?: string;
}

export default function TalkEntry({
  label,
  year,
  description,
  videoUrl,
  slidesUrl,
}: Props) {
  return (
    <li className="card flex-col">
      <h3 className="text-xl mb-1">
        {label} &middot; {year}
      </h3>
      <div className="flex gap-2 mb-3">
        {videoUrl && (
          <a className="dark:text-emerald-400 hover:underline" href={videoUrl}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 inline mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Video link
          </a>
        )}
        <a className="dark:text-emerald-400 hover:underline" href={slidesUrl}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 inline mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
          Slides link
        </a>
      </div>
      <p>{description}</p>
    </li>
  );
}
