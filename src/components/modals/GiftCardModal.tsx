"use client";

import React, { useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import {
  useGetGCCategories,
  useGetGCProductsByCurrency,
  useGetGCFxRate,
  usePayForGiftCard,
  useGetGCRedeemCode,
} from "@/api/gift-card/gift-card.queries";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";

interface GiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GiftCardModal: React.FC<GiftCardModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "confirm" | "result" | "redeem">("form");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{name: string; currency: string} | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{name: string; productId: number; unitPrice: number; currency: string} | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [walletPin, setWalletPin] = useState<string>("");
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [redeemCodes, setRedeemCodes] = useState<{cardNumber: string; pinCode: string}[]>([]);

  const categoryRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(categoryRef, () => setCategoryOpen(false));
  useOnClickOutside(productRef, () => setProductOpen(false));

  // Fetch categories
  const { categories, isLoading: categoriesLoading } = useGetGCCategories();

  // Fetch products when category is selected
  const { products, isLoading: productsLoading } = useGetGCProductsByCurrency({
    currency: selectedCategory?.currency || "",
  });

  // Fetch FX rate when product and quantity are selected
  const totalAmount = selectedProduct ? Number(selectedProduct.unitPrice) * Number(quantity) : 0;
  const { fxRate, isLoading: fxRateLoading } = useGetGCFxRate({
    amount: totalAmount,
    currency: selectedProduct?.currency || "USD",
  });

  // Fetch redeem codes
  const { response: redeemCodeResponse, refetch: fetchRedeemCodes, isLoading: redeemLoading } = useGetGCRedeemCode({
    transactionId: transactionId || 0,
  });

  const canProceed = !!selectedCategory && !!selectedProduct && Number(quantity) > 0;
  const totalPayAmount = fxRate?.payAmount || totalAmount;

  const handleClose = () => {
    setStep("form");
    setCategoryOpen(false);
    setProductOpen(false);
    setSelectedCategory(null);
    setSelectedProduct(null);
    setQuantity("1");
    setWalletPin("");
    setResultSuccess(null);
    setTransactionId(null);
    setRedeemCodes([]);
    onClose();
  };

  const onPaySuccess = (data: any) => {
    const txId = data?.data?.data?.transactionId || data?.data?.transactionId;
    setTransactionId(txId);
    setResultSuccess(true);
    setStep("result");
  };

  const onPayError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    setResultSuccess(false);
    setStep("result");
    ErrorToast({
      title: "Purchase Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
  };

  const { mutate: payGiftCard, isPending: paying } = usePayForGiftCard(
    onPayError,
    onPaySuccess
  );

  const handleConfirm = () => {
    if (walletPin.length !== 4 || !selectedProduct) return;
    payGiftCard({
      productId: selectedProduct.productId,
      currency: selectedProduct.currency,
      amount: totalPayAmount,
      quantity: Number(quantity),
      unitPrice: selectedProduct.unitPrice,
      walletPin,
    });
  };

  const handleFetchRedeemCodes = async () => {
    if (!transactionId) return;
    try {
      const result = await fetchRedeemCodes();
      if (result?.data?.data) {
        setRedeemCodes(result.data.data);
        setStep("redeem");
        SuccessToast({
          title: "Redeem Codes Retrieved",
          description: "Your gift card codes have been retrieved successfully",
        });
      }
    } catch (error) {
      ErrorToast({
        title: "Failed to Retrieve Codes",
        descriptions: ["Unable to fetch redeem codes. Please contact support."],
      });
    }
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
            <h2 className="text-white text-lg font-semibold">
              {step === "form" ? "Gift Card" : step === "confirm" ? "Gift Card" : step === "redeem" ? "Redeem Codes" : "Transaction History"}
            </h2>
            <p className="text-white/60 text-sm">
              {step === "form" ? "Select gift card to purchase" : 
               step === "confirm" ? "Confirm purchase" : 
               step === "redeem" ? "Your gift card codes" :
               "View transaction details"}
            </p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        <div className="px-4 pb-4">
          {step === "form" && (
            <div className="flex flex-col gap-4">
              {/* Category */}
              <div className="flex flex-col gap-2" ref={categoryRef}>
                <label className="text-white/70 text-sm">Category</label>
                <div onClick={() => setCategoryOpen(!categoryOpen)} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between">
                  <span className={selectedCategory ? "text-white" : "text-white/50"}>{selectedCategory?.name || "Select category"}</span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                </div>
                {categoryOpen && (
                  <div className="relative">
                    <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {categoriesLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <SpinnerLoader width={20} height={20} color="#D4B139" />
                        </div>
                      ) : (categories || []).map((c: any) => (
                        <button
                          key={c.currency || c.name}
                          onClick={() => {
                            setSelectedCategory({ name: c.name || c.currency, currency: c.currency });
                            setSelectedProduct(null);
                            setCategoryOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/5 text-sm"
                        >
                          {c.name || c.currency}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product */}
              {selectedCategory && (
                <div className="flex flex-col gap-2" ref={productRef}>
                  <label className="text-white/70 text-sm">Product</label>
                  <div onClick={() => selectedCategory && setProductOpen(!productOpen)} className={`w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between ${!selectedCategory ? 'opacity-60 pointer-events-none' : ''}`}>
                    <span className={selectedProduct ? "text-white" : "text-white/50"}>{selectedProduct?.name || (selectedCategory ? 'Select product' : 'Select category first')}</span>
                    <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${productOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {productOpen && (
                    <div className="relative">
                      <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {productsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <SpinnerLoader width={20} height={20} color="#D4B139" />
                          </div>
                        ) : (products || []).map((p: any) => (
                          <button
                            key={p.productId}
                            onClick={() => {
                              setSelectedProduct({
                                name: p.productName || p.name,
                                productId: p.productId,
                                unitPrice: p.unitPrice || p.price,
                                currency: p.currency || selectedCategory.currency,
                              });
                              setProductOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-white/5 text-sm flex items-center justify-between"
                          >
                            <span>{p.productName || p.name}</span>
                            <span className="text-[#D4B139] font-medium">{p.currency || selectedCategory.currency} {Number(p.unitPrice || p.price).toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity */}
              {selectedProduct && (
                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Quantity</label>
                  <input
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                    placeholder="Enter quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              )}

              {/* FX Rate and Amount Display */}
              {selectedProduct && Number(quantity) > 0 && (
                <div className="flex flex-col gap-2 p-4 bg-bg-2400/50 dark:bg-bg-2100/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Subtotal</span>
                    <span className="text-white text-sm font-medium">
                      {selectedProduct.currency} {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  {fxRateLoading && (
                    <div className="flex items-center justify-center py-2">
                      <SpinnerLoader width={16} height={16} color="#D4B139" />
                      <span className="text-white/60 text-xs ml-2">Calculating FX rate...</span>
                    </div>
                  )}
                  {fxRate && fxRate.rate && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">Exchange Rate</span>
                        <span className="text-white text-sm font-medium">1 {selectedProduct.currency} = ₦{Number(fxRate.rate).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border-600">
                        <span className="text-white font-medium">Total (NGN)</span>
                        <span className="text-[#D4B139] text-lg font-bold">₦{Number(totalPayAmount).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <CustomButton
                type="button"
                disabled={!canProceed || fxRateLoading}
                className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg transition-colors mt-2"
                onClick={() => setStep("confirm")}
              >
                Next
              </CustomButton>
            </div>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Product</span><span className="text-white text-sm font-medium">{selectedProduct?.name}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Quantity</span><span className="text-white text-sm font-medium">{quantity}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Unit Price</span><span className="text-white text-sm font-medium">{selectedProduct?.currency} {Number(selectedProduct?.unitPrice || 0).toLocaleString()}</span></div>
                {fxRate && (
                  <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Exchange Rate</span><span className="text-white text-sm font-medium">1 {selectedProduct?.currency} = ₦{Number(fxRate.rate).toFixed(2)}</span></div>
                )}
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Total Amount</span><span className="text-white text-sm font-medium">₦{Number(totalPayAmount).toLocaleString()}</span></div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-sm">Enter Transaction PIN</label>
                <input type="password" maxLength={4} value={walletPin} onChange={(e)=> setWalletPin(e.target.value.replace(/\D/g, ""))} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none" />
              </div>
              <div className="flex gap-4 mt-2">
                <CustomButton onClick={()=> setStep("form")} className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg">Back</CustomButton>
                <CustomButton onClick={handleConfirm} disabled={walletPin.length!==4 || paying} isLoading={paying} className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black py-3 rounded-lg">Purchase</CustomButton>
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
              <span className={`${resultSuccess ? 'text-emerald-400' : 'text-red-400'} text-sm font-medium`}>{resultSuccess ? 'Purchase Successful' : 'Purchase Failed'}</span>
              <span className="text-white text-2xl font-bold">₦{Number(totalPayAmount).toLocaleString()}.00</span>
              {resultSuccess && transactionId && (
                <div className="w-full space-y-3 mt-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/70 text-sm">Transaction ID</span>
                    <span className="text-white text-sm font-medium">{transactionId}</span>
                  </div>
                  <CustomButton
                    onClick={handleFetchRedeemCodes}
                    disabled={redeemLoading}
                    isLoading={redeemLoading}
                    className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg"
                  >
                    Get Redeem Codes
                  </CustomButton>
                </div>
              )}
              <div className="flex gap-3 mt-4 w-full">
                <CustomButton onClick={handleClose} className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg">Contact Support</CustomButton>
                <CustomButton onClick={handleClose} className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black py-3 rounded-lg">Download Receipt</CustomButton>
              </div>
            </div>
          )}

          {step === "redeem" && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h3 className="text-white text-lg font-semibold mb-2">Your Gift Card Codes</h3>
                <p className="text-white/60 text-sm">Save these codes securely</p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {redeemCodes.map((code, index) => (
                  <div key={index} className="bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">Card Number</span>
                        <span className="text-white text-sm font-medium font-mono">{code.cardNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">PIN Code</span>
                        <span className="text-white text-sm font-medium font-mono">{code.pinCode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <CustomButton onClick={handleClose} className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg">Done</CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftCardModal;






