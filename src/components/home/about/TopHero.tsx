"use client";
import { motion } from "framer-motion";
import { textVariant, fadeIn } from "@/utils/motion";
import Image from "next/image";
import images from "../../../../public/images";
import Button from "@/components/shared/Button";

const TopHero = () => {
  return (
    <section className="relative w-full flex justify-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/images/myhero.png')" }}>
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

      {/* Content */}
      <div className="relative w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 mb-6"
          >
            <span className="text-sm font-medium text-primary">
              About NattyPay
            </span>
          </motion.div>
          
          <motion.h1 
            variants={textVariant(0.2)}
            initial="hidden"
            animate="show"
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-dark-primary dark:text-white mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Empowering Financial
            </span>
            <br className="hidden sm:block" />
            <span className="text-dark-primary dark:text-white">Freedom Across Africa</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeIn('up', 'spring', 0.3, 1)}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
          >
            We're revolutionizing the way Africa transacts, making financial services more accessible, 
            secure, and efficient for everyone, everywhere.
          </motion.p>
          
          <motion.div 
            variants={fadeIn('up', 'spring', 0.4, 1)}
            className="flex flex-col sm:flex-row justify-center gap-4 mt-8"
          >
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TopHero;

