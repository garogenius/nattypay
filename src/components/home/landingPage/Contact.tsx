"use client";
import { SectionWrapper } from "@/utils/hoc";
import { textVariant, zoomIn } from "@/utils/motion";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import images from "../../../../public/images";
import { FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import CustomButton from "@/components/shared/Button";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.25 });

  return (
    <div className="w-full flex justify-center">
      <motion.div
        ref={ref}
        animate={isInView ? "show" : "hidden"}
        initial="hidden"
        className="w-[90%] lg:w-[88%] flex flex-col items-center h-full py-12 sm:py-16 lg:py-20"
      >
        <div className="w-full h-full flex max-lg:flex-col items-center gap-5 2xs:gap-8 lg:gap-12 px-5 xs:px-7 py-6 xs:py-8 sm:py-10 rounded-2xl bg-bg-600 dark:bg-bg-1100 shadow-md">
          {/* Left: Text */}
          <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col gap-4">
            <motion.div variants={textVariant(0.1)} className="w-full lg:w-[90%] flex flex-col items-start text-left gap-3">
              <span className="h-1.5 w-20 rounded-full bg-primary"></span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-200 dark:text-text-400">
                We’re here to help
              </h2>
              <p className="text-sm sm:text-base text-text-1700 dark:text-text-800">
                If you have questions or need assistance, our support team is ready to help you get the most out of
                Nattypay. Reach us by phone or email and we’ll respond promptly.
              </p>
            </motion.div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <FaPhone />
                </div>
                <p className="text-sm sm:text-base text-text-200 dark:text-text-400">+2348134146906</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <MdEmail className="text-lg" />
                </div>
                <p className="text-sm sm:text-base text-text-200 dark:text-text-400">support@Nattypay.com</p>
              </div>
            </div>
            <motion.div variants={zoomIn(0.2, 0.5)}>
              <CustomButton className="max-lg:hidden rounded-3xl px-6 py-3 border border-primary text-black bg-secondary">
                Chat Support
              </CustomButton>
            </motion.div>
          </div>

          <div className="w-full lg:w-[45%] xl:w-[40%] h-full flex justify-end">
            <Image
              alt=""
              src={images.landingPage.contactBg}
              className="w-[100%] rounded-xl"
            />
          </div>

          <motion.div className="w-full flex justify-start lg:hidden" variants={zoomIn(0.2, 0.5)}>
            <CustomButton className="rounded-3xl px-6 py-3 border border-primary text-black bg-secondary">
              Chat Support
            </CustomButton>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");
