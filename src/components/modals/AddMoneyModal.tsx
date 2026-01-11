"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { useGetAllBanks, useGetMatchedBanks, useVerifyAccount } from "@/api/wallet/wallet.queries";
import { verifyAccountRequest } from "@/api/wallet/wallet.apis";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import useUserStore from "@/store/user.store";
import { CURRENCY } from "@/constants/types";
import { LuCopy } from "react-icons/lu";
import toast from "react-hot-toast";
import { formatNumberWithCommas } from "@/utils/utilityFunctions";
import PinInputWithFingerprint from "@/components/shared/PinInputWithFingerprint";

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Method = "bank_transfer" | "agent" | "linked";
type Tab = "card" | "account";

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(0);
  const [method, setMethod] = useState<Method | null>(null);
  const [tab, setTab] = useState<Tab>("card");

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [pin, setPin] = useState("");
  const [cardBrand, setCardBrand] = useState<string>("");

  const [bankOpen, setBankOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setBankOpen(false));

  const { banks } = useGetAllBanks();
  const [selectedBank, setSelectedBank] = useState<{ name: string; bankCode: string } | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isDetectingBank, setIsDetectingBank] = useState(false);
  const [isBankAutoDetected, setIsBankAutoDetected] = useState(false);
  const [matchedBanks, setMatchedBanks] = useState<Array<{ bankCode: string; name: string }>>([]);
  const [matchedBanksError, setMatchedBanksError] = useState<string>("");
  const detectReqIdRef = useRef(0);
  const [fundAmount, setFundAmount] = useState<string>("");
  const [walletPin, setWalletPin] = useState<string>("");

  const canProceedCard = useMemo(() => Boolean(cardNumber && expiry && cvv && pin && cardBrand), [cardNumber, expiry, cvv, pin, cardBrand]);
  const canProceedAccount = useMemo(() => Boolean(selectedBank && accountNumber.length === 10 && accountName && sessionId), [selectedBank, accountNumber, accountName, sessionId]);

  const { user } = useUserStore();
  // Detect card brand as user types (basic BIN rules)
  const detectCardBrand = (num: string) => {
    const n = num.replace(/\s|-/g, "");
    if (!n) return "";
    if (/^4[0-9]{6,}$/.test(n)) return "Visa";
    if (/^5[1-5][0-9]{5,}$/.test(n)) return "Mastercard";
    if (/^(2221|222[2-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/.test(n)) return "Mastercard";
    if (/^3[47][0-9]{5,}$/.test(n)) return "Amex";
    if (/^6(?:011|5[0-9]{2})[0-9]{3,}$/.test(n)) return "Discover";
    return "Card";
  };

  // Verify bank account using existing hook pattern
  const onVerifyAccountError = async (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];
    descriptions.filter(Boolean).forEach((d: string) => toast.error(d || "Account verification failed"));
    setAccountName("");
    setSessionId("");
  };
  const onVerifyAccountSuccess = (data: any) => {
    const d = data?.data?.data;
    setAccountName(d?.accountName || "");
    setSessionId(d?.sessionId || "");
  };
  const { mutate: verifyAccount } = useVerifyAccount(onVerifyAccountError, onVerifyAccountSuccess);

  const onMatchedBanksError = (error: any) => {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to fetch matched banks";
    setMatchedBanksError(Array.isArray(errorMessage) ? errorMessage.join(" ") : String(errorMessage));
    setMatchedBanks([]);
  };

  const onMatchedBanksSuccess = (data: any) => {
    const raw = data?.data?.data ?? data?.data ?? data;
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.banks) ? raw.banks : [];

    const normalized = (list || [])
      .map((b: any) => ({
        bankCode: String(b?.bankCode ?? b?.code ?? b?.bank_code ?? ""),
        name: String(b?.name ?? b?.bankName ?? b?.bank_name ?? ""),
      }))
      .filter((b: any) => !!b.bankCode && !!b.name);

    const seen = new Set<string>();
    const deduped = normalized.filter((b: any) => {
      if (seen.has(b.bankCode)) return false;
      seen.add(b.bankCode);
      return true;
    });

    setMatchedBanksError("");
    setMatchedBanks(deduped);
  };

  const { mutate: getMatchedBanks, isPending: matchedBanksLoading } = useGetMatchedBanks(
    onMatchedBanksError,
    onMatchedBanksSuccess
  );

  const tryAutoDetectBank = async (
    acctNumber: string,
    candidateBanks?: Array<{ bankCode: string; name: string }>
  ) => {
    const reqId = ++detectReqIdRef.current;
    setIsDetectingBank(true);
    try {
      const normalizedBanks =
        candidateBanks && candidateBanks.length > 0
          ? candidateBanks
          : (banks || [])
              .map((b: any) => ({
                bankCode: String(b?.bankCode ?? b?.code ?? b?.bank_code ?? ""),
                name: String(b?.name ?? b?.bankName ?? b?.bank_name ?? ""),
              }))
              .filter((b: any) => !!b.bankCode);

      for (const b of normalizedBanks) {
        try {
          const res = await verifyAccountRequest({ accountNumber: acctNumber, bankCode: b.bankCode });
          if (detectReqIdRef.current !== reqId) return;

          const responseData = res?.data?.data || res?.data || {};
          const detectedAccountName = responseData?.accountName || responseData?.account_name || "";
          const detectedSessionId = responseData?.sessionId || responseData?.session_id || "";
          if (detectedAccountName) {
            const detectedBankCode = String(responseData?.bankCode || responseData?.bank_code || b.bankCode) || b.bankCode;
            const detectedBankName = String(responseData?.bankName || responseData?.bank_name || b.name) || b.name;
            setSelectedBank({ name: detectedBankName, bankCode: detectedBankCode });
            setIsBankAutoDetected(true);
            setAccountName(detectedAccountName);
            setSessionId(detectedSessionId);
            setBankOpen(false);
            return;
          }
        } catch {
          // keep trying other banks
        }
      }

      if (detectReqIdRef.current !== reqId) return;
      toast.error("Unable to detect bank. Please select the bank manually.");
    } finally {
      if (detectReqIdRef.current === reqId) setIsDetectingBank(false);
    }
  };

  const bankOptions = useMemo(() => {
    const normalizedAllBanks = (banks || [])
      .map((b: any) => {
        const bankCode = String(b?.bankCode ?? b?.code ?? b?.bank_code ?? "");
        const name = String(b?.name ?? b?.bankName ?? b?.bank_name ?? "");
        return { ...b, bankCode, name };
      })
      .filter((b: any) => !!b.bankCode && !!b.name);

    if (!matchedBanks || matchedBanks.length === 0) return normalizedAllBanks;
    const matchedSet = new Set(matchedBanks.map((b) => b.bankCode));
    const matchedAsBanks = matchedBanks.map((b) => ({ bankCode: b.bankCode, name: b.name }));
    const rest = normalizedAllBanks.filter((b: any) => !matchedSet.has(b.bankCode));
    return [...matchedAsBanks, ...rest];
  }, [banks, matchedBanks]);

  // When matched banks are returned, open dropdown and (optionally) auto-detect/verify using shortlist
  useEffect(() => {
    if (tab !== "account") return;
    if (!accountNumber || accountNumber.length !== 10) return;
    if (selectedBank) return;
    if (matchedBanksLoading) return;

    if (matchedBanks && matchedBanks.length > 0) {
      setBankOpen(true);
      const t = setTimeout(() => {
        tryAutoDetectBank(accountNumber, matchedBanks);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [accountNumber, matchedBanks, matchedBanksLoading, selectedBank, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset to first step whenever modal opens
  useEffect(()=>{
    if (isOpen) {
      setStep(0);
      setMethod(null);
      setTab("card");
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setPin("");
      setCardBrand("");
      setSelectedBank(null);
      setAccountNumber("");
      setAccountName("");
      setSessionId("");
      setBankOpen(false);
      setMatchedBanks([]);
      setMatchedBanksError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div
      aria-hidden="true"
      className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]"
      onClick={onClose}
    >
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" />
      </div>
      <div
        onClick={(e)=>e.stopPropagation()}
        className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-2xl max-h-[94vh] rounded-2xl overflow-visible"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        {/* Header */}
        <div className="px-5 sm:px-6 pt-1 pb-6">
          <h2 className="text-white text-base sm:text-lg font-semibold">Add Money</h2>
        </div>

        {/* Body */}
        <div className="overflow-y-visible px-5 sm:px-6 pb-5">
          {step === 0 && (
            <div className="w-full">
              <p className="text-white/90 text-sm mb-3">How would you like to add funds?</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setMethod("bank_transfer"); setStep(2); }}
                  className="text-left w-full rounded-xl border border-[#2C3947] bg-white/5 hover:bg-white/10 transition-colors px-4 py-4"
                >
                  <p className="text-white font-medium">Bank Transfer</p>
                  <p className="text-white/60 text-xs">Instant & Free</p>
                </button>
                <button
                  onClick={() => { setMethod("agent"); setStep(2); }}
                  className="text-left w-full rounded-xl border border-[#2C3947] bg-white/5 hover:bg-white/10 transition-colors px-4 py-4"
                >
                  <p className="text-white font-medium">Via Agent</p>
                  <p className="text-white/60 text-xs">Instant & Free</p>
                </button>
                <button
                  onClick={() => { setMethod("linked"); setStep(1); }}
                  className="text-left w-full rounded-xl border border-[#2C3947] bg-white/5 hover:bg-white/10 transition-colors px-4 py-4"
                >
                  <p className="text-white font-medium">Via Linked Card/Amount</p>
                  <p className="text-white/60 text-xs">Instant & Free</p>
                </button>
              </div>
            </div>
          )}

          {step === 1 && method === 'linked' && (
            <div className="w-full flex flex-col gap-6">
              <div className="w-full rounded-xl bg-white/5 p-6 grid place-items-center">
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="w-40 h-28"
                    viewBox="0 0 160 112"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <g>
                      <rect x="8" y="12" rx="12" ry="12" width="120" height="80" fill="#4B5563"/>
                      <rect x="8" y="32" width="120" height="12" fill="#374151" opacity="0.8"/>
                      <rect x="20" y="54" rx="3" ry="3" width="28" height="18" fill="#D1D5DB" opacity="0.85"/>
                      <rect x="86" y="56" rx="2" ry="2" width="32" height="4" fill="#9CA3AF"/>
                      <rect x="86" y="66" rx="2" ry="2" width="24" height="4" fill="#9CA3AF"/>
                      <circle cx="112" cy="76" r="18" fill="#9CA3AF"/>
                      <path d="M104 76 L120 76" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" transform="rotate(45 112 76)"/>
                      <path d="M104 76 L120 76" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" transform="rotate(-45 112 76)"/>
                    </g>
                  </svg>
                  <p className="text-white/60 text-sm">No linked Cards/Accounts</p>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 gap-4">
                <CustomButton type="button" className="w-full bg-transparent border border-[#D4B139] text-white py-3.5 rounded-xl hover:bg-transparent" onClick={() => setStep(0)}>
                  Back
                </CustomButton>
                <CustomButton type="button" className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" onClick={() => setStep(2)}>
                  Add Card/Account
                </CustomButton>
              </div>
            </div>
          )}

          {step === 2 && method === 'bank_transfer' && (
            <div className="w-full flex flex-col gap-4">
              <div className="w-full rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 px-4 py-3 text-xs sm:text-sm text-[#A7F3D0]">
                Transfer any amount to the account below from any bank. Funds will be credited automatically within 5-10 minutes.
              </div>
              <div className="w-full flex flex-col gap-3 text-sm sm:text-base">
                <div className="relative w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-white/60 text-xs">Account Name</p>
                  <div className="pr-8 text-white font-medium truncate">{user?.wallet?.find(w=>w.currency===CURRENCY.NGN)?.accountName || ''}</div>
                  <button
                    onClick={() => navigator.clipboard.writeText(user?.wallet?.find(w=>w.currency===CURRENCY.NGN)?.accountName || '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
                    title="Copy"
                  >
                    <LuCopy className="w-4 h-4 text-white/80" />
                  </button>
                </div>
                <div className="relative w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-white/60 text-xs">Account Number</p>
                  <div className="pr-8 text-white font-medium">{user?.wallet?.find(w=>w.currency===CURRENCY.NGN)?.accountNumber || ''}</div>
                  <button
                    onClick={() => navigator.clipboard.writeText(user?.wallet?.find(w=>w.currency===CURRENCY.NGN)?.accountNumber || '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
                    title="Copy"
                  >
                    <LuCopy className="w-4 h-4 text-white/80" />
                  </button>
                </div>
                <div className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-white/60 text-xs">Bank Name</p>
                  <p className="text-white font-medium">{user?.wallet?.find(w=>w.currency===CURRENCY.NGN)?.bankName || ''}</p>
                </div>
              </div>

              <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-white font-semibold">Fund your NattyPay wallet easily in three quick steps</p>
                <ol className="list-decimal pl-5 space-y-1 text-white/85 text-sm">
                  <li>Copy your unique NattyPay account number from the app.</li>
                  <li>Open your mobile banking app and initiate a transfer.</li>
                  <li>Send the desired amount, and your NattyPay account will be credited instantly.</li>
                </ol>
              </div>

              <div className="w-full mt-2">
                <CustomButton type="button" className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" onClick={onClose}>
                  Done
                </CustomButton>
              </div>
            </div>
          )}

          {step === 2 && method === 'agent' && (
            <div className="w-full flex flex-col gap-4">
              <div className="w-full rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 px-4 py-3 text-xs sm:text-sm text-[#A7F3D0]">
                Transfer any amount to the account below from any merchant. Funds will be credited automatically within 5-10 minutes.
              </div>
              <div className="w-full flex flex-col gap-3 text-sm sm:text-base">
                <div className="relative w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-white/60 text-xs">Account Name</p>
                  <div className="pr-8 text-white font-medium truncate">{user?.wallet?.find(w=>w.currency===CURRENCY.NGN)?.accountName || ''}</div>
                  <button
                    onClick={() => navigator.clipboard.writeText(user?.wallet?.find(w=>w.currency===CURRENCY.NGN)?.accountName || '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
                    title="Copy"
                  >
                    <LuCopy className="w-4 h-4 text-white/80" />
                  </button>
                </div>
                <div className="relative w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-white/60 text-xs">Account Number</p>
                  <div className="pr-8 text-white font-medium">{user?.wallet?.find(w=>w.currency===CURRENCY.NGN)?.accountNumber || ''}</div>
                  <button
                    onClick={() => navigator.clipboard.writeText(user?.wallet?.find(w=>w.currency===CURRENCY.NGN)?.accountNumber || '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
                    title="Copy"
                  >
                    <LuCopy className="w-4 h-4 text-white/80" />
                  </button>
                </div>
                <div className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-white/60 text-xs">Bank Name</p>
                  <p className="text-white font-medium">{user?.wallet?.find(w=>w.currency===CURRENCY.NGN)?.bankName || ''}</p>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80 text-sm leading-relaxed">
                <p className="mb-2 text-white font-semibold">Fund your NattyPay wallet easily in three quick steps</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Visit a nearby authorized NattyPay agent.</li>
                  <li>Provide your NattyPay account number to the agent.</li>
                  <li>Hand over the cash you want to deposit.</li>
                  <li>The agent processes your deposit, and your account will be funded instantly</li>
                </ol>
              </div>
              <div className="w-full mt-2">
                <CustomButton type="button" className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" onClick={onClose}>
                  Done
                </CustomButton>
              </div>
            </div>
          )}

          {step === 2 && method === 'linked' && (
            <div className="w-full flex flex-col gap-4">
              {/* Tabs */}
              <div className="w-full flex items-center gap-8 border-b border-white/10 pb-2">
                <button type="button" className={`text-sm font-medium pb-1 border-b-2 ${tab==='card' ? 'text-[#F2C94C] border-[#F2C94C]' : 'text-white/70 border-transparent'}`} onClick={() => setTab('card')}>
                  Bank Card
                </button>
                <button type="button" className={`text-sm font-medium pb-1 border-b-2 ${tab==='account' ? 'text-[#F2C94C] border-[#F2C94C]' : 'text-white/70 border-transparent'}`} onClick={() => setTab('account')}>
                  Bank Account
                </button>
              </div>

              <p className="text-xs text-white/60">Make sure the account you are adding is linked to your BVN</p>

              {tab === 'card' && (
                <div className="w-full flex flex-col gap-3">
                  <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                    <input
                      className="flex-1 bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50 placeholder:text-sm"
                      placeholder="Card Number"
                      type="text"
                      value={cardNumber}
                      onChange={(e)=> { const v = e.target.value; setCardNumber(v); setCardBrand(detectCardBrand(v)); }}
                    />
                    {cardBrand ? (
                      <span className="ml-2 text-xs text-white/70">{cardBrand}</span>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                      <input
                        className="w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50 placeholder:text-sm"
                        placeholder="Expiry Date"
                        type="text"
                        value={expiry}
                        onChange={(e)=> setExpiry(e.target.value)}
                      />
                    </div>
                    <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                      <input
                        className="w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50 placeholder:text-sm"
                        placeholder="CVV"
                        type="password"
                        value={cvv}
                        onChange={(e)=> setCvv(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                    <input
                      className="w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50 placeholder:text-sm"
                      placeholder="Card Pin"
                      type="password"
                      value={pin}
                      onChange={(e)=> setPin(e.target.value)}
                    />
                  </div>

                  <div className="w-full grid grid-cols-2 gap-4 mt-2 items-stretch">
                    <CustomButton type="button" className="w-full bg-transparent border border-[#D4B139] text-white py-3.5 rounded-xl hover:bg-transparent" onClick={() => setStep(0)}>
                      Back
                    </CustomButton>
                    <CustomButton type="button" disabled={!canProceedCard} className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" onClick={()=> setStep(3)}>
                      Next
                    </CustomButton>
                  </div>
                </div>
              )}

              {tab === 'account' && (
                <div className="w-full flex flex-col gap-3">
                  <div className="relative w-full" ref={dropdownRef}>
                    <div
                      onClick={() => setBankOpen(!bankOpen)}
                      className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 cursor-pointer"
                    >
                      <div className="w-full flex items-center justify-between text-white/80">
                        {!selectedBank ? (
                          <p className="text-sm">Select Banks</p>
                        ) : (
                          <p className="text-sm font-medium">{selectedBank.name}</p>
                        )}
                        <svg className={`w-4 h-4 transition-transform ${bankOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                      </div>
                    </div>
                    {bankOpen && (
                      <div className="absolute top-full my-2.5 px-1 py-2 overflow-y-auto h-fit max-h-60 w-full bg-bg-600 border dark:bg-bg-1100 border-gray-300 dark:border-border-600 rounded-md shadow-md z-10 no-scrollbar">
                        <SearchableDropdown
                          items={bankOptions}
                          searchKey="name"
                          displayFormat={(bank) => (
                            <div className="flex flex-col text-white/90">
                              <p className="text-sm font-medium">{bank.name}</p>
                            </div>
                          )}
                          onSelect={(bank: any) => {
                            const bankCode = String(bank.bankCode ?? bank.code ?? "");
                            setSelectedBank({ name: bank.name, bankCode });
                            setIsBankAutoDetected(false);
                            setBankOpen(false);

                            // If we already have a full account number, verify immediately with chosen bank
                            if (accountNumber && accountNumber.length === 10 && bankCode) {
                              verifyAccount({ accountNumber, bankCode });
                            }
                          }}
                          placeholder="Search bank..."
                          isOpen={bankOpen}
                          onClose={() => setBankOpen(false)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="w-full flex flex-col gap-2">
                    <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                      <input
                        className="w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50 placeholder:text-sm"
                        placeholder="Account Number"
                        type="text"
                        value={accountNumber}
                        onChange={(e)=> {
                          const v = e.target.value.replace(/\D/g,"");
                          setAccountNumber(v);
                          setAccountName("");
                          setSessionId("");
                          setMatchedBanks([]);
                          setMatchedBanksError("");
                          if (isBankAutoDetected) {
                            setSelectedBank(null);
                          }
                          if (selectedBank && v.length === 10) {
                            verifyAccount({ accountNumber: v, bankCode: selectedBank.bankCode });
                          } else if (!selectedBank && v.length === 10) {
                            // Fetch matched banks first, then auto-detect from shortlist
                            getMatchedBanks(v);
                          }
                        }}
                      />
                    </div>
                    {isDetectingBank ? (
                      <div className="text-xs text-white/60">Detecting bank...</div>
                    ) : null}
                    {!selectedBank && accountNumber.length === 10 ? (
                      <div className="text-xs text-white/60">
                        {matchedBanksLoading
                          ? "Finding matched banks..."
                          : matchedBanksError
                            ? "Couldn’t match banks automatically. Please select the bank manually."
                            : matchedBanks.length > 0
                              ? `Matched banks found: ${matchedBanks.length}. Select one.`
                              : "No matched banks found. Please select the bank manually."}
                      </div>
                    ) : null}
                    {accountName ? (
                      <div className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90">
                        {accountName}
                      </div>
                    ) : null}
                  </div>

                  <div className="w-full grid grid-cols-2 gap-4 mt-2 items-stretch">
                    <CustomButton type="button" className="w-full border border-[#F2C94C] text-white py-3.5 rounded-xl" onClick={() => setStep(0)}>
                      Back
                    </CustomButton>
                    <CustomButton type="button" disabled={!canProceedAccount} className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" onClick={()=> setStep(3)}>
                      Next
                    </CustomButton>
                  </div>
                </div>
              )}
            </div>
          )}
          {step === 3 && method === 'linked' && (
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Enter Amount</label>
                <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3">
                  <input
                    className="w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50"
                    placeholder="0.00"
                    inputMode="decimal"
                    value={fundAmount}
                    onChange={(e)=>{
                      const v = e.target.value.replace(/,/g,"");
                      if (/^\d*\.?\d*$/.test(v)) setFundAmount(formatNumberWithCommas(v));
                    }}
                  />
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Available Balance (₦{(Number(user?.wallet?.find(w=>w.currency===CURRENCY.NGN)?.balance)||0).toLocaleString()})
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[1000,5000,10000,20000,25000].map((amt)=> (
                  <button
                    key={amt}
                    type="button"
                    className="px-3 py-1.5 rounded-md bg-white/5 text-white/80 text-sm border border-white/10 hover:bg-white/10"
                    onClick={()=> setFundAmount(formatNumberWithCommas(String(amt)))}
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-white/90 text-sm">Top-up Account Via</p>
                <button type="button" className="text-[#D4B139] text-xs">Manage Card</button>
              </div>
              <div className="w-full rounded-xl bg-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-white/10 grid place-items-center text-white/80 text-xs">
                    {tab === 'card' ? (cardBrand || 'Card').slice(0,2) : (selectedBank?.name || 'Bank').slice(0,2)}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white text-sm font-medium">{tab==='card' ? (cardBrand || 'Card') : (selectedBank?.name || 'Bank')}</p>
                    <p className="text-xs text-white/60">{tab==='card' ? `${cardNumber?.slice(-4).padStart(4,'*')}` : `${accountNumber}`}</p>
                  </div>
                </div>
                <span className="w-5 h-5 rounded-full border border-white/30" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Enter Transaction PIN</label>
                <PinInputWithFingerprint
                  value={walletPin}
                  onChange={setWalletPin}
                  placeholder="••••"
                  disabled={false}
                  onBiometricSuccess={(pin) => {
                    setWalletPin(pin);
                    // Auto-submit if biometric succeeds
                    if (pin) {
                      // Trigger the payment flow
                      // The parent component should handle the submission
                    }
                  }}
                />
              </div>

              <div className="w-full grid grid-cols-2 gap-4 items-stretch mt-2">
                <CustomButton type="button" className="w-full bg-transparent border border-[#D4B139] text-white py-3.5 rounded-xl hover:bg-transparent" onClick={()=> setStep(2)}>
                  Back
                </CustomButton>
                <CustomButton
                  type="button"
                  disabled={!fundAmount || Number(fundAmount.replace(/,/g,''))<=0 || !walletPin}
                  className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl"
                  onClick={onClose}
                >
                  Pay
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMoneyModal;
