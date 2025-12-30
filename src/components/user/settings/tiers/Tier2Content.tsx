/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { useTier2Verification } from "@/api/user/user.queries";
import CustomButton from "@/components/shared/Button";
import { IoChevronBack } from "react-icons/io5";
import { FaCamera, FaUpload, FaTimes } from "react-icons/fa";
import useNavigate from "@/hooks/useNavigate";
import {
  handleNumericKeyDown,
  handleNumericPaste,
} from "@/utils/utilityFunctions";
import React, { useState, useRef, useEffect } from "react";
import useUserStore from "@/store/user.store";
import Image from "next/image";

// Schema definition
const schema = yup.object().shape({
  nin: yup.string().required("NIN is required"),
  // selfieImage: yup.string().required("Selfie is required"),
});

type FormData = yup.InferType<typeof schema>;

interface SelfieCaptureProps {
  onImageCapture: (base64Image: string) => void;
  error?: string;
}

// Selfie Capture Component
export const SelfieCaptureComponent: React.FC<SelfieCaptureProps> = ({
  onImageCapture,
  error,
}) => {
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);

  // const startCamera = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: {
  //         facingMode: "user",
  //         width: { ideal: 1280 },
  //         height: { ideal: 720 },
  //       },
  //     });
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream;
  //       streamRef.current = stream;
  //       setShowCamera(true);

  //       // Wait for video to be ready
  //       videoRef.current.onloadedmetadata = () => {
  //         setIsCameraReady(true);
  //       };
  //     }
  //   } catch (err) {
  //     console.error("Error accessing camera:", err);
  //     ErrorToast({
  //       title: "Camera Error",
  //       descriptions: ["Unable to access camera. Please check permissions."],
  //     });
  //   }
  // };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setIsCameraReady(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Flip horizontally for mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);

        const base64Image = canvas.toDataURL("image/png");
        setPreviewUrl(base64Image);
        onImageCapture(base64Image);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onImageCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {showCamera ? (
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Camera View Container */}
          <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ transform: "scaleX(-1)" }} // Mirror effect
              className="absolute top-0 left-0 w-full h-full object-contain"
            />

            {/* Camera Controls Overlay */}
            {isCameraReady && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg"
                >
                  <FaCamera className="text-lg" />
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <FaTimes className="text-lg" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {!isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="text-white">Initializing camera...</div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full">
          <div className="flex flex-wrap gap-4 mb-4">
            {/* <button
              type="button"
              onClick={startCamera}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FaCamera className="text-lg" />
              Open Camera
            </button> */}
            <label className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
              <FaUpload className="text-lg" />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {previewUrl && (
            <div className="mt-4 max-w-2xl mx-auto">
              <div className="relative flex w-full pb-[56.25%] bg-black rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  className="absolute top-0 left-0 w-full h-full object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl("");
                  onImageCapture("");
                }}
                className="mt-4 text-red-500 hover:text-red-700 flex items-center gap-2 transition-colors"
              >
                <FaTimes /> Remove Photo
              </button>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

// Main Tier2 Content Component
const Tier2Content = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  // const [selfieBase64, setSelfieBase64] = useState<string>("");

  const form = useForm<FormData>({
    defaultValues: {
      nin: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isValid } = formState;

  const onSuccess = () => {
    SuccessToast({
      title: "Upgraded successfully",
      description: "Successfully upgraded to tier two",
    });
    form.reset();
    navigate("/user/settings/tiers", "replace");
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

  // const handleImageCapture = (base64Image: string) => {
  //   setSelfieBase64(base64Image);
  //   setValue("selfieImage", base64Image, {
  //     shouldValidate: true,
  //   });
  // };

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
    if (user && (user.tierLevel === "two" || user.tierLevel === "three")) {
      ErrorToast({
        title: "Error",
        descriptions: ["Unauthorized"],
      });
      navigate("/user/settings/tiers", "replace");
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col gap-2.5 xs:gap-4 py-4">
      <div
        onClick={() => navigate("/user/settings/tiers")}
        className="w-fit flex items-center gap-1 sm:gap-2 cursor-pointer text-text-200 dark:text-text-400"
      >
        <IoChevronBack className="text-xl sm:text-2xl" />
        <h2 className="text-lg sm:text-xl font-bold text-text-200 dark:text-text-400">
          Tier Two Verification
        </h2>
      </div>

      <div className="w-full h-full 2xs:bg-bg-600 2xs:dark:bg-bg-1100 py-4 md:py-8 px-1 2xs:px-5 lg:px-8 flex justify-center rounded-xl sm:rounded-2xl">
        <div className="flex flex-col justify-center items-center gap-6 xs:gap-10 w-full xl:w-[80%] 2xl:w-[70%] bg-transparent lg:bg-bg-400 dark:bg-transparent lg:dark:bg-black rounded-lg sm:rounded-xl p-0 2xs:p-4 md:p-8">
          <h2 className="w-full xs:w-[80%] text-center text-xl xs:text-2xl text-text-200 dark:text-text-400 ">
            Input your National Identity Number (NIN) to verify your identity
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-10 md:gap-12"
          >
            <div className="w-full grid grid-cols-1 gap-4 md:gap-6">
              {/* NIN Input */}
              <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                <label
                  className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                  htmlFor="nin"
                >
                  NIN
                </label>
                <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                  <input
                    id="nin"
                    className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                    placeholder="Enter NIN"
                    type="text"
                    {...register("nin")}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={handleNumericPaste}
                  />
                </div>
                {errors.nin && (
                  <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                    {errors.nin.message}
                  </p>
                )}
              </div>

              {/* Selfie Capture Component */}
              {/* <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-200 dark:text-text-800">
                  Face Verification{" "}
                </label>
                <SelfieCaptureComponent
                  onImageCapture={handleImageCapture}
                  error={errors.selfieImage?.message}
                />
              </div> */}
            </div>

            {/* Submit Button */}
            <div className="w-full flex">
              <CustomButton
                type="submit"
                disabled={!isValid || (verifyPending && !verifyError)}
                isLoading={verifyPending}
                className="w-full border-2 dark:text-black dark:font-bold border-primary text-white text-base 2xs:text-lg max-2xs:px-6 py-3"
              >
                Upgrade
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Tier2Content;
