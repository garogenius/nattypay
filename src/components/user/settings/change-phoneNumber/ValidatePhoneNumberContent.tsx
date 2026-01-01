/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import Image from "next/image";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useNavigate from "@/hooks/useNavigate";
import { useUpdateUser } from "@/api/user/user.queries";
import images from "../../../../../public/images";
import AuthInput from "@/components/auth/AuthInput";
import useUserStore from "@/store/user.store";

const schema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^\+?\d{7,15}$/, "Phone number must be between 7 and 15 digits"),
});

type UpdatePhoneNumberFormData = yup.InferType<typeof schema>;

const ValidatePhoneNumberContent = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();

  const form = useForm<UpdatePhoneNumberFormData>({
    defaultValues: {
      phoneNumber: user?.phoneNumber || "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isValid } = formState;

  const onError = async (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to update phone number"];

    ErrorToast({
      title: "Update Failed",
      descriptions,
    });
  };

  const onSuccess = () => {
    SuccessToast({
      title: "Phone Number Updated!",
      description: "Your phone number has been updated successfully",
    });

    // Navigate back to settings
    navigate("/user/settings");
  };

  const {
    mutate: updateUser,
    isPending: updatePending,
  } = useUpdateUser(onError, onSuccess);

  const onSubmit = async (data: UpdatePhoneNumberFormData) => {
    if (!user) {
      ErrorToast({
        title: "Error",
        descriptions: ["User not found"],
      });
      return;
    }

    // Create a clean FormData - only send phoneNumber when updating phone number
    // Backend validation rejects passport fields and requires fullName to be non-empty if sent
    // So we only send phoneNumber to avoid validation errors
    const formData = new FormData();
    
    // Only append phoneNumber - explicitly exclude all other fields
    formData.append("phoneNumber", data.phoneNumber.trim());

    // Debug: Log what we're sending (remove in production if needed)
    // console.log("FormData entries:", Array.from(formData.entries()));

    updateUser(formData);
  };

  return (
    <div className="relative flex justify-center items-center w-full bg-bg-400 dark:bg-black">
      <div className="flex flex-col justify-center items-center w-full gap-8  my-12 sm:my-14 lg:my-16 xl:my-20">
        <motion.div
          whileInView={{ opacity: [0, 1] }}
          transition={{ duration: 0.5, type: "tween" }}
          className="z-10 flex flex-col justify-start items-start w-full xs:w-[90%] md:w-[80%] lg:w-[55%] bg-transparent xs:bg-bg-600 xs:dark:bg-bg-1100 dark:xs:border dark:border-border-600 rounded-2xl px-6 2xs:px-8 sm:px-10 py-2.5 2xs:py-4 sm:py-6 gap-6 2xs:gap-8 sm:gap-10 md:gap-12"
        >
          <div className="text-white flex flex-col items-center justify-center w-full text-center">
            <Image
              className="w-20 2xs:w-24 xs:w-28 "
              src={images.singleLogo}
              alt="logo"
              onClick={() => {
                navigate("/");
              }}
            />{" "}
            <h2 className="text-xl xs:text-2xl lg:text-3xl text-text-200 dark:text-white font-semibold">
              Update Phone Number{" "}
            </h2>
          </div>
          <form
            className="flex flex-col justify-start items-start w-full gap-7"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <AuthInput
              id="phoneNumber"
              label="Phone Number"
              type="tel"
              htmlFor="phoneNumber"
              placeholder="Enter your phone number (e.g., +2348012345678)"
              error={errors.phoneNumber?.message}
              {...register("phoneNumber")}
            />

            <CustomButton
              type="submit"
              disabled={!isValid || updatePending}
              isLoading={updatePending}
              className="mb-4  w-full  border-2 border-primary text-black text-base 2xs:text-lg max-2xs:px-6 py-3.5 xs:py-4"
            >
              Save Phone Number{" "}
            </CustomButton>
          </form>
        </motion.div>
      </div>
      <div
        className=" absolute bottom-0 left-0 inset-[60rem] opacity-60"
        style={{
          background: `
                radial-gradient(
                  circle at bottom left,
                  rgba(212, 177, 57, 0.4) 0%,
                  rgba(212, 177, 57, 0.2) 40%,
                  rgba(212, 177, 57, 0.1) 60%,
                  rgba(212, 177, 57, 0) 80%
                )
              `,
          filter: "blur(60px)",
          transform: "scale(1.1)",
        }}
      />
    </div>
  );
};

export default ValidatePhoneNumberContent;
