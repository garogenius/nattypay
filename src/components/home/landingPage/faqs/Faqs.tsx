"use client";

import { useRef, useState } from "react";
import Accordion from "./Accordion";
import { motion, useInView } from "framer-motion";
import { textVariant } from "@/utils/motion";
import { SectionWrapper } from "@/utils/hoc";

const Faqs: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.25 });

  const AccordionsData = [
    {
      title: "What is Nattypay?",
      content:
        "Experience seamless financial transactions with Nattypay, a leading financial service provider locally and globally. We make banking easy and convenient by allowing you to pay for multiple services in one place, access financial tools, and even earn through our agent program.",
    },
    {
      title: "How can I download the Nattypay app?",
      content:
        "You can download the Nattypay app from the Google Play Store for Android or the Apple App Store for iOS. Install the app and enjoy seamless access to our features.",
    },
    {
      title: "Is Nattypay secure?",
      content:
        "Your security is our priority. We use advanced encryption to protect your personal and payment information. We don’t store sensitive payment details and adhere to global compliance standards.",
    },
    {
      title: "How do I create a Nattypay account?",
      content:
        "Creating an account is simple. Visit our platform, click 'Sign Up,' and provide the necessary details. Once registered, you can manage transactions, save frequent billers, and access our reseller program.",
    },
    {
      title: "I forgot my password. How do I reset it?",
      content:
        "To reset your password, click 'Forgot Password' on the login page. Follow the instructions to receive a password reset link via email, and then set a new password.",
    },
    {
      title: "What bills can I pay using Nattypay?",
      content:
        "Nattypay allows you to pay for a wide range of bills, including electricity, internet, cable TV, and mobile airtime. Visit our platform to see the full list of supported services.",
    },
    {
      title: "What are virtual cards?",
      content:
        "Virtual cards are digital payment cards you can use for secure online transactions. They function like physical cards but exist only in digital form.",
    },
    {
      title: "How do I create a virtual card?",
      content:
        "To create a virtual card, log into your Nattypay account, navigate to the 'Virtual Cards' section, and follow the on-screen instructions. You can customize your card for different purposes.",
    },
  ];

  const handleAccordionToggle = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="w-full flex justify-center">
      <motion.div
        ref={ref}
        animate={isInView ? "show" : "hidden"}
        initial="hidden"
        className="w-[90%] lg:w-[88%] flex flex-col gap-10 lg:gap-20 items-center h-full py-12 sm:py-16 lg:py-20"
      >
        <motion.div
          variants={textVariant(0.1)}
          className="w-full 2xs:w-[90%] xs:w-[80%] md:w-[70%] xl:w-[60%] flex flex-col items-center text-center gap-3"
        >
          <span className="h-1.5 w-20 rounded-full bg-primary"></span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-200 dark:text-text-400">
            Nattypay FAQs
          </h2>
          <p className="max-w-5xl text-sm sm:text-base text-text-1700 dark:text-text-800">
            See some of the frequently asked questions from our customers about our services
          </p>
        </motion.div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {AccordionsData.map((item, index) => (
            <Accordion
              key={index}
              title={item.title}
              isOpen={activeIndex === index}
              onToggle={() => handleAccordionToggle(index)}
            >
              {item.content}
            </Accordion>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Faqs, "faqs");
