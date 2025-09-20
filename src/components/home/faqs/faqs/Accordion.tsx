"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";

const Accordion = ({
  title,
  children,
  isOpen,
  onToggle,
}: {
  title: string;
  children: string;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div
      onClick={onToggle}
      className={`h-fit ${
        isOpen
          ? "border-2 border-primary shadow-xl"
          : "border border-transparent shadow-lg"
      } bg-bg-600 dark:bg-bg-1100 rounded-lg py-3 xs:py-4 lg:py-6 px-4 lg:px-6 flex flex-col gap-2.5 xs:gap-4 cursor-pointer`}
    >
      <div className="flex items-center justify-between gap-3">
        <h1
          className={`font-semibold text-sm sm:text-base xl:text-lg ${
            isOpen ? "text-primary" : "text-text-200 dark:text-text-400"
          }`}
        >
          {title}
        </h1>
        <div className="bg-primary rounded-md p-1 xs:p-1.5 text-base sm:text-lg text-white">
          {!isOpen ? <FiPlus /> : <FiMinus />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-xs sm:text-sm xl:text-base text-text-200 dark:text-text-400">
              {children}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
