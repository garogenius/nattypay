"use client";

import React, { useMemo, useState, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { useGetGCRedeemCode } from "@/api/gift-card/gift-card.queries";
import {
  handleNumericPaste,
  handleNumericKeyDown,
} from "@/utils/utilityFunctions";
import ErrorToast from "@/components/toast/ErrorToast";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

interface RedeemGiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RedeemGiftCardModal: React.FC<RedeemGiftCardModalProps> = ({ isOpen, onClose }) => {
  const [success, setSuccess] = useState(false);
  
  const schema = useMemo(
    () =>
      yup.object().shape({
        transactionId: yup.string().required("Transaction ID is required"),
      }),
    []
  );

  type FormData = yup.InferType<typeof schema>;

  const form = useForm<FormData>({
    defaultValues: {
      transactionId: "",
    },
    resolver: yupResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { register, handleSubmit, formState, watch, reset } = form;
  const { errors } = formState;

  const { response, isLoading, isError, refetch, error, isSuccess } =
    useGetGCRedeemCode({
      transactionId: Number(watch("transactionId")),
    });

  const loading = isLoading && !isError;

  const onSubmit = async () => {
    refetch();
  };

  useEffect(() => {
    if (isSuccess) {
      setSuccess(true);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error && (error as any).response) {
      ErrorToast({
        title: "Error during gift card redemption",
        descriptions: [(error as any).response.data?.message],
      });
    }
  }, [error]);

  const handleClose = () => {
    setSuccess(false);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
        </div>
        <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-visible">
          <div className="flex items-center justify-between p-4 pb-2">
            <div>
              <h2 className="text-white text-lg font-semibold">Redeem Gift Card</h2>
              <p className="text-white/60 text-sm">Your gift card codes</p>
            </div>
            <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
              <CgClose className="text-xl text-white/70" />
            </button>
          </div>
          <div className="px-4 pb-4">
            <div className="flex flex-col gap-6">
              {response && response.length > 0 ? (
                response.map((item, index) => (
                  <div key={index} className="bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg p-4">
                    <p className="text-white font-semibold mb-3">Gift Card {index + 1}</p>
                    {item.cardNumber && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70 text-sm">Card Number:</span>
                        <span className="text-white text-sm font-medium font-mono">{item.cardNumber}</span>
                      </div>
                    )}
                    {item.pinCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">Pin Code:</span>
                        <span className="text-white text-sm font-medium font-mono">{item.pinCode}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-white/70 text-sm">No codes found</div>
              )}

              <CustomButton
                type="button"
                onClick={() => {
                  setSuccess(false);
                  reset();
                }}
                className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg"
              >
                Continue
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-visible">
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            <h2 className="text-white text-lg font-semibold">Redeem Gift Card</h2>
            <p className="text-white/60 text-sm">Enter transaction ID to retrieve codes</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>
        <div className="px-4 pb-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm">Transaction ID</label>
              <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/60 placeholder:text-sm"
                  placeholder="Enter transaction ID"
                  required={true}
                  type="text"
                  {...register("transactionId", {
                    valueAsNumber: true,
                  })}
                  onKeyDown={handleNumericKeyDown}
                  onPaste={handleNumericPaste}
                />
              </div>
              {errors?.transactionId?.message && (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.transactionId?.message}
                </p>
              )}
            </div>

            <CustomButton
              type="submit"
              isLoading={loading}
              className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg"
            >
              Redeem
            </CustomButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RedeemGiftCardModal;


