"use client";

import React, { useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { useTier2Verification } from "@/api/user/user.queries";
import CustomButton from "@/components/shared/Button";
import useUserStore from "@/store/user.store";
import {
  handleNumericKeyDown,
  handleNumericPaste,
} from "@/utils/utilityFunctions";

// Schema definition
const schema = yup.object().shape({
  nin: yup.string().required("NIN is required"),
});

type FormData = yup.InferType<typeof schema>;

interface Tier2UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tier2UpgradeModal: React.FC<Tier2UpgradeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useUserStore();

  const form = useForm<FormData>({
    defaultValues: {
      nin: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState, reset } = form;
  const { errors, isValid } = formState;

  const onSuccess = () => {
    SuccessToast({
      title: "Upgraded successfully",
      description: "Successfully upgraded to tier two",
    });
    reset();
    onClose();
    // Refresh the page after a short delay to ensure user data is updated
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const onError = (error: any) => {
    const errorMessage =
      (error as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message ?? "Something went wrong";

    ErrorToast({
      title: "Error verifying identity",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
  };

  const {
    mutate: verify,
    isPending: verifyPending,
    isError: verifyError,
  } = useTier2Verification(onError, onSuccess);

  const onSubmit = async (data: FormData) => {
    try {
      verify({
        nin: data.nin,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (user && (user.tierLevel === "two" || user.tierLevel === "three")) {
      ErrorToast({
        title: "Error",
        descriptions: ["You have already upgraded to this tier or higher"],
      });
      onClose();
    }
  }, [user, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-5 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full"
        >
          <CgClose className="text-xl text-white" />
        </button>
        <h2 className="text-white text-lg font-semibold mb-2">
          Upgrade to Tier 2
        </h2>
        <p className="text-white/70 text-sm mb-4">
          Input your National Identity Number (NIN) to verify your identity
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              className="text-white/70 text-sm font-medium"
              htmlFor="nin"
            >
              NIN
            </label>
            <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3">
              <input
                id="nin"
                className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50 placeholder:text-sm"
                placeholder="Enter NIN"
                type="text"
                {...register("nin")}
                onKeyDown={handleNumericKeyDown}
                onPaste={handleNumericPaste}
              />
            </div>
            {errors.nin && (
              <p className="text-red-500 font-semibold text-xs mt-0.5">
                {errors.nin.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <CustomButton
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-2.5"
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              disabled={!isValid || (verifyPending && !verifyError)}
              isLoading={verifyPending}
              className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5"
            >
              Upgrade
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Tier2UpgradeModal;

