import clsx from 'clsx';
import { getMenuOptions } from '../lib/menu';

interface MenuOptionProps {
  label: string;
  index: number;
  url: string;
  key: string;
}

const MenuOption = ({ label, url, index }: MenuOptionProps) => (
  <li className="relative my-5 text-2xl">
    <div className="dark:text-white top-1/2 w-full absolute m-auto border-b"></div>
    <div className={`mobile-menu-option mobile-menu-option__${index}`}>
      <a
        href={url}
        aria-label={label}
        className={clsx(
          'dark:text-zinc-200 dark:bg-zinc-800 group',
          index % 2 ? '-translate-x-full inline-block' : 'inline-flex'
        )}
      >
        <span className="-translate-x-1 pl-1 dark:bg-zinc-800 will-change-transform transition-transform group-active:-translate-x-2">
          {'{'}
        </span>
        <span className="inline-block relative dark:bg-zinc-800">{label}</span>
        <span className="translate-x-1 pr-1 dark:bg-zinc-800 will-change-transform transition-transform group-active:translate-x-2">
          {'}'}
        </span>
      </a>
    </div>
  </li>
);

export default function MobileMenu() {
  return (
    <nav className="hidden mobile-menu">
      <ul className="flex flex-col justify-evenly overflow-hidden">
        {getMenuOptions().map(({ label, url }, index) => (
          <MenuOption key={label} label={label} url={url} index={index} />
        ))}
      </ul>
    </nav>
  );
}
