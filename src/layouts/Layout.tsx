import { ComponentChildren } from 'preact';

import Logo from '../components/Logo';
import Menu from '../components/Menu';
import Background from '../components/Background';
import MobileMenu from '../components/MobileMenu';
import Footer from '../components/Footer';
import Head from '../components/Head';

import '../styles/globals.css';

interface Props {
  title?: string;
  metaImage?: string;
  description?: string;
  canonicalURL: string | URL;
  children: ComponentChildren;
  scripts?: string[];
}

export default function Layout({
  children,
  title,
  description,
  metaImage,
  canonicalURL,
  scripts,
}: Props) {
  return (
    <html>
      <head>
        <Head
          title={title}
          description={description}
          metaImage={metaImage}
          canonicalURL={canonicalURL}
          scripts={scripts}
        />
      </head>
      <body>
        <div className="flex flex-col h-full">
          <Background />
          <div className="w-full max-w-3xl flex-1 flex flex-col px-4 mx-auto pb-5 dark:bg-zinc-800 dark:text-zinc-200">
            <header className="flex flex-col items-stretch">
              <Logo />
              <Menu />
            </header>
            <MobileMenu />
            <div className="page-contents flex-1">
              <main>{children}</main>
            </div>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
