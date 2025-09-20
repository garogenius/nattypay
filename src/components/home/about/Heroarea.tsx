"use client";

import { motion, useInView } from "framer-motion";
import { SectionWrapper } from "@/utils/hoc";
import { textVariant, fadeIn, staggerContainer } from "@/utils/motion";
import { useRef } from "react";
import Image from "next/image";

// Core Values Data (make sure to import or define this)
const CoreValuesData = [
  {
    title: "Integrity",
    description: "We uphold the highest standards of integrity in all our actions.",
    image: "/images/icons/integrity.svg"
  },
  {
    title: "Innovation",
    description: "We embrace creativity and innovation to drive financial solutions.",
    image: "/images/icons/innovation.svg"
  },
  {
    title: "Customer Focus",
    description: "Our customers are at the heart of everything we do.",
    image: "/images/icons/customer.svg"
  },
  {
    title: "Excellence",
    description: "We strive for excellence in all aspects of our services.",
    image: "/images/icons/excellence.svg"
  },
  {
    title: "Teamwork",
    description: "We believe in the power of collaboration and teamwork.",
    image: "/images/icons/teamwork.svg"
  }
];

const Heroarea = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.25, once: true });

  return (
    <section className="w-full flex justify-center py-10 sm:py-14 lg:py-16">
      <div className="w-[90%] lg:w-[88%] flex flex-col gap-8 lg:gap-12">
        {/* Top heading */}
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={textVariant(0.2)}
          className="w-full flex flex-col items-center text-center gap-3"
        >
          <motion.span 
            variants={fadeIn('up', 'spring', 0.1, 1)}
            className="h-1.5 w-20 rounded-full bg-primary"
          />
          <motion.h2 
            variants={fadeIn('up', 'spring', 0.2, 1)}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-200 dark:text-text-400"
          >
            Who We Are
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'spring', 0.3, 1)}
            className="max-w-5xl text-sm sm:text-base text-text-1700 dark:text-text-800 leading-relaxed"
          >
            Nattypay Global Solution Ltd. is a registered Fin Tech company in Nigeria,
            committed to revolutionizing local and global financial services by providing
            innovative, secure, and user-friendly solutions that cater to the diverse
            needs of our customers. Founded with the vision of enhancing financial
            inclusion and empowering individuals and businesses.
          </motion.p>
        </motion.div>

        {/* Content row */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text card */}
          <motion.div 
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl bg-gray-900 border border-gray-700/60 shadow-2xl p-5 sm:p-6 lg:p-8 relative z-20">
              <h3 className="text-lg sm:text-xl font-semibold text-primary mb-4">
                Our Commitment to Excellence
              </h3>
              <p className="text-sm sm:text-base text-white dark:text-white leading-relaxed">
                At Nattypay, we are dedicated to providing cutting-edge financial solutions
                that empower individuals and businesses across Africa. Our platform is built
                on a foundation of trust, security, and innovation, ensuring that every
                transaction is seamless and every user experience is exceptional.
                <span className="block my-4"></span>
                We understand the dynamic needs of the modern consumer and are committed to
                crafting solutions that not only meet but exceed expectations. Our team of
                experts works tirelessly to ensure that our services remain at the forefront
                of financial technology, driving financial inclusion across the continent.
              </p>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div 
            className="order-1 lg:order-2 flex items-center justify-center"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: 'spring', delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative z-10 w-[90%] sm:w-[85%] lg:w-[65%] max-w-[480px] h-80 sm:h-96 lg:h-[420px] rounded-2xl overflow-hidden lg:-ml-10 xl:-ml-14 shadow-xl">
              <Image
                src="/images/home/landingPage/gh.jpg"
                alt="NattyPay Team"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* Mission & Vision Section */}
        <div className="w-full flex flex-col gap-12 mt-12 lg:mt-16">
          {/* Mission with Image */}
          <div className="w-full flex flex-col lg:flex-row-reverse gap-8 items-center">
            {/* Mission Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2 bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1.5 w-8 rounded-full bg-primary" />
                <h3 className="text-xl font-bold text-white dark:text-white">
                  Our Mission
                </h3>
              </div>
              <p className="text-sm sm:text-base text-white dark:text-white leading-relaxed">
                Our mission at Nattypay is to deliver cutting-edge global
                financial services that improve the lives of Nigerians by
                offering unparalleled convenience, robust security, and
                financial freedom. We strive to bridge the gap between
                traditional banking and modern financial needs, ensuring that
                every individual, regardless of their location or socio-economic
                status, has access to reliable financial tools.
              </p>
            </motion.div>
            
            {/* Mission Image */}
            <motion.div 
              className="w-full lg:w-1/2 h-48 lg:h-64 relative rounded-2xl overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              viewport={{ once: true }}
            >
              <Image
                src="/images/home/about/m.png"
                alt="Our Mission"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </div>

          {/* Vision with Image */}
          <div className="w-full flex flex-col lg:flex-row gap-8 items-center">
            {/* Vision Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2 bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1.5 w-8 rounded-full bg-primary" />
                <h3 className="text-xl font-bold text-white dark:text-white">
                  Our Vision
                </h3>
              </div>
              <p className="text-sm sm:text-base text-white dark:text-white leading-relaxed">
                We envision becoming the most trusted and widely used financial
                service provider across the globe. Our goal is to transform the
                financial landscape by continually innovating and expanding our
                services to meet the evolving needs of our customers. We aim to
                be a catalyst for economic growth and prosperity, helping
                individuals and businesses thrive in the digital age.
              </p>
            </motion.div>
            
            {/* Vision Image */}
            <motion.div 
              className="w-full lg:w-1/2 h-48 lg:h-64 relative rounded-2xl overflow-hidden"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              viewport={{ once: true }}
            >
              <Image
                src="/images/home/about/v.png"
                alt="Our Vision"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="w-full mt-16 lg:mt-20">
          <motion.div
            variants={textVariant(0.1)}
            className="w-full mb-8 lg:mb-12"
          >
            <h1 className="text-2xl xs:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white dark:text-white">
              Our Core Values
            </h1>
          </motion.div>
          
          <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Core Values List */}
            <div className="w-full lg:w-1/2 grid grid-cols-1 gap-4">
              {CoreValuesData && CoreValuesData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={24}
                      height={24}
                      className="w-5 h-5 text-primary"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-200 dark:text-gray-300 mt-1">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Core Values Image */}
            <motion.div 
              className="w-full lg:w-1/2 h-96 lg:h-[500px] relative rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              viewport={{ once: true }}
            >
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Team collaboration representing our core values"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionWrapper(Heroarea, "about-hero");
