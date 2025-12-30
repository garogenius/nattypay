"use client";

import React, { useState, useRef, useMemo } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import Image from "next/image";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import CustomButton from "@/components/shared/Button";
import { NetworkProvider } from "@/components/user/bill/bill.data";
import { handleNumericKeyDown, handleNumericPaste } from "@/utils/utilityFunctions";
import useOnClickOutside from "@/hooks/useOnClickOutside";

interface AddSchedulePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (payment: any) => void;
  onSave?: (payment: any) => void; // used for edit
  initialPayment?: {
    id: string;
    type: "airtime" | "data";
    network: string;
    amount: number;
    frequency: string;
    logo: any;
    phone?: string;
  } | null;
}

const AddSchedulePaymentModal: React.FC<AddSchedulePaymentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onSave,
  initialPayment = null,
}) => {
  const [selectedType, setSelectedType] = useState<"airtime" | "data">("airtime");
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<any>(null);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);

  const networkDropdownRef = useRef<HTMLDivElement>(null);
  const frequencyDropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(networkDropdownRef, () => setNetworkDropdownOpen(false));
  useOnClickOutside(frequencyDropdownRef, () => setFrequencyDropdownOpen(false));

  const networkOptions = NetworkProvider.map(provider => ({
    name: provider.name,
    logo: provider.logo,
  }));

  const frequencyOptions = [
    { value: "daily", label: "Every Day" },
    { value: "weekly", label: "Every Week" },
    { value: "monthly", label: "Every Month" },
    { value: "sunday", label: "Every Sunday" },
    { value: "monday", label: "Every Monday" },
  ];

  const schema = useMemo(
    () =>
      yup.object().shape({
        phone: yup
          .string()
          .required("Phone Number is required")
          .min(11, "Phone Number must be at least 11 digits")
          .max(11, "Phone Number must be exactly 11 digits"),
        amount: yup
          .number()
          .required("Amount is required")
          .typeError("Amount is required")
          .min(100, "Minimum amount is ₦100")
          .max(50000, "Maximum amount is ₦50,000"),
      }),
    []
  );

  const form = useForm({
    defaultValues: { phone: "", amount: undefined },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState, reset, setValue } = form;
  const { errors, isValid } = formState;

  // Prefill when editing
  React.useEffect(() => {
    if (initialPayment) {
      setSelectedType(initialPayment.type);
      const network = NetworkProvider.find(p => p.name === initialPayment.network) || NetworkProvider[0];
      setSelectedNetwork({ name: initialPayment.network, logo: (network as any).logo });
      setSelectedFrequency(
        frequencyOptions.find(f => f.label.toLowerCase() === initialPayment.frequency.toLowerCase()) || null
      );
      setValue("amount", initialPayment.amount as any);
      if (initialPayment.phone) setValue("phone", initialPayment.phone);
    } else {
      reset();
      setSelectedNetwork(null);
      setSelectedFrequency(null);
      setSelectedType("airtime");
    }
  }, [initialPayment, reset, setValue]);

  const handleClose = () => {
    reset();
    setSelectedType("airtime");
    setSelectedNetwork(null);
    setSelectedFrequency(null);
    setNetworkDropdownOpen(false);
    setFrequencyDropdownOpen(false);
    onClose();
  };

  const onSubmit = (data: any) => {
    if (!selectedNetwork || !selectedFrequency) return;

    const payload = {
      id: initialPayment?.id ?? Date.now().toString(),
      type: selectedType,
      network: selectedNetwork.name,
      amount: Number(data.amount),
      frequency: selectedFrequency.label,
      logo: selectedNetwork.logo,
      phone: data.phone,
    };

    if (initialPayment && onSave) {
      onSave(payload);
    } else if (onAdd) {
      onAdd(payload);
    }
    handleClose();
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
            <h2 className="text-white text-lg font-semibold">{initialPayment ? "Edit Schedule Payment" : "Add Schedule Payment"}</h2>
            <p className="text-white/60 text-sm">{initialPayment ? "Update your scheduled payment details" : "Set up automatic payments"}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        {/* Form */}
        <div className="px-4 pb-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Payment Type */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm">Payment Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedType("airtime")}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === "airtime"
                      ? "bg-primary text-black"
                      : "bg-bg-2400 dark:bg-bg-2100 text-white/70 hover:bg-white/5"
                  }`}
                >
                  Airtime
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType("data")}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === "data"
                      ? "bg-primary text-black"
                      : "bg-bg-2400 dark:bg-bg-2100 text-white/70 hover:bg-white/5"
                  }`}
                >
                  Data
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm">Phone Number</label>
              <input
                className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Enter phone number"
                type="text"
                maxLength={11}
                {...register("phone")}
                onKeyDown={handleNumericKeyDown}
                onPaste={handleNumericPaste}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Select Network */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm">Select Network</label>
              <div className="relative" ref={networkDropdownRef}>
                <div 
                  onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {selectedNetwork ? (
                      <>
                        <Image
                          src={selectedNetwork.logo}
                          alt={selectedNetwork.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{selectedNetwork.name}</span>
                      </>
                    ) : (
                      <span className="text-white/50">Select network</span>
                    )}
                  </div>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${networkDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {networkDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden">
                    {networkOptions.map((network) => (
                      <div
                        key={network.name}
                        onClick={() => {
                          setSelectedNetwork(network);
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

            {/* Amount */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm">Amount</label>
              <input
                className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Enter amount"
                type="number"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>

            {/* Frequency */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm">Frequency</label>
              <div className="relative" ref={frequencyDropdownRef}>
                <div 
                  onClick={() => setFrequencyDropdownOpen(!frequencyDropdownOpen)}
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
                >
                  <span className={selectedFrequency ? "text-white" : "text-white/50"}>
                    {selectedFrequency ? selectedFrequency.label : "Select frequency"}
                  </span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${frequencyDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {frequencyDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden">
                    {frequencyOptions.map((frequency) => (
                      <div
                        key={frequency.value}
                        onClick={() => {
                          setSelectedFrequency(frequency);
                          setFrequencyDropdownOpen(false);
                        }}
                        className="px-4 py-3 text-white text-sm hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        {frequency.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <CustomButton
              type="submit"
              disabled={!isValid || !selectedNetwork || !selectedFrequency}
              className="w-full bg-primary hover:bg-primary/90 text-black font-medium py-3 rounded-lg transition-colors mt-2"
            >
              {initialPayment ? "Save Changes" : "Add Schedule Payment"}
            </CustomButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSchedulePaymentModal;
