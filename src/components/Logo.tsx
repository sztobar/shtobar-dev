import { AnimatedLogo } from './AnimatedLogo';

export default function Logo() {
  return (
    <h1 className="flex text-4xl font-mono my-4 gap-2">
      <span className="flex-1 border-b border-zinc-800 dark:border-zinc-200 border-solid m-auto" />
      {'{'}
      <AnimatedLogo />
      {'-dev}'}
      <span className="flex-1 border-b border-zinc-800 dark:border-zinc-200 border-solid m-auto" />
    </h1>
  );
}
