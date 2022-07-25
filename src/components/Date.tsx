import { parseISO, format } from 'date-fns';

interface Props {
  dateString: string;
}

export default function Date({ dateString }: Props) {
  const date = parseISO(dateString);

  return (
    <span className="flex items-center text-zinc-700 dark:text-zinc-300">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      {dateString && (
        <time dateTime={dateString}>{format(date, 'LLLL d, yyyy')}</time>
      )}
    </span>
  );
}
