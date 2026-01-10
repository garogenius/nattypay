"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import { CgClose } from "react-icons/cg";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import CustomButton from "@/components/shared/Button";
import { useGetDataPlan, useGetDataVariation, usePayForData } from "@/api/data/data.queries";
import { NetworkProvider } from "@/components/user/bill/bill.data";
import { handleNumericKeyDown, handleNumericPaste } from "@/utils/utilityFunctions";
import ErrorToast from "@/components/toast/ErrorToast";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import { useTransactionProcessingStore } from "@/store/transactionProcessing.store";

interface MobileDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileDataModal: React.FC<MobileDataModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "confirm" | "result">("form");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [operatorId, setOperatorId] = useState<number | undefined>();
  const [selectedNetworkPlan, setSelectedNetworkPlan] = useState<number>();
  const [checkoutMessage, setCheckoutMessage] = useState<string>("");
  const [formData, setFormData] = useState<any>(null);
  const [walletPin, setWalletPin] = useState("");
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
  const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const durationDropdownRef = useRef<HTMLDivElement>(null);
  const planDropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setNetworkDropdownOpen(false));
  useOnClickOutside(durationDropdownRef, () => setDurationDropdownOpen(false));
  useOnClickOutside(planDropdownRef, () => setPlanDropdownOpen(false));

  // Network options with actual operator IDs (these should come from API in production)
  const networkOptions = [
    { name: "MTN", logo: NetworkProvider[0].logo, operatorId: 341 }, 
    { name: "GLO", logo: NetworkProvider[1].logo, operatorId: 342 }, 
    { name: "AIRTEL", logo: NetworkProvider[2].logo, operatorId: 343 }, 
    { name: "ETISALAT", logo: NetworkProvider[3].logo, operatorId: 344 }, 
  ];

  // Duration options
  const durationOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const schema = useMemo(
    () =>
      yup.object().shape({
        phone: yup
          .string()
          .required("Phone Number is required")
          .min(11, "Phone Number must be at least 11 digits")
          .max(11, "Phone Number must be exactly 11 digits"),
        network: yup.string().required("Network is required"),
      }),
    []
  );

  const form = useForm({
    defaultValues: { phone: "", network: "" },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState, watch, setValue, clearErrors } = form;
  const { errors, isValid } = formState;
  const watchedPhone = watch("phone");
  const watchedNetwork = watch("network");

  // Clean phone number for API call (remove any non-digits)
  const cleanedPhone = watchedPhone?.replace(/\D/g, "") || "";

  // Re-enable auto-detection for data plan fetching
  // The API expects +234 format, formatPhoneForAPI will handle it
  const {
    networkPlans,
    network,
    isLoading: isDataPlanPending,
    isError: isDataPlanError,
  } = useGetDataPlan({
    phone: cleanedPhone,
    currency: "NGN",
  });

  const isDataPlanLoading = isDataPlanPending && !isDataPlanError;

  // Only fetch data variations when a network is selected
  const {
    variations,
    isPending: dataVariationsPending,
    isError: dataVariationsError,
  } = useGetDataVariation({
    operatorId: selectedNetworkPlan,
  });

  const dataVariationsLoading = dataVariationsPending && !dataVariationsError;

  const { showProcessing, showSuccess, showError } = useTransactionProcessingStore();

  const onPayDataSuccess = (data: any) => {
    setTransactionResult({ success: true, data });
    setStep("result");
    showSuccess({ title: "Payment Successful", message: "Mobile data purchase completed." });
  };

  const onPayDataError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];
    setTransactionResult({ success: false, error: errorMessage });
    setStep("result");
    showError({
      title: "Payment Failed",
      message: descriptions?.[0] || "Mobile data purchase failed.",
    });
  };

  const {
    mutate: PayForData,
    isPending: dataPending,
    isError: dataError,
  } = usePayForData(onPayDataError, onPayDataSuccess);

  const dataLoading = dataPending && !dataError;

  // Auto-detect network when phone number is entered
  useEffect(() => {
    if ((cleanedPhone.length === 10 || cleanedPhone.length === 11) && network && networkPlans && networkPlans.length > 0) {
      const provider = NetworkProvider.find(
        (item) => item.name === network.toLocaleUpperCase()
      );
      
      if (provider) {
        setSelectedProvider({
          name: network.toLocaleUpperCase(),
          logo: provider.logo,
        });
        setValue("network", network);
        clearErrors("network");
        // Use the first network plan's operatorId
        setSelectedNetworkPlan(networkPlans[0]?.operatorId);
      }
    } else if (cleanedPhone.length !== 10 && cleanedPhone.length !== 11) {
      // Reset when phone is not 10 or 11 digits
      setSelectedProvider(null);
      setSelectedNetworkPlan(undefined);
      setSelectedPlan("");
      setAmount("");
    }
  }, [cleanedPhone, network, networkPlans, setValue, clearErrors]);

  const handleClose = () => {
    setStep("form");
    setSelectedProvider(null);
    setSelectedDuration("");
    setSelectedPlan("");
    setAmount("");
    setOperatorId(undefined);
    setSelectedNetworkPlan(undefined);
    setCheckoutMessage("");
    setFormData(null);
    setWalletPin("");
    setTransactionResult(null);
    setNetworkDropdownOpen(false);
    setDurationDropdownOpen(false);
    setPlanDropdownOpen(false);
    form.reset();
    onClose();
  };

  const onSubmit = (data: any) => {
    if (!selectedProvider || !amount || !selectedPlan || !selectedNetworkPlan) return;
    // Use the selectedNetworkPlan as operatorId
    setOperatorId(selectedNetworkPlan);
    setFormData({ ...data, amount, plan: selectedPlan, duration: selectedDuration });
    setStep("confirm");
  };

  const handleConfirmPayment = () => {
    if (!formData || !operatorId || walletPin.length !== 4) return;
    
    // Format phone number to +234 format: remove leading 0 if present and add +234 prefix
    // e.g., 07043742886 -> +2347043742886
    const cleaned = formData.phone.replace(/\D/g, "");
    const phoneWithoutLeadingZero = cleaned.startsWith("0") && cleaned.length === 11
      ? cleaned.slice(1)
      : cleaned;
    const phoneForPayment = `+234${phoneWithoutLeadingZero}`;
    
    showProcessing({ title: "Processing Payment", message: "Please wait..." });
    PayForData({
      phone: phoneForPayment,
      currency: "NGN",
      walletPin: walletPin,
      operatorId: operatorId,
      amount: Number(amount),
      addBeneficiary: false,
    });
  };

  const handlePlanSelect = (planAmount: string, description: string) => {
    setAmount(planAmount);
    setOperatorId(selectedNetworkPlan);
    setCheckoutMessage(description);
    setSelectedPlan(description);
    setPlanDropdownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      aria-hidden="true"
      className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]"
    >
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose}></div>
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            <h2 className="text-white text-lg font-semibold">
              {step === "form" ? "Mobile Data" : step === "confirm" ? "Mobile Data" : "Transaction History"}
            </h2>
            <p className="text-white/60 text-sm">
              {step === "form" ? "Enter payment details to continue" : 
               step === "confirm" ? "Confirm Transactions" : 
               "View complete information about this transaction"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        {/* Content based on step */}
        <div className="px-4 pb-4">
          {step === "form" && (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Mobile Number */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm">Mobile Number</label>
              <input
                className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none focus:ring-1 focus:ring-[#D4B139] focus:border-[#D4B139]"
                placeholder="Enter mobile number"
                type="text"
                maxLength={11}
                {...register("phone", {
                  onChange: (e) => {
                    // Clean input to only allow digits
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 11);
                    e.target.value = cleaned;
                  }
                })}
                onKeyDown={handleNumericKeyDown}
                onPaste={handleNumericPaste}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Network validation error */}
            <div className="flex flex-col gap-2">
              {errors.network && (
                <p className="text-red-500 text-sm">{errors.network.message}</p>
              )}
            </div>

            {/* Select Network */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm">Select Network</label>
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {selectedProvider ? (
                      <>
                        <Image
                          src={selectedProvider.logo}
                          alt={selectedProvider.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{selectedProvider.name}</span>
                      </>
                    ) : (
                      <span className="text-white/50 text-sm">Select network</span>
                    )}
                  </div>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${networkDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Network Dropdown Options */}
                {networkDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden">
                    {networkOptions.map((network) => (
                      <div
                        key={network.name}
                        onClick={() => {
                          setSelectedProvider({
                            name: network.name,
                            logo: network.logo,
                          });
                          // Set form value for validation
                          setValue("network", network.name);
                          clearErrors("network");
                          // Use the operatorId from the network option
                          setSelectedNetworkPlan(network.operatorId);
                          setSelectedPlan(""); // Reset plan when network changes
                          setAmount(""); // Reset amount when network changes
                          setNetworkDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-white text-sm hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <Image
                          src={network.logo}
                          alt={network.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{network.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm">Duration</label>
              <div className="relative" ref={durationDropdownRef}>
                <div
                  onClick={() => setDurationDropdownOpen(!durationDropdownOpen)}
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
                >
                  <span className={selectedDuration ? "text-white" : "text-white/50"}>
                    {selectedDuration || "Select duration"}
                  </span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${durationDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Duration Dropdown Options */}
                {durationDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden">
                    {durationOptions.map((duration) => (
                      <div
                        key={duration.value}
                        onClick={() => {
                          setSelectedDuration(duration.label);
                          setDurationDropdownOpen(false);
                        }}
                        className="px-4 py-3 text-white text-sm hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        {duration.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Plan */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm">Plan</label>
              <div className="relative" ref={planDropdownRef}>
                <div
                  onClick={() => setPlanDropdownOpen(!planDropdownOpen)}
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
                >
                  <span className={selectedPlan ? "text-white" : "text-white/50"}>
                    {selectedPlan || "Select plan"}
                  </span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${planDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Plan Dropdown Options */}
                {planDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {!selectedNetworkPlan ? (
                      <div className="px-4 py-3 text-white/50 text-sm">Select network first</div>
                    ) : dataVariationsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <SpinnerLoader width={20} height={20} color="#D4B139" />
                        <span className="text-white/70 text-sm ml-2">Loading plans...</span>
                      </div>
                    ) : dataVariationsError ? (
                      <div className="px-4 py-3 text-red-400 text-sm">Failed to load plans. Please try again.</div>
                    ) : variations && Object.keys(variations).length > 0 ? (
                      Object.entries(variations).map(([amount, description], index) => (
                        <div
                          key={index}
                          onClick={() => handlePlanSelect(amount, String(description))}
                          className="flex items-center justify-between px-4 py-3 text-white text-sm hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <span>{String(description)}</span>
                          <span className="text-[#D4B139] font-medium">₦{Number(amount).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-white/50 text-sm">No plans available for this network</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Amount Display */}
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2 text-green-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-lg">₦{Number(amount).toLocaleString()}.00</span>
              </div>
            </div>

            {/* Next Button */}
            <CustomButton
              type="submit"
              disabled={!isValid || !selectedProvider || !selectedPlan || !amount || dataLoading}
              isLoading={dataLoading}
              className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg transition-colors mt-2"
            >
              Next
            </CustomButton>
            </form>
          )}

          {step === "confirm" && formData && (
            <div className="flex flex-col gap-6">
              {/* Transaction Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Network</span>
                  <span className="text-white text-sm font-medium">{selectedProvider?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Phone Number</span>
                  <span className="text-white text-sm font-medium">+{formData.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Duration</span>
                  <span className="text-white text-sm font-medium">{formData.duration || "Monthly"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Plan</span>
                  <span className="text-white text-sm font-medium">{formData.plan || selectedPlan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Amount</span>
                  <span className="text-white text-sm font-medium">₦{Number(amount).toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Amount Debited</span>
                  <span className="text-white text-sm font-medium">₦{Number(amount).toLocaleString()}.00</span>
                </div>
              </div>

              {/* PIN Input */}
              <div className="flex flex-col gap-3">
                <label className="text-white/60 text-sm">Enter Transaction PIN</label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    value={walletPin}
                    onChange={(e) => setWalletPin(e.target.value)}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/\D/g, ""); // Remove non-digit characters
                    }}
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-4 text-white placeholder:text-white/40 text-sm outline-none focus:ring-1 focus:ring-[#D4B139] focus:border-[#D4B139] pr-14"
                    placeholder=""
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 rounded-full p-2.5">
                    <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.27.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.29-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.69-2.5 1.65-3.4 2.94-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-2.04-1.34-3.30 0-1.28.47-2.44 1.34-3.30.19-.19.50-.19.69 0 .19.19.19.50 0 .69-.68.68-1.04 1.57-1.04 2.61 0 1.04.36 1.93 1.04 2.61.19.19.19.50 0 .69-.09.1-.22.15-.34.15zm7.5 0c-.13 0-.26-.05-.35-.15-.19-.19-.19-.50 0-.69.68-.68 1.04-1.57 1.04-2.61 0-1.04-.36-1.93-1.04-2.61-.19-.19-.19-.50 0-.69.19-.19.50-.19.69 0 .87.86 1.34 2.02 1.34 3.30 0 1.26-.47 2.43-1.34 3.30-.09.1-.22.15-.34.15zM12 13.44c-.78 0-1.42-.64-1.42-1.42s.64-1.42 1.42-1.42 1.42.64 1.42 1.42-.64 1.42-1.42 1.42zm0-1.84c-.23 0-.42.19-.42.42s.19.42.42.42.42-.19.42-.42-.19-.42-.42-.42z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-2">
                <CustomButton
                  onClick={() => setStep("form")}
                  className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-4 rounded-lg transition-colors font-medium"
                >
                  Back
                </CustomButton>
                <CustomButton
                  onClick={handleConfirmPayment}
                  disabled={walletPin.length !== 4 || dataLoading}
                  isLoading={dataLoading}
                  className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-4 rounded-lg transition-colors"
                >
                  Pay
                </CustomButton>
              </div>
            </div>
          )}

          {step === "result" && transactionResult && (
            <div className="flex flex-col items-center gap-4">
              {/* Success/Error Icon and Amount */}
              <div className="flex flex-col items-center gap-2">
                {transactionResult.success ? (
                  <>
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-green-500 text-sm font-medium">Successful</span>
                    <span className="text-white text-2xl font-bold">₦{Number(amount || 0).toLocaleString()}.00</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-red-500 text-sm font-medium">Failed</span>
                    <span className="text-white text-2xl font-bold">₦{Number(amount || 0).toLocaleString()}.00</span>
                  </>
                )}
              </div>

              {/* Transaction Details */}
              {transactionResult.success && (
                <div className="w-full space-y-3 mt-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Transaction Reference</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-mono">
                          {transactionResult?.data?.data?.transactionRef || transactionResult?.data?.data?.transaction?.transactionRef || transactionResult?.data?.data?.transactionId || "N/A"}
                        </span>
                        {(transactionResult?.data?.data?.transactionRef || transactionResult?.data?.data?.transaction?.transactionRef || transactionResult?.data?.data?.transactionId) && (
                          <button
                            onClick={() => {
                              const ref = transactionResult?.data?.data?.transactionRef || transactionResult?.data?.data?.transaction?.transactionRef || transactionResult?.data?.data?.transactionId;
                              if (ref) navigator.clipboard.writeText(String(ref));
                            }}
                            className="p-1 rounded hover:bg-white/10"
                            title="Copy"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white/70">
                              <path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V7q0-.825.588-1.412T7 5h8q.825 0 1.413.588T17 7v12q0 .825-.587 1.413T15 21zm0-2h8V7H7zm10-2V5H9V3h8q.825 0 1.413.588T19 5v12z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    {transactionResult?.data?.data?.pin && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">PIN</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-mono">{transactionResult.data.data.pin}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(transactionResult.data.data.pin)}
                            className="p-1 rounded hover:bg-white/10"
                            title="Copy"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white/70">
                              <path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V7q0-.825.588-1.412T7 5h8q.825 0 1.413.588T17 7v12q0 .825-.587 1.413T15 21zm0-2h8V7H7zm10-2V5H9V3h8q.825 0 1.413.588T19 5v12z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    {transactionResult?.data?.data?.transactionId && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">Transaction ID</span>
                        <span className="text-white text-sm font-mono">{transactionResult.data.data.transactionId}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/70 text-sm">Transaction ID</span>
                    <span className="text-white text-sm font-medium">
                      {transactionResult?.data?.data?.transactionRef || transactionResult?.data?.data?.transaction?.transactionRef || transactionResult?.data?.data?.transactionId || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/70 text-sm">Date & Time</span>
                    <span className="text-white text-sm font-medium">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/70 text-sm">Payment Method</span>
                    <span className="text-white text-sm font-medium">Available Balance</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/70 text-sm">Transaction Type</span>
                    <span className="text-white text-sm font-medium">Data</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/70 text-sm">To</span>
                    <span className="text-white text-sm font-medium">{selectedProvider?.name} Nigeria</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/70 text-sm">Number</span>
                    <span className="text-white text-sm font-medium">+{formData?.phone}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/70 text-sm">Plan</span>
                    <span className="text-white text-sm font-medium">{selectedPlan}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 w-full">
                <CustomButton
                  onClick={handleClose}
                  className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg transition-colors"
                >
                  Contact Support
                </CustomButton>
                <CustomButton
                  onClick={handleClose}
                  className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg transition-colors"
                >
                  Download Receipt
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileDataModal;
