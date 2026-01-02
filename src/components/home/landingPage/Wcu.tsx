"use client";
import { WcuData } from "@/constants";
import SectionWrapper from "@/utils/hoc/SectionWrapper";
import {
  fadeIn,
  scaleVariants,
  staggerContainer,
  textVariant,
  zoomIn,
} from "@/utils/motion";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import images from "../../../../public/images";
import icons from "../../../../public/icons";
import CustomButton from "@/components/shared/Button";
import { GoArrowRight } from "react-icons/go";
import useNavigate from "@/hooks/useNavigate";

const Wcu = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.25 });

  return (
    <div className="w-full flex justify-center">
      <motion.div
        ref={ref}
        animate={isInView ? "show" : "hidden"}
        initial="hidden"
        className="w-[90%] lg:w-[88%] flex flex-col gap-0 lg:gap-10 items-center h-full py-12 sm:py-16 lg:py-20"
      >
        <motion.div
          variants={textVariant(0.1)}
          className="w-full 2xs:w-[90%] xs:w-[80%] md:w-[70%] xl:w-[60%] flex flex-col items-center text-center gap-3"
        >
          <span className="h-1.5 w-20 rounded-full bg-primary"></span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-200 dark:text-text-400">
            Why Choose Nattypay?
          </h2>
          <p className="max-w-5xl text-sm sm:text-base text-text-1700 dark:text-text-800">
            Nattypay is more than just a financial service provider; we are a
            community dedicated to improving financial well-being
          </p>
        </motion.div>
        <div className="flex max-lg:flex-col items-center w-full max-lg:gap-6">
          <motion.div
            variants={fadeIn("right", "spring", 0.5, 0.75)}
            className="w-full lg:w-[50%]"
          >
            <Image
              alt="bg"
              src={images.landingPage.wcuBgImage}
              className="w-full"
            />
          </motion.div>
          <motion.div
            variants={staggerContainer(0.1, 0.2)}
            className="relative w-full lg:w-[50%] flex flex-col gap-4 2xs:gap-8"
          >
            <div
              className="absolute top-0 -left-[40rem] -inset-10 opacity-60 dark:opacity-40"
              style={{
                background: `
                radial-gradient(
                  circle at center,
                  rgba(212, 177, 57, 0.4) 0%,
                  rgba(212, 177, 57, 0.2) 40%,
                  rgba(212, 177, 57, 0.1) 60%,
                  rgba(212, 177, 57, 0) 80%
                )
              `,
                filter: "blur(60px)",
                transform: "scale(1.1)",
              }}
            />
            {WcuData.map((item, index) => (
              <motion.div
                variants={scaleVariants}
                whileInView={scaleVariants.whileInView}
                key={index}
                className="flex items-center gap-3 2xs:gap-4 "
              >
                <div className="w-[16%] 3xs:w-[13%] 2xs:w-[10%] rounded-full flex justify-center items-center p-2.5 xs:p-3 bg-bg-1200 overflow-hidden">
                  <Image
                    alt="icon"
                    src={icons.landingPage.wcuCheckIcon}
                    className={``}
                  />
                </div>
                <div className="w-[84%] 3xs:w-[88%] 2xs:w-[90%] flex flex-col gap-0.5 xl:gap-1.5 text-text-200 dark:text-text-400">
                  <h2 className="text-base 2xs:text-lg 2xl:text-xl font-bold">
                    {item.title}
                  </h2>
                  <p className="text-xs xs:text-sm 2xl:text-base">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
            <motion.div
              className="z-10 max-sm:mt-4"
              variants={zoomIn(0.2, 0.5)}
            >
              <CustomButton
                onClick={() => {
                  navigate("/welcome");
                }}
                className="flex items-center gap-2.5  rounded-3xl px-6 py-3 bg-primary text-black"
              >
                <p> Create Account</p> <GoArrowRight className="text-2xl" />
              </CustomButton>
            </motion.div>
          </motion.div>{" "}
        </div>{" "}
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Wcu, "wcu");
