"use client";

import SectionWrapper from "@/utils/hoc/SectionWrapper";
import { motion } from "framer-motion";
import Image from "next/image";
import images from "../../../../public/images";

const About = () => {
  return (
    <section className="w-full flex justify-center">
      <div className="w-[90%] lg:w-[88%] py-10 sm:py-14 lg:py-16 flex flex-col gap-8 lg:gap-12">
        {/* Top heading */}
        <div className="w-full flex flex-col items-center text-center gap-3">
          <span className="h-1.5 w-20 rounded-full bg-primary"></span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-200 dark:text-text-400">Who are we</h2>
          <p className="max-w-5xl text-sm sm:text-base text-text-1700 dark:text-text-800">
            Nattypay is a leading and innovative financial services platform with an overarching vision of bridging
            the financial divide by providing secured and reliable banking services. With corporate headquarters in
            Lagos, Nigeria, our objective is to ensure financial inclusion for everyone, including persons in the
            furthest and remotest parts of Nigeria.
          </p>
        </div>

        {/* Content row */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0 items-center">
          {/* Text card */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl bg-bg-1100 border border-border-700/60 shadow-2xl p-5 sm:p-6 lg:p-8 relative z-20 lg:translate-x-12 xl:translate-x-16">
              <h3 className="text-lg sm:text-xl font-semibold text-text-200 mb-2">SmartCash Payment Service Bank</h3>
              <p className="text-sm sm:text-base text-text-800 leading-relaxed">
                As an answer to solve the issue of local and global people in the
                world face getting standard and quality Financial for daily
                well-being, spring forth NATTYPAY GLOBAL SOLUTION LIMITED. Over time
                we&apos;ve been able to solve this great complication in our society
                and put big promising smiles on people&apos;s faces thus far.
                {/* Add margin here for space */}
                <span className="sm:hidden block my-4"></span>
                In an era defined by rapid technological evolution, NATTYPAY GLOBAL
                SOLUTION LIMITED emerges as a key player, shaping the future through
                a commitment to excellence, foresight, and a relentless pursuit of
                groundbreaking advancements. Our journey is rooted in a deep
                understanding of the dynamic needs of the modern consumer, and we
                take pride in crafting solutions that not only meet but exceed
                expectations.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <div className="relative z-10 w-[90%] sm:w-[85%] lg:w-[65%] max-w-[480px] h-80 sm:h-96 lg:h-[420px] rounded-2xl overflow-hidden lg:-ml-10 xl:-ml-14">
              <Image
                src="/images/home/landingPage/gh.jpg"
                alt="About section visual"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionWrapper(About, "about");
