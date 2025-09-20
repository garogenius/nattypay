"use client";

import SectionWrapper from "@/utils/hoc/SectionWrapper";
import { motion } from "framer-motion";
import { staggerContainer, textVariant, scaleVariants } from "@/utils/motion";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Esther A.",
    role: "Small Business Owner",
    quote:
      "Nattypay made collections easy and fast for my store. Transfers are instant and fees are super fair.",
  },
  {
    name: "Yusuf K.",
    role: "Freelance Designer",
    quote:
      "The virtual cards are a lifesaver for online subscriptions. I love the spending controls!",
  },
  {
    name: "Chika N.",
    role: "Agent",
    quote:
      "Becoming a Nattypay agent has created a new income stream for me while serving my community.",
  },
  {
    name: "Samuel O.",
    role: "Software Engineer",
    quote:
      "Integration was straightforward. The docs and webhooks just worked out of the box.",
  },
];

const StarRow = () => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className="inline-block w-3.5 h-3.5 rounded-full bg-secondary" />
    ))}
  </div>
);

const Testimonials = () => {
  return (
    <section className="w-full flex justify-center">
      <motion.div
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="w-[90%] lg:w-[88%] flex flex-col items-center py-12 sm:py-16 lg:py-20"
      >
        {/* Title */}
        <motion.div variants={textVariant(0.1)} className="w-full xs:w-[80%] md:w-[70%] xl:w-[50%] flex flex-col items-center text-center gap-3">
          <span className="h-1.5 w-20 rounded-full bg-primary" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-200 dark:text-text-400">
            What our customers are saying
          </h2>
          <p className="max-w-4xl text-sm sm:text-base text-text-1700 dark:text-text-800">
            Real stories from people and businesses using Nattypay to move money, get paid, and grow.
          </p>
        </motion.div>

        {/* Slider */}
        <div className="mt-8 w-full">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop
            grabCursor
            spaceBetween={12}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {testimonials.map((t, idx) => (
              <SwiperSlide key={idx}>
                <motion.div
                  variants={scaleVariants}
                  whileInView={scaleVariants.whileInView}
                  className="rounded-2xl bg-bg-600 dark:bg-bg-1100 border border-border-400/60 p-4 sm:p-5 lg:p-6 shadow-lg flex flex-col gap-3 h-full"
                >
                  <StarRow />
                  <p className="text-sm sm:text-base text-text-200 dark:text-text-400 leading-relaxed">“{t.quote}”</p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-full bg-bg-1200 overflow-hidden" />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-text-200 dark:text-text-400">{t.name}</span>
                      <span className="text-xs text-text-1700 dark:text-text-800">{t.role}</span>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </motion.div>
    </section>
  );
};

export default SectionWrapper(Testimonials, "testimonials");
