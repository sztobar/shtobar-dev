interface Props {
  label: string;
  url: string;
  year: string;
  description: string;
  key?: string;
}

export default function ExternalBlogPostEntry({
  label,
  year,
  description,
  url,
}: Props) {
  return (
    <li className="card">
      <div className="">
        <h3 className="text-xl mb-1">
          {label} &middot; {year}
        </h3>
        <div className="flex gap-2 mb-3">
          <a className="dark:text-emerald-400 hover:underline" href={url}>
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            Link
          </a>
        </div>
        <p>{description}</p>
      </div>
    </li>
  );
}
