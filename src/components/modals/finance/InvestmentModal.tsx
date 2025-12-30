"use client";

import React, { useState } from "react";
import { CgClose } from "react-icons/cg";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Personal Information
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneOptional, setPhoneOptional] = useState("");
  const [emailOptional, setEmailOptional] = useState("");

  // Step 2: Next of Kin
  const [nokName, setNokName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("Sibling");
  const [nokPhone, setNokPhone] = useState("");
  const [nokPhoneOptional, setNokPhoneOptional] = useState("");

  // Step 3: Financial Information
  const [occupation, setOccupation] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("Employed");
  const [sourceOfIncome, setSourceOfIncome] = useState("Salary");
  const [incomeRange, setIncomeRange] = useState("₦500,000 - ₦1,000,000");

  // Step 4: AML & Compliance
  const [aml, setAml] = useState({
    pep: false,
    financialCrime: false,
    beneficialOwner: false,
    highRisk: false,
    consentMonitoring: false,
    consentKycData: false,
  });

  const totalSteps = 4;
  const progress = ((step - 1) / (totalSteps - 1)) * 100;

  if (!isOpen) return null;

  const next = () => setStep((s) => (s < totalSteps ? ((s + 1) as any) : s));
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as any) : s));

  const headerTitle = (() => {
    if (step === 1) return "Personal Information";
    if (step === 2) return "Next of Kin Details";
    if (step === 3) return "Financial Information";
    return "AML & Compliance";
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl p-5 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <CgClose className="text-xl text-white" />
        </button>

        <div className="mb-4">
          <h2 className="text-white text-base font-semibold">{headerTitle}</h2>
          <div className="mt-2 h-1 w-full bg-white/10 rounded">
            <div
              className="h-1 bg-[#D4B139] rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        {step === 1 && (
          <div className="space-y-3">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            />
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="Date of Birth"
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Residential Address"
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            />
            <input
              value={phoneOptional}
              onChange={(e) => setPhoneOptional(e.target.value)}
              placeholder="Phone Number (Optional)"
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            />
            <input
              type="email"
              value={emailOptional}
              onChange={(e) => setEmailOptional(e.target.value)}
              placeholder="Email (Optional)"
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <input
              value={nokName}
              onChange={(e) => setNokName(e.target.value)}
              placeholder="Full Name"
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            />
            <select
              value={nokRelationship}
              onChange={(e) => setNokRelationship(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            >
              <option value="Sibling">Sibling</option>
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
            </select>
            <input
              value={nokPhone}
              onChange={(e) => setNokPhone(e.target.value)}
              placeholder="Phone Number"
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            />
            <input
              value={nokPhoneOptional}
              onChange={(e) => setNokPhoneOptional(e.target.value)}
              placeholder="Phone Number (Optional)"
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            >
              <option value="">Occupation/Profession</option>
              <option>Accountant</option>
              <option>Engineer</option>
              <option>Teacher</option>
              <option>Trader</option>
            </select>
            <select
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            >
              <option>Employed</option>
              <option>Self-employed</option>
              <option>Unemployed</option>
              <option>Retired</option>
            </select>
            <select
              value={sourceOfIncome}
              onChange={(e) => setSourceOfIncome(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            >
              <option>Salary</option>
              <option>Business</option>
              <option>Freelance</option>
              <option>Pension</option>
            </select>
            <select
              value={incomeRange}
              onChange={(e) => setIncomeRange(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4B139]"
            >
              <option>₦100,000 - ₦500,000</option>
              <option>₦500,000 - ₦1,000,000</option>
              <option>₦1,000,000 - ₦5,000,000</option>
              <option>₦5,000,000 - ₦10,000,000</option>
            </select>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            {[
              { key: "pep", label: "Are you a Politically Exposed Person(PEP)?" },
              { key: "financialCrime", label: "Have you ever been convicted of financial crime?" },
              { key: "beneficialOwner", label: "I confirm I am the beneficial owner of this investment (not acting on behalf of another person or entity)." },
              { key: "highRisk", label: "I agree that NattyPay may request supporting documents (ID, proof of income, tax clearance, statements) as required." },
              { key: "consentMonitoring", label: "I consent to transaction monitoring, notice reporting, and related checks for compliance purposes." },
              { key: "consentKycData", label: "I declare that I have not included money laundering, terrorism financing, fraud, or any other financial crime." },
            ].map((item) => (
              <label key={item.key} className="flex items-start gap-3 text-white">
                <input
                  type="checkbox"
                  checked={(aml as any)[item.key]}
                  onChange={(e) => setAml({ ...aml, [item.key]: e.target.checked } as any)}
                  className="mt-1"
                />
                <span className="text-sm text-white/90">{item.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Footer buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 1}
            className={`px-5 py-2 rounded-lg border text-sm font-medium ${
              step === 1
                ? "border-white/10 text-white/40 cursor-not-allowed"
                : "border-white/10 text-white hover:bg-white/5"
            }`}
          >
            Back
          </button>
          <button
            onClick={step === totalSteps ? onClose : next}
            className="px-5 py-2 rounded-lg bg-[#D4B139] hover:bg-[#c7a42f] text-black text-sm font-medium"
          >
            {step === totalSteps ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentModal;
