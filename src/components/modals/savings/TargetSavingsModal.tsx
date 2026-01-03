"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import useUserStore from "@/store/user.store";
import CustomButton from "@/components/shared/Button";
import CustomSelect from "@/components/CustomSelect";
import { useCreateSavingsPlan } from "@/api/savings/savings.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import InsufficientBalanceModal from "@/components/modals/finance/InsufficientBalanceModal";
import { isInsufficientBalanceError, extractBalanceInfo } from "@/utils/errorUtils";

type FundingMode = "manual" | "auto";

type Frequency = "Daily" | "Weekly" | "Monthly" | "Yearly";

interface TargetSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TargetSavingsModal: React.FC<TargetSavingsModalProps> = ({ isOpen, onClose }) => {
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
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = React.useState(false);
  const [balanceInfo, setBalanceInfo] = React.useState<{ requiredAmount?: number; currentBalance?: number }>({});

  const onError = (error: any) => {
    // Check if it's an insufficient balance error
    if (isInsufficientBalanceError(error)) {
      const info = extractBalanceInfo(error);
      // If we don't have balance info from error, use the wallet balance
      if (!info.currentBalance && wallets[selectedWalletIndex]) {
        info.currentBalance = wallets[selectedWalletIndex].balance || 0;
      }
      // If we don't have required amount, use the goal amount
      if (!info.requiredAmount && amount) {
        info.requiredAmount = Number(amount);
      }
      setBalanceInfo(info);
      setShowInsufficientBalanceModal(true);
      return;
    }

    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to create savings plan"];

    ErrorToast({
      title: "Creation Failed",
      descriptions,
    });
  };

  const onSuccess = () => {
    SuccessToast({
      title: "Plan Created Successfully!",
      description: "Your target savings plan has been created. Start funding it to reach your goal.",
    });
    setStep(3);
  };

  const { mutate: createPlan, isPending: creating } = useCreateSavingsPlan(onError, onSuccess);

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

    if (!amount || Number(amount) <= 0) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please enter a valid target amount"],
      });
      return;
    }

    if (mode === "manual" && (!startDate || !endDate)) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Start date and end date are required for manual plans"],
      });
      return;
    }

    if (!topUpAmount || Number(topUpAmount) <= 0) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please enter a valid top-up amount"],
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

    // Calculate duration in months
    let durationMonths: number = mode === "auto" ? 6 : 12; // Default to 6 months for auto, 12 for manual
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      durationMonths = Math.max(1, Math.min(60, Math.round(years * 12)));
    }

    // NATTY_AUTO_SAVE must be 6, 12, or 18 months
    if (mode === "auto" && ![6, 12, 18].includes(durationMonths)) {
      // Round to nearest valid duration
      if (durationMonths < 6) durationMonths = 6;
      else if (durationMonths <= 9) durationMonths = 6;
      else if (durationMonths <= 15) durationMonths = 12;
      else durationMonths = 18;
    }

    // Determine plan type based on mode
    // NATTY_AUTO_SAVE for auto mode, FLEX_SAVE for manual mode
    const planType = mode === "auto" ? "NATTY_AUTO_SAVE" : "FLEX_SAVE";

    // NATTY_AUTO_SAVE requires minimum ₦100,000
    if (planType === "NATTY_AUTO_SAVE" && Number(amount) < 100000) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["NATTY_AUTO_SAVE requires a minimum goal amount of ₦100,000"],
      });
      return;
    }

    const payload = {
      type: planType as "FLEX_SAVE" | "NATTY_AUTO_SAVE",
      name: name.trim(),
      description: `Target savings plan for ${name.trim()}`,
      goalAmount: Number(amount),
      currency: selectedWallet.currency || "NGN",
      durationMonths,
    };

    createPlan(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={resetAndClose} />
      </div>

      {/* Shell */}
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-lg max-h-[92vh] rounded-2xl flex flex-col">
        <button onClick={resetAndClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        {step !== 3 && (
          <div className="px-5 pt-1 pb-3">
            <h2 className="text-white text-base font-semibold">Create Target Savings</h2>
          </div>
        )}

        <div className="overflow-y-auto overflow-x-hidden flex-1">
          {/* Step 1 */}
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
                  <input type="radio" name="fundingMode" checked={mode === 'manual'} onChange={()=> setMode("manual")} className="mt-0.5 w-4 h-4 accent-[#D4B139]" />
                </label>
                <label className="flex items-start justify-between px-3 py-2.5 text-white cursor-pointer hover:bg-bg-900 dark:hover:bg-bg-950 transition-colors last:rounded-b-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Auto-save</p>
                    <p className="text-white/50 text-xs mt-0.5">Automate funding for your plan</p>
                  </div>
                  <input type="radio" name="fundingMode" checked={mode === 'auto'} onChange={()=> setMode("auto")} className="mt-0.5 w-4 h-4 accent-[#D4B139]" />
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
                  <label className="text-white/70 text-xs">Start Date { !startDate && <span className="text-red-500">•</span> }</label>
                  <input type="date" className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm outline-none" value={startDate} onChange={(e)=> setStartDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-white/70 text-xs">End Date { !endDate && <span className="text-red-500">•</span> }</label>
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

          {/* Step 2 */}
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

          {/* Step 3 (Success) */}
          {step === 3 && (
            <div className="px-5 pt-8 pb-8 flex flex-col items-center text-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#0E2C25] grid place-items-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 className="text-white text-base font-semibold">Plan Created Successfully</h3>
              <p className="text-white/80 text-sm leading-relaxed max-w-md">You're all set — start funding your target and watch your savings grow</p>
              <CustomButton type="button" className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" onClick={resetAndClose}>
                View Details
              </CustomButton>
            </div>
          )}
        </div>
      </div>

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => setShowInsufficientBalanceModal(false)}
        requiredAmount={balanceInfo.requiredAmount}
        currentBalance={balanceInfo.currentBalance}
      />
    </div>
  );
};

export default TargetSavingsModal;
