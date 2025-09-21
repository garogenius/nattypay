"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/user.store";
import { motion, useInView } from "framer-motion";
import CustomButton from "@/components/shared/Button";

type AccountOption = {
  type: "personal" | "business";
  title: string;
  description: string;
};

const accountOptions: AccountOption[] = [
  {
    type: "personal",
    title: "Personal Account",
    description: "for individuals"
  },
  {
    type: "business",
    title: "Business Account",
    description: "for corporate entities"
  }
];

const AccountTypeSelector = () => {
  const [selectedType, setSelectedType] = useState<"" | "personal" | "business">("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.25 });

  const handleAccountTypeSelect = (type: "personal" | "business") => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      try {
        setSubmitting(true);
        // Store the account type in localStorage for the signup process
        localStorage.setItem('signupAccountType', selectedType);
        // Navigate to the correct signup page based on the selected type
        if (selectedType === 'personal') {
          router.push('/signup/personal');
        } else if (selectedType === 'business') {
          router.push('/signup/business');
        }
      } finally {
        // In case navigation is interrupted, re-enable the button after a short delay.
        // On successful navigation this component unmounts and this has no effect.
        setTimeout(() => setSubmitting(false), 1500);
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      animate={isInView ? "show" : "hidden"}
      initial="hidden"
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex flex-col gap-3 w-full">
        {accountOptions.map((option) => (
          <div
            key={option.type}
            onClick={() => handleAccountTypeSelect(option.type)}
            className={`flex flex-col items-start gap-1 p-4 rounded-lg border-2 transition-all duration-200 w-full text-left cursor-pointer ${
              selectedType === option.type
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            <div className="flex items-center w-full">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-200 dark:text-text-400">
                  {option.title}
                </h3>
                <p className="text-sm text-text-200/70 dark:text-text-400/70">
                  {option.description}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedType === option.type
                  ? 'border-primary bg-primary'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {selectedType === option.type && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedType && (
        <div className="mt-2">
          <CustomButton
            onClick={handleContinue}
            disabled={submitting}
            aria-busy={submitting}
            className={
              "w-full py-3 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            }
          >
            {submitting ? "Continuing..." : "Continue"}
          </CustomButton>
        </div>
      )}
    </motion.div>
  );
};

export default AccountTypeSelector;
