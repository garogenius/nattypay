"use client";
import { ServicesData } from "@/constants";
import SectionWrapper from "@/utils/hoc/SectionWrapper";
import { scaleVariants, staggerContainer } from "@/utils/motion";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import images from "../../../../public/images";
import { useRef } from "react";

const Services = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.25 });

  return (
    <motion.div
      ref={ref}
      animate={isInView ? "show" : "hidden"}
      initial="hidden"
      className="w-full flex flex-col "
    >
      <div className="w-full flex flex-col items-center py-8 sm:py-10 lg:py-12">
        <motion.div
          // variants={textVariant(0.1)}
          className="w-[90%] xs:w-[80%] md:w-[70%] xl:w-[50%] flex flex-col items-center text-center gap-3"
        >
          <span className="h-1.5 w-20 rounded-full bg-primary"></span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-200 dark:text-text-400">
            NattyPay Features
          </h2>
          <p className="max-w-5xl text-sm sm:text-base text-text-1700 dark:text-text-800">
            Pay all your bills at once with Nattypay without leaving your home. Whether you need to send money,
            pay bills, buy airtime, or manage your finances and savings, Nattypay is here to simplify your
            financial life.
          </p>
        </motion.div>
      </div>
      <div className="w-full flex justify-center pt-4 sm:pt-6 lg:pt-8 pb-12 sm:pb-16 lg:pb-20">
        <div className="w-[88%] sm:w-[86%] lg:w-[84%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 items-start">
          {/* Left: Image */}
          <div className="w-full">
            <div className="relative w-full h-80 sm:h-[28rem] lg:h-[600px] rounded-2xl overflow-hidden">
              <Image
                alt="services"
                src={images.landingPage.heroImage}
                fill
                className="object-contain"
                sizes="(max-width: 1000px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Right: Services grid (2 columns) */}
          <motion.div
            variants={staggerContainer(0.1, 0.2)}
            className="grid grid-cols-2 gap-3 place-items-stretch"
          >
            {ServicesData.map((item, index) => (
              <motion.div
                variants={scaleVariants}
                whileInView={scaleVariants.whileInView}
                key={index}
                className={`w-full flex items-center gap-3 2xs:gap-4 rounded-lg bg-bg-600 dark:bg-bg-1100 px-3 py-3 md:py-3 ${
                  item.title?.toLowerCase() === 'other bills' ? 'col-span-2' : ''
                }`}
              >
                <div className="rounded-full flex justify-center items-center overflow-hidden w-10 h-10 2xs:w-11 2xs:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14">
                  <Image
                    alt="icon"
                    src={item.image}
                    className="w-6 2xs:w-7 md:w-8 lg:w-9 h-auto"
                  />
                </div>
                <div className="flex flex-col gap-0.5 text-left">
                  <h2 className="text-xs 2xs:text-sm text-text-700 dark:text-text-800 font-semibold">
                    {item.title}
                  </h2>
                  <p className="text-text-200 dark:text-text-800 text-[9.5px] xs:text-[10px]">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SectionWrapper(Services, "services");
