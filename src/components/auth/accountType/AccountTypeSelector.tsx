"use client";
import useNavigate from "@/hooks/useNavigate";
import React, { useState } from "react";
import CustomButton from "@/components/shared/Button";
import useRegistrationStore from "@/store/registration.store";

const AccountTypeSelector = () => {
  const navigate = useNavigate();
  const { setSelectedAccountType } = useRegistrationStore();
  const [selectedType, setSelectedType] = useState<string>("");

  const handleTypeChange = (type: "personal" | "business") => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (!selectedType) return;
    
    // Store account type
    setSelectedAccountType(selectedType.toUpperCase() as "PERSONAL" | "BUSINESS");
    
    // Navigate to appropriate signup form
    navigate(`/signup/${selectedType}`);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <label className={`w-full relative flex items-center px-4 py-4 bg-white border-2 rounded-lg cursor-pointer transition-all hover:border-[#D4B139]/50 ${
        selectedType === "personal"
          ? "border-[#D4B139] bg-[#D4B139]/5"
          : "border-gray-200"
      }`}>
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
          <h3 className="text-lg font-medium text-gray-900">
            Personal Account
          </h3>
          <p className="text-sm text-gray-600">
            for individuals
          </p>
        </div>
        <div
          className={`w-5 h-5 border-2 ${
            selectedType === "personal"
              ? "border-[#D4B139]"
              : "border-gray-300"
          } rounded-full flex items-center justify-center`}
        >
          <div
            className={`w-3 h-3 bg-[#D4B139] rounded-full ${
              selectedType === "personal" ? "block" : "hidden"
            }`}
          />
        </div>
      </label>

      <label className={`w-full relative flex items-center px-4 py-4 bg-white border-2 rounded-lg cursor-pointer transition-all hover:border-[#D4B139]/50 ${
        selectedType === "business"
          ? "border-[#D4B139] bg-[#D4B139]/5"
          : "border-gray-200"
      }`}>
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
          <h3 className="text-lg font-medium text-gray-900">
            Business Account
          </h3>
          <p className="text-sm text-gray-600">
            for corporate entities
          </p>
        </div>
        <div
          className={`w-5 h-5 border-2 ${
            selectedType === "business"
              ? "border-[#D4B139]"
              : "border-gray-300"
          } rounded-full flex items-center justify-center`}
        >
          <div
            className={`w-3 h-3 bg-[#D4B139] rounded-full ${
              selectedType === "business" ? "block" : "hidden"
            }`}
          />
        </div>
      </label>

      <div className="pt-2">
        <CustomButton
          type="button"
          disabled={!selectedType}
          onClick={handleContinue}
          className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3.5 rounded-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </CustomButton>
      </div>
    </div>
  );
};

export default AccountTypeSelector;
