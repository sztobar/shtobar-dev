export default function Footer() {
  return (
    <footer className="page-footer base mt-10 border-t pt-4 flex justify-between">
      <div className="flex flex-col text-left">
        <span className="font-bold">Background from:</span>
        <span>
          <a href="https://unsplash.com/photos/0vB_W3LoRmo">Unsplash</a>
        </span>
      </div>
      <div className="flex flex-col text-right">
        <span className="font-bold">Crafted with care using:</span>
        <span>
          <a href="https://astro.build/">Astro</a> &amp;{' '}
          <a href="https://tailwindcss.com/">Tailwind CSS</a>
        </span>
      </div>
    </footer>
  );
}
