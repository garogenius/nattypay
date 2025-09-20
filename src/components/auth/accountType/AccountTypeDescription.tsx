"use client";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { textVariant } from "@/utils/motion";
import { useRef } from "react";
import images from "../../../../public/images";

const AccountTypeDescription = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.25 });
  return (
    <motion.div
      ref={ref}
      animate={isInView ? "show" : "hidden"}
      initial="hidden"
      className="w-full h-full min-h-screen relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/80 z-10"></div>
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={images.auth.accountTypeDescription}
          alt="accountTypeDescription"
          fill
          priority
          className="object-cover"
          quality={100}
        />
      </div>

      <motion.div
        variants={textVariant(0.1)}
        className="relative z-20 w-full h-full flex flex-col justify-center px-6 2xs:px-8 sm:px-12 md:px-16 lg:px-20 py-20"
      >
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-3xl 2xs:text-4xl xs:text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to Nattypay
          </h1>
          <p className="text-base 2xs:text-lg xl:text-xl text-gray-200 leading-relaxed max-w-xl">
            Begin your financial journey and perform your daily financial
            transactions with ease
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AccountTypeDescription;
