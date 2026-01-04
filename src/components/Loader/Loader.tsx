import Image from "next/image";
import images from "../../../public/images";

const Loader = () => {
  return (
    <div className="z-[9999] fixed inset-0 bg-black flex justify-center items-center">
      {/* Logo in center with GIF animation */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Image
          src={images.nattyLoader}
          alt="Loading"
          className="w-40 object-contain"
          unoptimized
        />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;
