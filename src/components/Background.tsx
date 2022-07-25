import HamburgerMenu from './HamburgerMenu';
import Image from './Image';

export default function Background() {
  return (
    <div className="h-32 md:h-48 w-full relative">
      <div className="overflow-hidden ">
        <Image
          className="object-cover h-32 md:h-48 w-full max-w-[960px] mx-auto"
          src="/images/bg/racoon_960x192.jpg"
          alt="Background with a racoon"
        />
      </div>
      <HamburgerMenu />
    </div>
  );
}
