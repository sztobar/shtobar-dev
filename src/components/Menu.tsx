import { getMenuOptions } from '../lib/menu';

interface MenuOptionProps {
  label: string;
  url: string;
  key: string;
}

const MenuOption = ({ label, url }: MenuOptionProps) => (
  <li className="z-10">
    <a
      href={url}
      className="base flex group hover:no-underline"
      aria-label={label}
    >
      <span className="base transition-transform will-change-transform -translate-x-1 pl-1 group-hover:-translate-x-2">
        {'{'}
      </span>
      <span className="group-hover:underline">{label}</span>
      <span className="base transition-transform will-change-transform translate-x-1 pr-1 group-hover:translate-x-2">
        {'}'}
      </span>
    </a>
  </li>
);

export default function Menu() {
  return (
    <nav className="hidden md:block md:mb-4 relative">
      <div className="base absolute h-1/2 w-full border-solid border-b" />
      <ul className="flex justify-evenly">
        {getMenuOptions().map(({ label, url }) => (
          <MenuOption key={label} label={label} url={url} />
        ))}
      </ul>
    </nav>
  );
}
