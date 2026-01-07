"use client";

import React, { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import {
  useGetWaecPlans,
  useGetWaecBillInfo,
  useVerifyWaecBillerNumber,
  usePayForWaec,
} from "@/api/waec/waec.queries";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useUserStore from "@/store/user.store";

interface WaecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaecModal: React.FC<WaecModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "verify" | "confirm" | "result">("form");
  const [billerOpen, setBillerOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState<{name: string; billerCode: string} | null>(null);
  const [selectedItem, setSelectedItem] = useState<{name: string; itemCode: string; amount?: number} | null>(null);
  const [customerId, setCustomerId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [walletPin, setWalletPin] = useState<string>("");
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [verifiedCustomer, setVerifiedCustomer] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [verificationMessage, setVerificationMessage] = useState<string>("");
  const [verificationError, setVerificationError] = useState<string>("");
  const { user } = useUserStore();

  const billerRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(billerRef, () => setBillerOpen(false));
  useOnClickOutside(itemRef, () => setItemOpen(false));

  // Fetch WAEC plans
  const { waecPlans, isPending: plansLoading } = useGetWaecPlans();

  // Fetch bill info when biller is selected
  const { billInfo, isLoading: billInfoLoading } = useGetWaecBillInfo({
    billerCode: selectedBiller?.billerCode || "",
  });

  // Extract items from billInfo
  const items = billInfo?.items || [];

  const canProceed = !!selectedBiller && !!selectedItem && customerId.length > 0;
  const canVerify = canProceed && (amount ? Number(amount) > 0 : true);

  const handleClose = () => {
    setStep("form");
    setBillerOpen(false);
    setItemOpen(false);
    setSelectedBiller(null);
    setSelectedItem(null);
    setCustomerId("");
    setAmount("");
    setWalletPin("");
    setResultSuccess(null);
    setVerifiedCustomer(null);
    setTransactionData(null);
    setVerificationMessage("");
    setVerificationError("");
    onClose();
  };

  const onVerifySuccess = (data: any) => {
    const res = data?.data?.data;
    setVerifiedCustomer(res);
    setVerificationMessage(res?.customerName || res?.name || "Verified");
    setVerificationError("");
  };

  const onVerifyError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    setVerificationMessage("");
    setVerificationError(errorMessage);
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    ErrorToast({
      title: "Verification Failed",
      descriptions,
    });
  };

  const { mutate: verifyBillerNumber, isPending: verifying } = useVerifyWaecBillerNumber(
    onVerifyError,
    onVerifySuccess
  );

  // Auto-verify when biller + item + customerId are available
  useEffect(() => {
    if (selectedBiller && selectedItem && customerId && customerId.length >= 7) {
      verifyBillerNumber({
        billerCode: selectedBiller.billerCode,
        itemCode: selectedItem.itemCode,
        customerId,
      });
    }
  }, [selectedBiller, selectedItem, customerId, verifyBillerNumber]);

  const onPaySuccess = (data: any) => {
    setTransactionData(data?.data);
    setResultSuccess(true);
    setStep("result");
  };

  const onPayError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    setResultSuccess(false);
    setStep("result");
    ErrorToast({
      title: "Payment Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
  };

  const { mutate: payWaec, isPending: paying } = usePayForWaec(
    onPayError,
    onPaySuccess
  );

  const handleConfirm = () => {
    if (walletPin.length !== 4 || !selectedBiller || !selectedItem) return;
    payWaec({
      billerCode: selectedBiller.billerCode,
      itemCode: selectedItem.itemCode,
      customerId,
      amount: Number(amount || selectedItem.amount || 0),
      currency: "NGN",
      walletPin,
      customerName: verifiedCustomer?.customerName || user?.fullname || "",
      customerEmail: user?.email || "",
      customerPhone: user?.phoneNumber || "",
      addBeneficiary: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            <h2 className="text-white text-lg font-semibold">{step === "form" ? "WAEC" : step === "confirm" ? "WAEC" : "Transaction History"}</h2>
            <p className="text-white/60 text-sm">{step === "form" ? "Enter payment details to continue" : step === "confirm" ? "Confirm Transactions" : "View complete information about this transaction"}</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        <div className="px-4 pb-4">
          {step === "form" && (
            <div className="flex flex-col gap-4">
              {/* Biller */}
              <div className="flex flex-col gap-2 relative" ref={billerRef}>
                <label className="text-white/70 text-sm">Select Biller</label>
                <div onClick={() => setBillerOpen(!billerOpen)} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between">
                  <span className={selectedBiller ? "text-white" : "text-white/50"}>{selectedBiller?.name || "Select WAEC biller"}</span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${billerOpen ? 'rotate-180' : ''}`} />
                </div>
                {billerOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-[100]">
                    <div className="bg-[#1a1d29] dark:bg-[#1a1d29] border border-border-800 dark:border-border-700 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                      {plansLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <SpinnerLoader width={20} height={20} color="#D4B139" />
                        </div>
                      ) : !Array.isArray(waecPlans) || waecPlans.length === 0 ? (
                        <div className="px-4 py-3 text-white/50 text-sm">No billers available</div>
                      ) : (
                        waecPlans.map((b: any) => (
                          <button
                            key={b.billerCode}
                            onClick={() => {
                              setSelectedBiller({ name: b.name || b.billerName, billerCode: b.billerCode });
                              setSelectedItem(null);
                              setAmount("");
                              setBillerOpen(false);
                              setItemOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/5 text-sm"
                          >
                            {b.name || b.billerName}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Item */}
              {selectedBiller && (
                <div className="flex flex-col gap-2 relative" ref={itemRef}>
                  <label className="text-white/70 text-sm">Select Item</label>
                  <div onClick={() => selectedBiller && setItemOpen(!itemOpen)} className={`w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between ${!selectedBiller ? 'opacity-60 pointer-events-none' : ''}`}>
                    <span className={selectedItem ? "text-white" : "text-white/50"}>{selectedItem?.name || (selectedBiller ? 'Select item' : 'Select biller first')}</span>
                    <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${itemOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {itemOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-[100]">
                      <div className="bg-[#1a1d29] dark:bg-[#1a1d29] border border-border-800 dark:border-border-700 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                        {billInfoLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <SpinnerLoader width={20} height={20} color="#D4B139" />
                          </div>
                        ) : items.length === 0 ? (
                          <div className="px-4 py-3 text-white/50 text-sm">No items available</div>
                        ) : items.map((it: any) => (
                          <button
                            key={it.itemCode || it.item_code}
                            onClick={() => {
                              setSelectedItem({ 
                                name: it.itemName || it.name || it.short_name, 
                                itemCode: it.itemCode || it.item_code, 
                                amount: it.amount 
                              });
                              if (it.amount) setAmount(String(it.amount));
                              setItemOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-white/5 text-sm flex items-center justify-between"
                          >
                            <span>{it.itemName || it.name || it.short_name}</span>
                            {it.amount && <span className="text-[#D4B139] font-medium">₦{Number(it.amount).toLocaleString()}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Customer ID */}
              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">Customer ID (Registration Number)</label>
                <div className="relative w-full">
                  <input 
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 pr-10 text-white placeholder:text-white/60 text-sm outline-none" 
                    placeholder="Enter customer ID" 
                    value={customerId} 
                    onChange={(e)=> setCustomerId(e.target.value)} 
                  />
                  {(verifying || billInfoLoading) && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <SpinnerLoader width={18} height={18} color="#D4B139" />
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Status */}
              {!verifying && !billInfoLoading && (
                <>
                  {verificationMessage && !verificationError && selectedBiller && selectedItem && customerId ? (
                    <div className="flex flex-col">
                      <p className="text-[#D4B139] text-sm">{verificationMessage}</p>
                    </div>
                  ) : verificationError ? (
                    <p className="flex self-start text-red-500 font-semibold text-sm">
                      {verificationError}
                    </p>
                  ) : null}
                </>
              )}

              {/* Amount (if not fixed) */}
              {selectedItem && !selectedItem.amount && (
                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Amount</label>
                  <input className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none" placeholder="Enter amount" value={amount} onChange={(e)=> setAmount(e.target.value.replace(/[^\d.]/g, ''))} />
                </div>
              )}

              {/* Amount Display */}
              {(selectedItem?.amount || amount) && (
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-2 text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-lg">₦{Number(selectedItem?.amount || amount || 0).toLocaleString()}.00</span>
                  </div>
                </div>
              )}

              {/* Next Button - Only show when verification is successful */}
              {verificationMessage && !verificationError && selectedBiller && selectedItem && customerId && (selectedItem.amount || (amount && Number(amount) > 0)) && (
                <CustomButton
                  type="button"
                  className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg transition-colors mt-2"
                  onClick={() => setStep("confirm")}
                >
                  Next
                </CustomButton>
              )}
            </div>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Biller</span><span className="text-white text-sm font-medium">{selectedBiller?.name}</span></div>
                {selectedItem && (
                  <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Item</span><span className="text-white text-sm font-medium">{selectedItem.name}</span></div>
                )}
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Customer ID</span><span className="text-white text-sm font-medium">{customerId}</span></div>
                {verifiedCustomer && (
                  <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Customer Name</span><span className="text-white text-sm font-medium">{verifiedCustomer.customerName || verifiedCustomer.name || "N/A"}</span></div>
                )}
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Amount</span><span className="text-white text-sm font-medium">₦{Number(selectedItem?.amount || amount || 0).toLocaleString()}</span></div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-sm">Enter Transaction PIN</label>
                <input type="password" maxLength={4} value={walletPin} onChange={(e)=> setWalletPin(e.target.value.replace(/\D/g, ""))} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none" />
              </div>
              <div className="flex gap-4 mt-2">
                <CustomButton onClick={()=> setStep("form")} className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg">Back</CustomButton>
                <CustomButton onClick={handleConfirm} disabled={walletPin.length!==4 || paying} isLoading={paying} className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black py-3 rounded-lg">Pay</CustomButton>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: resultSuccess ? '#22c55e' : '#ef4444' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {resultSuccess ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <span className={`${resultSuccess ? 'text-emerald-400' : 'text-red-400'} text-sm font-medium`}>{resultSuccess ? 'Payment Successful' : 'Payment Failed'}</span>
              <span className="text-white text-2xl font-bold">₦{Number(selectedItem?.amount || amount || 0).toLocaleString()}.00</span>
              
              {resultSuccess && transactionData && (
                <div className="w-full bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Transaction Reference</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-mono">
                        {transactionData?.transactionRef || transactionData?.transaction?.transactionRef || transactionData?.transactionId || "N/A"}
                      </span>
                      {(transactionData?.transactionRef || transactionData?.transaction?.transactionRef || transactionData?.transactionId) && (
                        <button
                          onClick={() => {
                            const ref = transactionData?.transactionRef || transactionData?.transaction?.transactionRef || transactionData?.transactionId;
                            if (ref) {
                              navigator.clipboard.writeText(String(ref));
                              SuccessToast({
                                title: "Copied",
                                description: "Transaction reference copied to clipboard",
                              });
                            }
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
                  {transactionData?.transactionId && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Transaction ID</span>
                      <span className="text-white text-sm font-mono">{transactionData.transactionId}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3 mt-4 w-full">
                <CustomButton onClick={handleClose} className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg">Contact Support</CustomButton>
                <CustomButton onClick={handleClose} className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black py-3 rounded-lg">Download Receipt</CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaecModal;


