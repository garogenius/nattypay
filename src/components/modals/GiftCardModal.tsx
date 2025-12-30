"use client";

import React, { useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import {
  useGetGCCategories,
  useGetGCProductsByCurrency,
  usePayForGiftCard,
  useGetGCRedeemCode,
} from "@/api/gift-card/gift-card.queries";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { getAllISOCodes } from "iso-country-currency";
import { GiftCardProduct, GiftCardPriceDetail } from "@/constants/types";
import Image from "next/image";

// Process gift card prices (matching bills/gift-card page)
function processGiftCardPrices(
  product: GiftCardProduct
): GiftCardPriceDetail[] {
  const result: GiftCardPriceDetail[] = [];

  if (product.denominationType === "FIXED") {
    const senderMap = product.fixedRecipientToSenderDenominationsMap || {};
    const payMap = product.fixedRecipientToPayAmount || {};

    Object.entries(payMap).forEach(([priceStr, payAmount]) => {
      const price = parseFloat(priceStr);
      const senderAmount = senderMap[`${price}.0`] || senderMap[priceStr];

      if (senderAmount !== undefined) {
        result.push({
          price,
          amount: payAmount,
          fee: payAmount - senderAmount,
        });
      }
    });
  } else if (product.denominationType === "RANGE") {
    const payMap = product.fixedRecipientToPayAmount || {};

    Object.entries(payMap).forEach(([priceStr, payAmount]) => {
      const price = parseFloat(priceStr);
      result.push({
        price,
        amount: payAmount,
        fee: payAmount - payAmount,
      });
    });
  }

  return result;
}

interface GiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GiftCardModal: React.FC<GiftCardModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "confirm" | "result" | "redeem">("form");
  const allCurrencies = getAllISOCodes();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [product, setProduct] = useState<GiftCardProduct | null>(null);
  const [prices, setPrices] = useState<GiftCardPriceDetail[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<GiftCardPriceDetail | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [walletPin, setWalletPin] = useState<string>("");
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [redeemCodes, setRedeemCodes] = useState<{cardNumber: string; pinCode: string}[]>([]);

  const currencyRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(currencyRef, () => setCurrencyOpen(false));
  useOnClickOutside(categoryRef, () => setCategoryOpen(false));
  useOnClickOutside(productRef, () => setProductOpen(false));
  useOnClickOutside(priceRef, () => setPriceOpen(false));

  // Fetch categories
  const { categories, isLoading: categoriesLoading } = useGetGCCategories();

  // Fetch products when currency is selected (matching bills/gift-card page)
  const { products, isLoading: productsLoading } = useGetGCProductsByCurrency({
    currency: selectedCurrency,
  });

  // Filter products by category (matching bills/gift-card page)
  const filteredProducts = products?.filter(
    (p) => p.category.name === selectedCategory
  ) || [];

  // Calculate amount: price.amount * quantity (matching bills/gift-card page)
  const totalAmount = selectedPrice && Number(quantity) > 0 
    ? selectedPrice.amount * Number(quantity) 
    : 0;

  // Fetch redeem codes
  const { response: redeemCodeResponse, refetch: fetchRedeemCodes, isLoading: redeemLoading } = useGetGCRedeemCode({
    transactionId: transactionId || 0,
  });

  const canProceed = !!selectedCurrency && !!selectedCategory && !!product && !!selectedPrice && Number(quantity) > 0;

  const handleClose = () => {
    setStep("form");
    setCurrencyOpen(false);
    setCategoryOpen(false);
    setProductOpen(false);
    setPriceOpen(false);
    setSelectedCurrency("");
    setSelectedCategory("");
    setProduct(null);
    setPrices([]);
    setSelectedPrice(null);
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
    if (walletPin.length !== 4 || !product || !selectedPrice) return;
    // Use exact payment structure from bills/gift-card page
    payGiftCard({
      productId: Number(product.productId),
      currency: "NGN",
      walletPin,
      amount: totalAmount,
      unitPrice: selectedPrice.price,
      quantity: Number(quantity),
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
    } catch (error: any) {
      ErrorToast({
        title: "Failed to Retrieve Codes",
        descriptions: [error?.response?.data?.message || "Unable to fetch redeem codes. Please contact support."],
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
              {/* Currency - First (matching bills/gift-card page) */}
              <div className="flex flex-col gap-2" ref={currencyRef}>
                <label className="text-white/70 text-sm">Select Currency</label>
                <div onClick={() => setCurrencyOpen(!currencyOpen)} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between">
                  <span className={selectedCurrency ? "text-white" : "text-white/50"}>{selectedCurrency || "Select currency"}</span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
                </div>
                {currencyOpen && (
                  <div className="relative">
                    <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {allCurrencies.map((c: any, index: number) => (
                        <button
                          key={`${c.countryName}-${c.currency}-${index}`}
                          onClick={() => {
                            setSelectedCurrency(c.currency);
                            setSelectedCategory("");
                            setProduct(null);
                            setPrices([]);
                            setSelectedPrice(null);
                            setCurrencyOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/5 text-sm"
                        >
                          {c.countryName} - {c.currency}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Category - Only enabled when currency is selected */}
              {selectedCurrency && (
                <div className="flex flex-col gap-2" ref={categoryRef}>
                  <label className="text-white/70 text-sm">Gift Card Category</label>
                  <div onClick={() => setCategoryOpen(!categoryOpen)} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between">
                    <span className={selectedCategory ? "text-white" : "text-white/50"}>{selectedCategory || "Select category"}</span>
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
                            key={c.name}
                            onClick={() => {
                              setSelectedCategory(c.name);
                              setProduct(null);
                              setPrices([]);
                              setSelectedPrice(null);
                              setCategoryOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/5 text-sm"
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Product - Only enabled when currency and category are selected */}
              {selectedCurrency && selectedCategory && (
                <div className="flex flex-col gap-2" ref={productRef}>
                  <label className="text-white/70 text-sm">Gift Card Product</label>
                  <div onClick={() => selectedCurrency && selectedCategory && setProductOpen(!productOpen)} className={`w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between ${!selectedCurrency || !selectedCategory ? 'opacity-60 pointer-events-none' : ''}`}>
                    {!product ? (
                      <span className="text-white/50">Select product</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {product.logoUrls?.[0] && (
                          <Image
                            src={product.logoUrls[0]}
                            alt={`${product.productName} logo`}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full"
                            unoptimized
                          />
                        )}
                        <span className="text-white">{product.productName}</span>
                      </div>
                    )}
                    <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${productOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {productOpen && (
                    <div className="relative">
                      <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {productsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <SpinnerLoader width={20} height={20} color="#D4B139" />
                          </div>
                        ) : filteredProducts.length > 0 ? (
                          filteredProducts.map((p: any) => (
                            <button
                              key={p.productId}
                              onClick={() => {
                                setProduct(p);
                                setPrices(processGiftCardPrices(p));
                                setSelectedPrice(null);
                                setProductOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-white hover:bg-white/5 text-sm flex items-center gap-2"
                            >
                              {p.logoUrls?.[0] && (
                                <Image
                                  src={p.logoUrls[0]}
                                  alt={`${p.productName} logo`}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 rounded-full"
                                  unoptimized
                                />
                              )}
                              <span>{p.productName}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-white/50 text-sm">No products available</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity - Only enabled when product is selected */}
              {product && (
                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Quantity</label>
                  <input
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                    placeholder="Enter quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setQuantity(val);
                      // Reset price when quantity changes
                      if (val !== quantity) {
                        setSelectedPrice(null);
                      }
                    }}
                  />
                </div>
              )}

              {/* Price - Only enabled when product and quantity are selected (matching bills/gift-card page) */}
              {product && Number(quantity) > 0 && prices.length > 0 && (
                <div className="flex flex-col gap-2" ref={priceRef}>
                  <label className="text-white/70 text-sm">
                    Price {product.recipientCurrencyCode ? `in ${product.recipientCurrencyCode}` : ""}
                  </label>
                  <div onClick={() => setPriceOpen(!priceOpen)} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between">
                    {!selectedPrice ? (
                      <span className="text-white/50">Select gift card price</span>
                    ) : (
                      <span className="text-white">
                        {Number(selectedPrice.price).toLocaleString()} {product.recipientCurrencyCode || ""}
                      </span>
                    )}
                    <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {priceOpen && (
                    <div className="relative">
                      <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {prices.map((price, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedPrice(price);
                              setPriceOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-white/5 text-sm"
                          >
                            {price.price} {product.recipientCurrencyCode || ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Amount Display - Matching bills/gift-card page */}
              {selectedPrice && Number(quantity) > 0 && (
                <div className="flex flex-col gap-2 p-4 bg-bg-2400/50 dark:bg-bg-2100/50 rounded-lg">
                  {selectedPrice.fee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Fee</span>
                      <span className="text-white text-sm font-medium">₦{selectedPrice.fee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border-600">
                    <span className="text-white font-medium">Paying</span>
                    <span className="text-[#D4B139] text-lg font-bold">₦{Number(totalAmount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <CustomButton
                type="button"
                disabled={!canProceed}
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
                {product && (
                  <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Product</span><span className="text-white text-sm font-medium">{product.productName}</span></div>
                )}
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Quantity</span><span className="text-white text-sm font-medium">{quantity}</span></div>
                {selectedPrice && (
                  <>
                    <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Unit Price</span><span className="text-white text-sm font-medium">{selectedPrice.price} {product?.recipientCurrencyCode || ""}</span></div>
                    {selectedPrice.fee > 0 && (
                      <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Fee</span><span className="text-white text-sm font-medium">₦{selectedPrice.fee.toLocaleString()}</span></div>
                    )}
                  </>
                )}
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Total Amount</span><span className="text-white text-sm font-medium">₦{Number(totalAmount).toLocaleString()}</span></div>
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
              <span className="text-white text-2xl font-bold">₦{Number(totalAmount).toLocaleString()}.00</span>
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






