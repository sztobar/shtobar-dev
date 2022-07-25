export default function HamburgerMenu() {
  return (
    <div className="md:hidden absolute left-0 top-0 bottom-0 right-0 mx-auto max-w-xl overflow-hidden">
      <button
        id="open-mobile-menu"
        aria-label="Open Menu"
        className="open-mobile-menu-btn text-inherit absolute left-2 h-full flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <button
        id="close-mobile-menu"
        aria-label="Close Menu"
        className="close-mobile-menu-btn text-inherit absolute left-2 h-full flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
