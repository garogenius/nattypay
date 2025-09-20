"use client";

import SectionWrapper from "@/utils/hoc/SectionWrapper";
import { motion } from "framer-motion";
import { staggerContainer, textVariant, fadeIn } from "@/utils/motion";
import { FiCheckCircle } from "react-icons/fi";

const sampleCode = `// Nattypay API - Create transfer
await nattypay.transfers.create({
  account_id: "acc_9x41...",
  amount: 100000, // in kobo
  currency: "NGN",
  recipient: {
    bank_code: "058",
    account_number: "0123456789",
    name: "Jane Doe",
  },
  reference: "INV-2048-NTY",
});

// Webhooks notify you on every lifecycle event`;

const ApiSection = () => {
  return (
    <section className="w-full flex justify-center">
      <motion.div
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="w-[90%] lg:w-[88%] grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start py-12 sm:py-16 lg:py-20"
      >
        {/* Left - Content */}
        <motion.div variants={textVariant(0.1)} className="flex flex-col gap-4">
          <div className="flex flex-col items-start text-left gap-3">
            <span className="h-1.5 w-20 rounded-full bg-primary" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-200 dark:text-text-400">
              Build fast with our clean, documented APIs
            </h2>
            <p className="max-w-xl text-sm sm:text-base text-text-1700 dark:text-text-800">
              Save engineering time with unified payment rails and developer-first docs. Ship features that
              matter while we handle reliability, security, and webhooks.
            </p>
          </div>

          <ul className="mt-2 space-y-3">
            {[
              "Collect one-time and recurring payments",
              "Retrieve transactions and customer data",
              "Instant webhooks with retries and signatures",
              "PCI & NDPR aligned security",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-text-200 dark:text-text-400">
                <FiCheckCircle className="mt-0.5 text-secondary" />
                <span className="text-sm sm:text-base">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-3">
            <a
              href="#docs"
              className="inline-flex items-center gap-2 rounded-3xl bg-secondary text-black px-5 py-2.5 text-sm font-medium no-underline"
            >
              Read our docs
            </a>
            <a
              href="#sdks"
              className="inline-flex items-center gap-2 rounded-3xl border border-border-400 text-text-200 dark:text-text-400 px-5 py-2.5 text-sm font-medium no-underline"
            >
              Explore SDKs
            </a>
          </div>
        </motion.div>

        {/* Right - Code panel */}
        <motion.div
          variants={fadeIn("up", "spring", 0.2, 0.75)}
          className="relative rounded-2xl bg-bg-600/80 dark:bg-bg-1100/60 border border-border-400/60 shadow-xl overflow-hidden"
        >
          {/* Header tabs */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-400/40">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <p className="text-xs text-text-1700 dark:text-text-800">TypeScript • transfers.ts</p>
          </div>

          <pre className="p-4 sm:p-6 text-xs sm:text-sm leading-relaxed text-text-200 dark:text-text-400 whitespace-pre-wrap">
{sampleCode}
          </pre>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SectionWrapper(ApiSection, "api");
