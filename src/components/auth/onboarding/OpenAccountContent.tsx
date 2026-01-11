"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";
import BvnInfoModal from "@/components/modals/BvnInfoModal";
import BvnFaceCaptureModal from "@/components/modals/BvnFaceCaptureModal";
import SessionExpiredModal from "@/components/modals/SessionExpiredModal";
import VerificationErrorModal from "@/components/modals/VerificationErrorModal";
import { FiInfo } from "react-icons/fi";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { useVerifyNin } from "@/api/user/user.queries";
import {
  useInitiateBvnVerification,
  useValidateBvnVerification,
  useBvnFaceVerification,
} from "@/api/wallet/wallet.queries";
import useUserStore from "@/store/user.store";
import OtpInput from "react-otp-input";
import useTimerStore from "@/store/timer.store";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";
import { isTokenExpired } from "@/utils/tokenChecker";
import images from "../../../../public/images";

const schema = yup.object().shape({
  verificationType: yup.string().required("Please select BVN or NIN"),
  bvn: yup.string().when("verificationType", {
    is: "BVN",
    then: (schema) => schema.required("BVN is required").length(11, "BVN must be 11 digits"),
    otherwise: (schema) => schema.optional(),
  }),
  nin: yup.string().when("verificationType", {
    is: "NIN",
    then: (schema) => schema.required("NIN is required"),
    otherwise: (schema) => schema.optional(),
  }),
});

type OpenAccountFormData = yup.InferType<typeof schema>;

type VerificationStep = "enter-details" | "verify-otp";
type BvnVerificationMethod = "face" | "otp";

const OpenAccountContent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const [showBvnInfo, setShowBvnInfo] = useState(false);
  const [showFaceCaptureModal, setShowFaceCaptureModal] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [showVerificationErrorModal, setShowVerificationErrorModal] = useState(false);
  const [verificationError, setVerificationError] = useState<{
    title: string;
    descriptions: string[];
    type?: "BVN" | "NIN";
  } | null>(null);
  const [verificationStep, setVerificationStep] = useState<VerificationStep>("enter-details");
  const [bvnVerificationMethod, setBvnVerificationMethod] = useState<BvnVerificationMethod>("face"); // Default to face
  const [bvnDetails, setBvnDetails] = useState<{ bvn: string; verificationId: string }>({
    bvn: "",
    verificationId: "",
  });
  const [otp, setOtp] = useState("");
  const [selfieImage, setSelfieImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OpenAccountFormData>({
    defaultValues: {
      verificationType: "BVN",
      bvn: "",
      nin: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const verificationType = watch("verificationType");

  // NIN Verification
  const onNinError = async (error: any) => {
    setIsSubmitting(false);
    const errorMessage = error?.response?.data?.message;
    const statusCode = error?.response?.status;
    let descriptions: string[] = [];
    
    if (Array.isArray(errorMessage)) {
      descriptions = errorMessage;
    } else if (errorMessage) {
      descriptions = [errorMessage];
    } else {
      descriptions = ["Failed to verify NIN. Please check your NIN and try again."];
    }

    // Check if error is JWT expired (401)
    if (statusCode === 401) {
      const errorText = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : '';
      const isJwtExpired = errorText.includes('jwt expired') || 
                          errorText.includes('token expired') ||
                          errorText.includes('unauthorized');
      
      if (isJwtExpired) {
        // Token expired - try to refresh user data to get a new token
        try {
          await queryClient.invalidateQueries({ queryKey: ["user"] });
          await queryClient.refetchQueries({ queryKey: ["user"] });
          
          // Check if we got a new token
          const newToken = Cookies.get("accessToken");
          if (newToken && !isTokenExpired(newToken)) {
            // Token refreshed successfully - show message and let user retry
            setVerificationError({
              title: "Session Refreshed",
              descriptions: [
                "Your session has been refreshed. Please try verifying your NIN again.",
              ],
              type: "NIN",
            });
            setShowVerificationErrorModal(true);
            return;
          }
        } catch (refreshError) {
          console.warn("Failed to refresh user data:", refreshError);
        }
        
        // If refresh didn't work, show session expired modal
        setShowSessionExpiredModal(true);
        return;
      }
    }

    // Check if error is about incomplete registration/verification
    const errorText = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : '';
    const isRegistrationError = errorText.includes('complete your registration') || 
                                errorText.includes('complete registration') ||
                                errorText.includes('verification first') ||
                                errorText.includes('verify first');

    if (isRegistrationError) {
      // Provide more helpful guidance
      setVerificationError({
        title: "Verification Required",
        descriptions: [
          "Please ensure you have completed all previous verification steps:",
          "1. Email or Phone Number verification",
          "2. Two-Factor Authentication (2FA)",
          "If you've completed these steps, please try refreshing the page and try again."
        ],
        type: "NIN",
      });
    } else {
      setVerificationError({
        title: "NIN Verification Failed",
        descriptions,
        type: "NIN",
      });
    }
    setShowVerificationErrorModal(true);
  };

  const onNinSuccess = async (data: any) => {
    setIsSubmitting(false);
    
    // Update user data to reflect NIN verification
    const updatedUser = data?.data?.user;
    if (updatedUser) {
      const { setUser } = useUserStore.getState();
      setUser(updatedUser);
    }
    
    // Refresh user data to ensure latest verification status
    try {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.refetchQueries({ queryKey: ["user"] });
    } catch (error) {
      console.warn("Failed to refresh user data after NIN verification:", error);
    }
    
    SuccessToast({
      title: "NIN Verified Successfully!",
      description: data?.data?.message || "Your NIN has been verified successfully.",
    });
    
    // Navigate to transaction pin page
    navigate("/transaction-pin");
  };

  const { mutate: verifyNin, isPending: ninPending } = useVerifyNin(onNinError, onNinSuccess);

  // BVN Initiate
  const onBvnInitiateError = (error: any) => {
    setIsSubmitting(false);
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to initiate BVN verification. Please check your BVN and try again."];

    setVerificationError({
      title: "BVN Verification Failed",
      descriptions,
      type: "BVN",
    });
    setShowVerificationErrorModal(true);
  };

  const onBvnInitiateSuccess = (data: any) => {
    setIsSubmitting(false);
    SuccessToast({
      title: "Verification Code Sent",
      description: data?.data?.message || "Please check your phone for the verification code.",
    });
    setBvnDetails({
      bvn: data?.data?.data?.bvn || form.getValues("bvn"),
      verificationId: data?.data?.data?.verificationId || "",
    });
    setVerificationStep("verify-otp");
    useTimerStore.getState().setTimer(120);
  };

  const {
    mutate: initiateBvn,
    isPending: bvnInitiatePending,
  } = useInitiateBvnVerification(onBvnInitiateError, onBvnInitiateSuccess);

  // BVN Validate
  const onBvnValidateError = (error: any) => {
    setIsSubmitting(false);
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to validate BVN verification. Please try again."];

    setVerificationError({
      title: "BVN Verification Failed",
      descriptions,
      type: "BVN",
    });
    setShowVerificationErrorModal(true);
  };

  const onBvnValidateSuccess = (data: any) => {
    setIsSubmitting(false);
    SuccessToast({
      title: "BVN Verified Successfully!",
      description: "Your BVN has been verified successfully.",
    });
    navigate("/transaction-pin");
  };

  const {
    mutate: validateBvn,
    isPending: bvnValidatePending,
  } = useValidateBvnVerification(onBvnValidateError, onBvnValidateSuccess);

  // BVN Face Verification
  const onBvnFaceError = (error: any) => {
    setIsSubmitting(false);
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Face verification failed. Please ensure your face is clearly visible and try again."];

    setVerificationError({
      title: "Face Verification Failed",
      descriptions,
      type: "BVN",
    });
    setShowVerificationErrorModal(true);
    
    // Close face capture modal on error
    setShowFaceCaptureModal(false);
    setSelfieImage("");
  };

  const onBvnFaceSuccess = (data: any) => {
    setIsSubmitting(false);
    // Close the face capture modal
    setShowFaceCaptureModal(false);
    setSelfieImage("");
    
    SuccessToast({
      title: "BVN Verified Successfully!",
      description: data?.data?.message || "Your BVN and face have been verified successfully.",
    });
    
    // Navigate to transaction pin page after a short delay
    setTimeout(() => {
      navigate("/transaction-pin");
    }, 1000);
  };

  const {
    mutate: verifyBvnFace,
    isPending: bvnFacePending,
  } = useBvnFaceVerification(onBvnFaceError, onBvnFaceSuccess);

  const handleBvnFaceVerification = () => {
    if (!bvnDetails.bvn || !selfieImage) {
      ErrorToast({
        title: "Missing Information",
        descriptions: ["Please capture your selfie image first"],
      });
      return;
    }
    verifyBvnFace({
      bvn: bvnDetails.bvn,
      selfieImage: selfieImage,
    });
  };

  const handleFaceCapture = (image: string) => {
    setSelfieImage(image);
    // Verify BVN with captured image
    handleBvnFaceVerification();
  };

  const handleInfoClick = () => {
    setShowBvnInfo(true);
  };

  const onSubmit = async (data: OpenAccountFormData) => {
    setIsSubmitting(true);
    
    // First, try to refresh user data to get the latest token and user info
    // This is important during onboarding as the token might have just been set
    try {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.refetchQueries({ queryKey: ["user"] });
    } catch (error) {
      console.warn("Failed to refresh user data:", error);
    }
    
    // Check if user is authenticated - check both token and user store
    const token = Cookies.get("accessToken");
    const currentUser = useUserStore.getState().user;
    
    // If no token, check if user exists in store (might be in onboarding flow)
    if (!token) {
      // If user exists in store, they've completed some verification steps
      // Try to proceed anyway - the API will handle authentication
      if (!currentUser) {
        setIsSubmitting(false);
        ErrorToast({
          title: "Authentication Required",
          descriptions: [
            "Please complete your registration and verification first.",
            "Make sure you have verified your email or phone number before proceeding."
          ],
        });
        return;
      }
      // If user exists but no token, continue - might be a timing issue
      // The API call will handle the authentication error
    }

    // Validate token format
    if (!token) {
      setIsSubmitting(false);
      ErrorToast({
        title: "Authentication Required",
        descriptions: [
          "Please complete your registration and verification first.",
          "Make sure you have verified your email or phone number before proceeding."
        ],
      });
      return;
    }

    const tokenParts = token.trim().split(".");
    if (tokenParts.length !== 3) {
      setIsSubmitting(false);
      ErrorToast({
        title: "Invalid Token",
        descriptions: ["Your session token is invalid. Please complete verification again."],
      });
      // Don't remove token or redirect - let user retry verification
      // The axios interceptor will handle redirects for non-auth pages
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      setIsSubmitting(false);
      // Try to refresh user data which might get a new token
      try {
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        await queryClient.refetchQueries({ queryKey: ["user"] });
        
        // Check if we got a new token
        const newToken = Cookies.get("accessToken");
        if (newToken && !isTokenExpired(newToken)) {
          // Token refreshed successfully - continue with verification
          // Don't show modal, just proceed
        } else {
          // Token still expired - show modal
          setShowSessionExpiredModal(true);
        }
      } catch (error) {
        console.warn("Failed to refresh user data:", error);
        setShowSessionExpiredModal(true);
      }
      return;
    }

    if (data.verificationType === "NIN") {
      // Direct NIN verification
      if (!data.nin) {
        setIsSubmitting(false);
        ErrorToast({
          title: "Validation Error",
          descriptions: ["NIN is required"],
        });
        return;
      }

      // Get updated user from store (already refreshed above)
      const updatedUser = useUserStore.getState().user;
      
      // Check if user has completed email or phone verification
      // Backend requires this before NIN verification
      if (updatedUser && !updatedUser.isEmailVerified && !updatedUser.isPhoneVerified) {
        setIsSubmitting(false);
        ErrorToast({
          title: "Verification Required",
          descriptions: [
            "Please complete your email or phone number verification first before verifying your NIN.",
            "The backend requires contact verification before NIN verification can proceed."
          ],
        });
        return;
      }

      // Proceed with NIN verification
      verifyNin({ nin: data.nin });
    } else {
      // BVN: Check verification method
      if (!data.bvn) {
        setIsSubmitting(false);
        ErrorToast({
          title: "Validation Error",
          descriptions: ["BVN is required"],
        });
        return;
      }

      setBvnDetails({ bvn: data.bvn, verificationId: "" });

      if (bvnVerificationMethod === "face") {
        // Face verification flow - open face capture modal
        console.log("Opening face capture modal for BVN:", data.bvn);
        setShowFaceCaptureModal(true);
        setIsSubmitting(false);
      } else {
        // OTP verification flow - initiate OTP
        initiateBvn({ bvn: data.bvn });
      }
    }
  };

  const handleOtpVerify = () => {
    if (bvnDetails.bvn && bvnDetails.verificationId && otp.length === 6) {
      validateBvn({
        verificationId: bvnDetails.verificationId,
        otpCode: otp,
        isBusiness: user?.isBusiness || false,
      });
    }
  };

  const handleResendOtp = () => {
    const timerStore = useTimerStore.getState();
    if (timerStore.resendTimer === 0 && bvnDetails.bvn) {
      initiateBvn({ bvn: bvnDetails.bvn });
    }
  };

  const timerStore = useTimerStore();
  const resendTimer = timerStore.resendTimer;
  const decrementTimer = timerStore.decrementTimer;
  const expireAt = timerStore.expireAt;

  // Refresh user data on mount to ensure we have the latest token
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        await queryClient.refetchQueries({ queryKey: ["user"] });
      } catch (error) {
        console.warn("Failed to refresh user data on mount:", error);
      }
    };
    
    // Small delay to ensure cookies are set after navigation
    const timer = setTimeout(() => {
      refreshUserData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [queryClient]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (resendTimer > 0) {
      interval = setInterval(() => {
        if (decrementTimer) decrementTimer();
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
      timerStore.clearTimer();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer, decrementTimer, timerStore]);

  useEffect(() => {
    if (expireAt && Date.now() >= expireAt) {
      timerStore.clearTimer();
    }
  }, [expireAt, timerStore]);

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePaste: React.ClipboardEventHandler = (event) => {
    const data = event.clipboardData.getData("text").slice(0, 6);
    setOtp(data);
  };

  const isLoading = isSubmitting || ninPending || bvnInitiatePending || bvnValidatePending || bvnFacePending;

  return (
    <>
      <div className="relative flex h-full min-h-screen w-full overflow-hidden">
        {/* Left Panel - Yellow/Gold Background */}
        <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
            {/* Verification Icon */}
            <div className="w-full max-w-md mb-8 flex items-center justify-center">
              <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-48 h-48 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {verificationStep === "enter-details" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {verificationStep === "enter-details" ? "Account Verification" : "Verify BVN"}
            </h1>
            <p className="text-lg text-white/90 text-center max-w-md">
              {verificationStep === "enter-details"
                ? "Verify your identity with BVN or NIN to unlock all features and secure your account"
                : "Enter the verification code sent to your phone number to complete your account setup"}
            </p>
          </div>
        </div>

        {/* Right Panel - Light Gray Background with Form */}
        <div className="w-full lg:w-[60%] bg-gray-100 flex flex-col items-center justify-center px-6 sm:px-8 py-12">
          <div className="w-full max-w-md">
            {/* Form Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              {verificationStep === "enter-details" ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    Open Account
                  </h2>
                  <p className="text-sm text-gray-600 mb-6 text-center">
                    Verify your identity using BVN or NIN to open your account.
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Verification Type Selection */}
                    <div>
                      <p className="text-sm text-gray-700 mb-4">I want to open account with</p>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="BVN"
                            {...register("verificationType")}
                            className="w-5 h-5 text-[#D4B139] border-gray-300 focus:ring-[#D4B139]"
                          />
                          <span className="text-gray-900">BVN</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="NIN"
                            {...register("verificationType")}
                            className="w-5 h-5 text-[#D4B139] border-gray-300 focus:ring-[#D4B139]"
                          />
                          <span className="text-gray-900">NIN</span>
                        </label>
                      </div>
                    </div>

                    {/* BVN or NIN Input */}
                    {verificationType === "BVN" ? (
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-gray-700">Your BVN</label>
                          <input
                            type="text"
                            placeholder="Enter your 11-digit BVN"
                            maxLength={11}
                            className="w-full border border-gray-300 rounded-lg py-3 px-4 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent bg-transparent"
                            style={{ color: "#141414", WebkitTextFillColor: "#141414" }}
                            {...register("bvn")}
                          />
                          {errors.bvn && (
                            <p className="text-red-500 text-xs mt-1">{errors.bvn.message}</p>
                          )}
                          <button
                            type="button"
                            onClick={handleInfoClick}
                            className="flex items-center gap-2 text-sm text-gray-600 mt-2"
                          >
                            Why we need your BVN
                            <FiInfo className="w-4 h-4" />
                          </button>
                        </div>

                        {/* BVN Verification Method - Face is default, OTP as alternative */}
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-2">
                            Using face verification for quick and secure verification
                          </p>
                          <button
                            type="button"
                            onClick={() => setBvnVerificationMethod("otp")}
                            className="text-xs text-[#D4B139] hover:underline"
                          >
                            Prefer phone OTP instead?
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Your NIN</label>
                        <input
                          type="text"
                          placeholder="Enter your NIN"
                          className="w-full border border-gray-300 rounded-lg py-3 px-4 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent bg-transparent"
                          style={{ color: "#141414", WebkitTextFillColor: "#141414" }}
                          {...register("nin")}
                        />
                        {errors.nin && (
                          <p className="text-red-500 text-xs mt-1">{errors.nin.message}</p>
                        )}
                        <button
                          type="button"
                          onClick={handleInfoClick}
                          className="flex items-center gap-2 text-sm text-gray-600 mt-2"
                        >
                          Why we need your NIN
                          <FiInfo className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <CustomButton
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg"
                      >
                        Back
                      </CustomButton>
                      <CustomButton
                        type="submit"
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
                      >
                        {isLoading ? "Processing..." : "Proceed"}
                      </CustomButton>
                    </div>

                    {/* Instruction Text */}
                    <p className="text-xs text-gray-600 text-center">
                      To check your {verificationType === "BVN" ? "BVN" : "NIN"}, dial 5650# using
                      the phone number linked to your bank account.
                    </p>
                  </form>
                </>
              ) : verificationStep === "verify-otp" ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify BVN</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Enter the 6-digit verification code sent to the phone number linked to your BVN
                  </p>

                  <div className="space-y-6">
                    {/* OTP Input */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-center">
                        <OtpInput
                          value={otp}
                          onChange={setOtp}
                          onPaste={handlePaste}
                          numInputs={6}
                          renderSeparator={<span className="w-2"></span>}
                          containerStyle={{}}
                          skipDefaultStyles
                          inputType="number"
                          renderInput={(props) => (
                            <input
                              {...props}
                              className="w-12 h-12 bg-transparent border-b-2 border-gray-300 text-center text-xl font-medium outline-none focus:border-[#D4B139] text-[#141414]"
                              style={{ color: "#141414", WebkitTextFillColor: "#141414" }}
                            />
                          )}
                        />
                      </div>

                      {/* Resend Text */}
                      <p className="text-center text-sm text-gray-600">
                        {resendTimer && resendTimer > 0 ? (
                          <>
                            Didn't receive the code?{" "}
                            <span className="text-[#D4B139]">Resend</span> in{" "}
                            <span className="text-[#D4B139]">{formatTimer(resendTimer)}</span>
                          </>
                        ) : (
                          <>
                            Didn't receive the code?{" "}
                            <span
                              className="text-[#D4B139] cursor-pointer hover:underline"
                              onClick={handleResendOtp}
                            >
                              Resend
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <CustomButton
                        type="button"
                        onClick={() => {
                          setVerificationStep("enter-details");
                          setOtp("");
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg"
                      >
                        Back
                      </CustomButton>
                      <CustomButton
                        type="button"
                        disabled={otp.length !== 6 || bvnValidatePending}
                        isLoading={bvnValidatePending}
                        onClick={handleOtpVerify}
                        className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
                      >
                        Verify
                      </CustomButton>
                    </div>
                  </div>
                </>
              ) : null}

              {/* Footer */}
              <div className="text-center text-[9px] xs:text-xs text-gray-500 mt-8 px-2">
                <p className="flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 flex-nowrap whitespace-nowrap">
                  <span>Licenced by CBN</span>
                  <Image
                    src={images.cbnLogo}
                    alt="CBN Logo"
                    width={40}
                    height={20}
                    className="h-3 xs:h-4 sm:h-5 w-auto object-contain"
                  />
                  <span>Deposits Insured by</span>
                  <span className="text-blue-600 underline">NDIC</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BvnInfoModal
        isOpen={showBvnInfo}
        onClose={() => setShowBvnInfo(false)}
        onProceed={() => {
          setShowBvnInfo(false);
        }}
      />
      <BvnFaceCaptureModal
        isOpen={showFaceCaptureModal}
        onClose={() => {
          setShowFaceCaptureModal(false);
          setSelfieImage("");
        }}
        onCapture={handleFaceCapture}
        bvn={bvnDetails.bvn}
        isVerifying={bvnFacePending}
      />
      <SessionExpiredModal
        isOpen={showSessionExpiredModal}
        onClose={() => setShowSessionExpiredModal(false)}
        onLogin={() => {
          setShowSessionExpiredModal(false);
          // Clear session data
          if (typeof window !== "undefined") {
            sessionStorage.clear();
            Cookies.remove("accessToken");
          }
          navigate("/login", "replace");
        }}
      />
      <VerificationErrorModal
        isOpen={showVerificationErrorModal}
        onClose={() => {
          setShowVerificationErrorModal(false);
          setVerificationError(null);
        }}
        onRetry={() => {
          setShowVerificationErrorModal(false);
          setVerificationError(null);
          // Reset form to allow retry
          form.reset();
        }}
        title={verificationError?.title || "Verification Failed"}
        descriptions={verificationError?.descriptions || ["An error occurred during verification."]}
        verificationType={verificationError?.type}
      />
    </>
  );
};

export default OpenAccountContent;
