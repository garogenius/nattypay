"use client";
import SectionWrapper from "@/utils/hoc/SectionWrapper";
import { scaleVariants, staggerContainer, textVariant } from "@/utils/motion";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import images from "../../../../public/images";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const PartnersImages = [
  images.landingPage.partner1,
  images.landingPage.partner2,
  images.landingPage.partner3,
  images.landingPage.partner4,
  images.landingPage.partner5,
  images.landingPage.partner6,
  images.landingPage.partner7,
  images.landingPage.partner8,
  images.landingPage.partner9,
  images.landingPage.partner10,
  images.landingPage.partner11,
  images.landingPage.partner12,
  images.landingPage.partner13,
  images.landingPage.partner14,
  images.landingPage.partner15,
  images.landingPage.partner16,
  images.landingPage.partner17,
  images.landingPage.partner18,
];

const Providers = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.25 });

  const bgStyles = {
    backgroundImage: "url('/images/home/landingPage/providersBg.svg')", // Adjust the path as needed
    backgroundPosition: "center",
    // Use true black background for the section
    backgroundColor: "#000000",
    backgroundRepeat: "no-repeat",
    zIndex: 10,
  };

  return (
    <div style={bgStyles} className="w-full flex justify-center">
      <motion.div
        ref={ref}
        animate={isInView ? "show" : "hidden"}
        initial="hidden"
        className="w-[90%] lg:w-[88%] h-full -mt-6 sm:-mt-8 lg:-mt-12 py-6 sm:py-8 lg:py-10"
      >
        {/* Card container */}
        <motion.div
          variants={textVariant(0.1)}
          className="w-full rounded-[24px] border border-border-400/60 overflow-hidden"
          style={{ backgroundColor: "rgb(20 20 20 / var(--tw-bg-opacity, 1))" }}
        >
          {/* Header row */}
          <div className="w-full flex items-start justify-between gap-4 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="flex flex-col gap-1.5 text-text-200">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-white">
                Businesses that
                <br />
                Count On Us
              </h2>
              <p className="text-xs sm:text-sm text-text-1700">
                Join <span className="text-primary font-semibold">60+</span> business owners on the Nattypay platform
              </p>
            </div>
            {/* Big outlined 5m+ */}
            <div className="hidden sm:block">
              <span
                className="text-[64px] sm:text-[80px] lg:text-[96px] leading-none font-extrabold tracking-tight"
                style={{ WebkitTextStroke: "2px #D4B139", color: "transparent" }}
              >
                60+
              </span>
            </div>
          </div>

          {/* Logos slider */}
          <div className="w-full px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              loop
              grabCursor
              spaceBetween={16}
              breakpoints={{
                320: { slidesPerView: 2 },
                480: { slidesPerView: 3 },
                640: { slidesPerView: 4 },
                1024: { slidesPerView: 5 },
                1280: { slidesPerView: 6 },
              }}
            >
              {PartnersImages.map((item, index) => (
                <SwiperSlide key={index}>
                  <motion.div
                    variants={scaleVariants}
                    whileInView={scaleVariants.whileInView}
                    className="h-24 sm:h-28 lg:h-32 bg-white rounded-xl overflow-hidden flex items-center justify-center"
                  >
                    <Image src={item} alt="partner logo" className="max-w-full max-h-full object-contain" />
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Providers, "providers");
