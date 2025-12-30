"use client";

import React, { useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { useTier3Verification } from "@/api/user/user.queries";
import CustomButton from "@/components/shared/Button";
import useUserStore from "@/store/user.store";

// Schema definition
const schema = yup.object().shape({
  state: yup.string().required("State is required"),
  city: yup.string().required("City is required"),
  address: yup.string().required("Address is required"),
});

type FormData = yup.InferType<typeof schema>;

interface Tier3UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tier3UpgradeModal: React.FC<Tier3UpgradeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useUserStore();

  const form = useForm<FormData>({
    defaultValues: {
      state: "",
      city: "",
      address: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState, reset } = form;
  const { errors, isValid } = formState;

  const onSuccess = () => {
    SuccessToast({
      title: "Upgraded successfully",
      description: "Successfully upgraded to tier three",
    });
    reset();
    onClose();
  };

  const onError = (error: any) => {
    const errorMessage =
      (error as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message ?? "Something went wrong";

    ErrorToast({
      title: "Error verifying location",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
  };

  const {
    mutate: verify,
    isPending: verifyPending,
    isError: verifyError,
  } = useTier3Verification(onError, onSuccess);

  const onSubmit = async (data: FormData) => {
    try {
      verify({
        state: data.state,
        city: data.city,
        address: data.address,
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
    if (user && (user.tierLevel === "one" || user.tierLevel === "three")) {
      if (user.tierLevel === "three") {
        ErrorToast({
          title: "Error",
          descriptions: ["You have already upgraded to tier three"],
        });
      } else {
        ErrorToast({
          title: "Error",
          descriptions: ["Please upgrade to tier two first"],
        });
      }
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
          Upgrade to Tier 3
        </h2>
        <p className="text-white/70 text-sm mb-4">
          Input your state, city and address to verify your location
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              className="text-white/70 text-sm font-medium"
              htmlFor="state"
            >
              State
            </label>
            <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3">
              <input
                id="state"
                className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50 placeholder:text-sm"
                placeholder="Enter State"
                type="text"
                {...register("state")}
              />
            </div>
            {errors.state && (
              <p className="text-red-500 font-semibold text-xs mt-0.5">
                {errors.state.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-white/70 text-sm font-medium"
              htmlFor="city"
            >
              City
            </label>
            <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3">
              <input
                id="city"
                className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50 placeholder:text-sm"
                placeholder="Enter City"
                type="text"
                {...register("city")}
              />
            </div>
            {errors.city && (
              <p className="text-red-500 font-semibold text-xs mt-0.5">
                {errors.city.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-white/70 text-sm font-medium"
              htmlFor="address"
            >
              Address
            </label>
            <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3">
              <input
                id="address"
                className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50 placeholder:text-sm"
                placeholder="Enter Address"
                type="text"
                {...register("address")}
              />
            </div>
            {errors.address && (
              <p className="text-red-500 font-semibold text-xs mt-0.5">
                {errors.address.message}
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

export default Tier3UpgradeModal;

