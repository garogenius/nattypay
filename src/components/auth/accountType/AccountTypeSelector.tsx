"use client";
import useNavigate from "@/hooks/useNavigate";
import React, { useState } from "react";
import CustomButton from "@/components/shared/Button";

const AccountTypeSelector = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>("");

  const handleTypeChange = (type: "personal" | "business") => {
    setSelectedType(type);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <label className="w-full relative flex items-center px-4 2xs:px-5 py-4 2xs:py-5 bg-bg-600 dark:bg-bg-1100 rounded-lg sm:rounded-xl cursor-pointer hover:opacity-80">
        <input
          type="radio"
          name="accountType"
          value="personal"
          className="hidden"
          checked={selectedType === "personal"}
          onChange={() => {
            handleTypeChange("personal");
          }}
        />
        <div className="flex-1">
          <h3 className="text-base 2xs:text-lg md:text-xl font-medium text-text-200 dark:text-text-1300">
            Personal Account
          </h3>
          <p className="text-text-700 dark:text-text-800 text-xs 2xs:text-sm">
            for individuals
          </p>
        </div>
        <div
          className={`w-5 h-5 sm:w-6 sm:h-6 border-2 ${selectedType === "personal"
            ? "border-primary"
            : "border-border-200 dark:border-border-100"
            } rounded-full flex items-center justify-center`}
        >
          <div
            className={`w-3 h-3 bg-primary rounded-full ${selectedType === "personal" ? "block" : "hidden"
              }`}
          />
        </div>
      </label>

      <label className="w-full relative flex items-center px-4 2xs:px-5 py-4 2xs:py-5  bg-bg-600 dark:bg-bg-1100 rounded-lg sm:rounded-xl cursor-pointer hover:opacity-80">
        <input
          type="radio"
          name="accountType"
          value="business"
          className="hidden"
          checked={selectedType === "business"}
          onChange={() => {
            handleTypeChange("business");
          }}
        />
        <div className="flex-1">
          <h3 className="text-base 2xs:text-lg md:text-xl font-medium text-text-200 dark:text-text-1300">
            Business Account
          </h3>
          <p className="text-text-700 dark:text-text-800 text-xs 2xs:text-sm">
            for corporate entities
          </p>
        </div>
        <div
          className={`w-5 h-5 sm:w-6 sm:h-6 border-2 ${selectedType === "business"
            ? "border-primary"
            : "border-border-200 dark:border-border-100"
            } rounded-full flex items-center justify-center`}
        >
          <div
            className={`w-3 h-3 bg-primary rounded-full ${selectedType === "business" ? "block" : "hidden"
              }`}
          />
        </div>
      </label>

      <div className="pt-2">
        <CustomButton
          type="button"
          disabled={!selectedType}
          className="w-full"
          onClick={() => {
            if (!selectedType) return;
            navigate(`/signup/${selectedType}`);
          }}
        >
          Continue
        </CustomButton>
      </div>
    </div>
  );
};

export default AccountTypeSelector;
