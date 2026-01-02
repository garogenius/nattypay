"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import useUserStore from "@/store/user.store";
import CustomButton from "@/components/shared/Button";
import CustomSelect from "@/components/CustomSelect";
import { useCreateEasyLifePlan } from "@/api/easylife-savings/easylife-savings.queries";
import type { EasyLifeContributionFrequency } from "@/api/easylife-savings/easylife-savings.types";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";

type FundingMode = "manual" | "auto";

type Frequency = "Daily" | "Weekly" | "Monthly" | "Yearly";

interface EasyLifeSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EasyLifeSavingsModal: React.FC<EasyLifeSavingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();
  const wallets = user?.wallet || [];

  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [mode, setMode] = React.useState<FundingMode>("manual");
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [frequency, setFrequency] = React.useState<Frequency>("Monthly");
  const [topUpAmount, setTopUpAmount] = React.useState("");
  const [selectedWalletIndex, setSelectedWalletIndex] = React.useState(0);
  const [earlyWithdrawalEnabled, setEarlyWithdrawalEnabled] = React.useState(false);

  const onError = (error: unknown) => {
    const errorMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data
      ?.message as unknown;
    const descriptions = Array.isArray(errorMessage)
      ? (errorMessage as string[])
      : [typeof errorMessage === "string" ? errorMessage : "Failed to create savings plan"];

    ErrorToast({
      title: "Creation Failed",
      descriptions,
    });
  };

  const onSuccess = () => {
    SuccessToast({
      title: "Plan Created Successfully!",
      description: "Your easy-life savings plan has been created. Start funding it to grow your savings.",
    });
    setStep(3);
  };

  const { mutate: createPlan, isPending: creating } = useCreateEasyLifePlan(onError, onSuccess);

  const resetAndClose = () => {
    setStep(1);
    setName("");
    setAmount("");
    setStartDate("");
    setEndDate("");
    setTopUpAmount("");
    setSelectedWalletIndex(0);
    setMode("manual");
    setFrequency("Monthly");
    setEarlyWithdrawalEnabled(false);
    onClose();
  };

  const handleCreate = () => {
    // Validation
    if (!name.trim()) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Plan name is required"],
      });
      return;
    }

    const goalAmount = Number(amount);
    if (!goalAmount || goalAmount < 50000) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Minimum goal amount for EasyLife is ₦50,000"],
      });
      return;
    }

    const selectedWallet = wallets[selectedWalletIndex];
    if (!selectedWallet) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please select a wallet"],
      });
      return;
    }

    if (!startDate || !endDate) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Start date and end date are required"],
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please select valid start and end dates"],
      });
      return;
    }

    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (durationDays < 20) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["EasyLife duration must be at least 20 days"],
      });
      return;
    }

    const contributionFrequency: EasyLifeContributionFrequency =
      frequency === "Daily"
        ? "DAILY"
        : frequency === "Weekly"
        ? "WEEKLY"
        : "MONTHLY";

    const payload = {
      name: name.trim(),
      description: `EasyLife savings plan for ${name.trim()}`,
      goalAmount,
      currency: selectedWallet.currency || "NGN",
      durationDays,
      contributionFrequency,
      autoDebitEnabled: mode === "auto",
      earlyWithdrawalEnabled,
    };

    createPlan(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={resetAndClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-lg max-h-[92vh] rounded-2xl flex flex-col">
        <button onClick={resetAndClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        {step !== 3 && (
          <div className="px-5 pt-1 pb-3">
            <h2 className="text-white text-base font-semibold">Create Easy-life Savings</h2>
          </div>
        )}

        <div className="overflow-y-auto overflow-x-hidden flex-1">
          {step === 1 && (
            <div className="px-5 sm:px-6 pb-5 flex flex-col gap-4">
              <div>
                <p className="text-white/70 text-xs mb-2">How do you want to fund your plan</p>
                <div className="rounded-lg bg-bg-800 dark:bg-bg-1000 divide-y divide-white/10">
                  <label className="flex items-start justify-between px-3 py-2.5 text-white cursor-pointer hover:bg-bg-900 dark:hover:bg-bg-950 transition-colors first:rounded-t-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">Manual Top-up</p>
                      <p className="text-white/50 text-xs mt-0.5">Add money anytime you want</p>
                    </div>
                    <input type="radio" name="fundingModeEasy" checked={mode === 'manual'} onChange={()=> setMode("manual")} className="mt-0.5 w-4 h-4 accent-[#D4B139]" />
                  </label>
                  <label className="flex items-start justify-between px-3 py-2.5 text-white cursor-pointer hover:bg-bg-900 dark:hover:bg-bg-950 transition-colors last:rounded-b-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">Auto-save</p>
                      <p className="text-white/50 text-xs mt-0.5">Automate funding for your plan</p>
                    </div>
                    <input type="radio" name="fundingModeEasy" checked={mode === 'auto'} onChange={()=> setMode("auto")} className="mt-0.5 w-4 h-4 accent-[#D4B139]" />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-xs">Name</label>
                <input className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none" placeholder="Enter plan name" value={name} onChange={(e)=> setName(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-xs">Amount</label>
                <input className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none" placeholder="NGN" value={amount} onChange={(e)=> setAmount(e.target.value)} />
              </div>

              {mode === 'manual' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-white/70 text-xs">Start Date</label>
                    <input type="date" className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm outline-none" value={startDate} onChange={(e)=> setStartDate(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-white/70 text-xs">End Date</label>
                    <input type="date" className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm outline-none" value={endDate} onChange={(e)=> setEndDate(e.target.value)} />
                  </div>
                </>
              )}

              {mode === 'manual' && (
                <div className="flex flex-col gap-1">
                  <label className="text-white/70 text-xs">Frequency</label>
                  <CustomSelect
                    options={["Daily","Weekly","Monthly","Yearly"].map((f)=> ({ value: f, label: f }))}
                    value={{ value: frequency, label: frequency }}
                    onChange={(opt)=> setFrequency(opt.value as Frequency)}
                    placeholder="Select frequency"
                    selectClassName="bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm outline-none"
                    placeholderClassName="text-white/50 text-sm"
                    isSearchable={false}
                    maxHeight="200"
                  />
                </div>
              )}

              <div className="flex items-start justify-between gap-3 bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Allow Early Withdrawal</p>
                  <p className="text-white/60 text-xs mt-0.5">If enabled, early withdrawal attracts a 1.5% penalty.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEarlyWithdrawalEnabled((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    earlyWithdrawalEnabled ? "bg-[#D4B139]" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 ${
                      earlyWithdrawalEnabled ? "right-0.5" : "left-0.5"
                    } w-5 h-5 rounded-full bg-white transition-all`}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-xs">Top-up Amount</label>
                <input className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none" placeholder="NGN" value={topUpAmount} onChange={(e)=> setTopUpAmount(e.target.value)} />
              </div>

              <div className="flex items-center justify-between gap-3 mt-3">
                <CustomButton type="button" className="flex-1 bg-transparent border border-[#D4B139] text-white rounded-lg px-5 py-2.5 text-sm" onClick={resetAndClose}>Back</CustomButton>
                <CustomButton type="button" className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg px-5 py-2.5 text-sm font-medium" onClick={()=> setStep(2)}>Next</CustomButton>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="px-5 pb-5 flex flex-col gap-3">
              {mode === 'auto' && (
                <div className="flex flex-col gap-1">
                  <label className="text-white/70 text-xs">Frequency</label>
                  <CustomSelect
                    options={["Daily","Weekly","Monthly","Yearly"].map((f)=> ({ value: f, label: f }))}
                    value={{ value: frequency, label: frequency }}
                    onChange={(opt)=> setFrequency(opt.value as Frequency)}
                    placeholder="Select frequency"
                    selectClassName="bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm outline-none"
                    placeholderClassName="text-white/50 text-sm"
                    isSearchable={false}
                    maxHeight="200"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-xs">Select Funding Method</label>
                <div className="rounded-lg border border-white/10 bg-transparent divide-y divide-white/10">
                  <div className="flex items-center justify-between py-3 px-3">
                    <span className="text-white/80 text-sm">Available Balance (₦{Number(wallets?.[0]?.balance || 0).toLocaleString()})</span>
                    <span className="w-4 h-4 rounded-full border-2 border-[#D4B139] inline-block" />
                  </div>
                  {wallets.map((w, i) => (
                    <label key={i} className="flex items-center justify-between py-3 px-3 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white grid place-items-center">
                          <span className="text-black font-bold">{w.currency?.slice(0,1) || 'N'}</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-white text-sm font-medium">{w.bankName || w.currency}</p>
                          <p className="text-white/60 text-xs">{w.accountNumber || '0000000000'} <span className="ml-2 inline-flex text-[10px] px-1.5 py-0.5 rounded bg-white/10">Account</span></p>
                        </div>
                      </div>
                      <input type="radio" checked={selectedWalletIndex===i} onChange={()=> setSelectedWalletIndex(i)} className="w-4 h-4 accent-[#D4B139]" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-xs">Top-up Amount</label>
                <input className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none" placeholder="NGN" value={topUpAmount} onChange={(e)=> setTopUpAmount(e.target.value)} />
              </div>

              <div className="flex items-center justify-between gap-3 mt-3">
                <CustomButton type="button" className="flex-1 bg-transparent border border-[#D4B139] text-white rounded-lg px-5 py-2.5 text-sm" onClick={()=> setStep(1)}>Back</CustomButton>
                <CustomButton type="button" disabled={creating} isLoading={creating} className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg px-5 py-2.5 text-sm font-medium" onClick={handleCreate}>Create Plan</CustomButton>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="px-5 pt-8 pb-8 flex flex-col items-center text-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#0E2C25] grid place-items-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 className="text-white text-base font-semibold">Plan Created Successfully</h3>
              <p className="text-white/80 text-sm leading-relaxed max-w-md">You&apos;re all set — start funding your target and watch your savings grow</p>
              <CustomButton type="button" className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" onClick={resetAndClose}>
                View Details
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EasyLifeSavingsModal;
