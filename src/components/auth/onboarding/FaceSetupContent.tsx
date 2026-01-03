"use client";

import { useState, useRef, useEffect } from "react";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";
import { FiSun, FiUser, FiSmartphone, FiCamera, FiX } from "react-icons/fi";
import CameraPermissionModal from "@/components/modals/CameraPermissionModal";
import SetupFailedModal from "@/components/modals/SetupFailedModal";
import ProfileSetupSuccessModal from "@/components/modals/ProfileSetupSuccessModal";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { useUpdateUser } from "@/api/user/user.queries";
import useUserStore from "@/store/user.store";
import Image from "next/image";
import images from "../../../../public/images";

const FaceSetupContent = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [showCameraPermission, setShowCameraPermission] = useState(false);
  const [showSetupFailed, setShowSetupFailed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [cameraError, setCameraError] = useState<string>("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const instructions = [
    {
      icon: <FiSun className="w-5 h-5" />,
      text: "Make sure your face is clearly visible in good lighting",
    },
    {
      icon: <FiUser className="w-5 h-5" />,
      text: "Remove anything covering your face",
    },
    {
      icon: <FiUser className="w-5 h-5" />,
      text: "Stay still while your face is being scanned",
    },
    {
      icon: <FiSmartphone className="w-5 h-5" />,
      text: "Hold your phone at eye level and center your face",
    },
  ];

  // Check camera permission status
  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Permission granted, stop the stream immediately
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error: any) {
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        return false;
      }
      return false;
    }
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Front-facing camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
        setIsScanning(false);

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      setCameraError("Unable to access camera. Please check permissions.");
      ErrorToast({
        title: "Camera Error",
        descriptions: [
          error.name === "NotAllowedError" || error.name === "PermissionDeniedError"
            ? "Camera permission denied. Please enable camera access in your browser settings."
            : "Unable to access camera. Please check your device settings.",
        ],
      });
      setShowCamera(false);
      setIsCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setIsCameraReady(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const base64Image = canvas.toDataURL("image/jpeg", 0.9);
        setPreviewUrl(base64Image);
        setCapturedImage(base64Image);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        ErrorToast({
          title: "Invalid File Type",
          descriptions: ["Please upload a JPEG, PNG, or WebP image."],
        });
        return;
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        ErrorToast({
          title: "File Too Large",
          descriptions: ["Please upload an image smaller than 2MB."],
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setCapturedImage(result);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProceed = async () => {
    // Check if we already have a captured image
    if (capturedImage) {
      await uploadFaceImageToServer();
      return;
    }

    // Check camera permission first
    const hasPermission = await checkCameraPermission();
    if (hasPermission) {
      setShowCameraPermission(false);
      await startCamera();
    } else {
      setShowCameraPermission(true);
    }
  };

  const handleCameraPermissionGranted = async () => {
    setShowCameraPermission(false);
    await startCamera();
  };

  const handleRetry = () => {
    setShowSetupFailed(false);
    setCapturedImage("");
    setPreviewUrl("");
    setCameraError("");
    handleProceed();
  };

  const onUploadError = (error: any) => {
    setIsScanning(false);
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage || "Failed to upload face image"];

    ErrorToast({
      title: "Upload Failed",
      descriptions,
    });
    setShowSetupFailed(true);
  };

  const onUploadSuccess = (data: any) => {
    setIsScanning(false);
    SuccessToast({
      title: "Face Setup Complete!",
      description: "Your face has been successfully registered for account security.",
    });
    setShowSuccessModal(true);
  };

  const { mutate: uploadFaceImageMutation, isPending: uploadPending } = useUpdateUser(
    onUploadError,
    onUploadSuccess
  );

  const uploadFaceImageToServer = async () => {
    if (!capturedImage) {
      ErrorToast({
        title: "No Image",
        descriptions: ["Please capture or upload a face image first."],
      });
      return;
    }

    setIsScanning(true);

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      
      // Create a file from blob
      const file = new File([blob], "face-image.jpg", { type: "image/jpeg" });
      formData.append("profile-image", file);
      
      // Add other required fields from user
      if (user?.fullname) {
        formData.append("fullName", user.fullname);
      }
      if (user?.phoneNumber) {
        formData.append("phoneNumber", user.phoneNumber);
      }
      // Don't add dateOfBirth - it's not allowed in profile updates

      uploadFaceImageMutation(formData);
    } catch (error) {
      setIsScanning(false);
      ErrorToast({
        title: "Upload Error",
        descriptions: ["Failed to process image. Please try again."],
      });
    }
  };

  const handleSuccessProceed = () => {
    setShowSuccessModal(false);
    // Check if wallet PIN is already set
    if (user?.isWalletPinSet) {
      // PIN is already set - go to dashboard
      navigate("/user/dashboard", "replace");
    } else {
      // PIN is not set - navigate to transaction pin page
      navigate("/transaction-pin", "replace");
    }
  };

  const handleRetake = () => {
    setCapturedImage("");
    setPreviewUrl("");
    setCameraError("");
    stopCamera();
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const isUploading = uploadPending || isScanning;

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
          {/* Face Recognition Icon */}
          <div className="w-full max-w-md mb-8 flex items-center justify-center">
            <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-48 h-48 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Face Setup</h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            Set up facial recognition to secure your account and enable quick authentication
          </p>
        </div>
      </div>

      {/* Right Panel - Light Gray Background with Form */}
      <div className="w-full lg:w-[60%] bg-gray-100 flex flex-col items-center justify-center px-6 sm:px-8 py-12 relative">
        {/* Onboarding Indicator */}
        <div className="absolute top-6 left-6 text-sm text-gray-400">Onboarding</div>
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Face Setup</h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Set up facial recognition to secure your account.
            </p>

            {/* Camera View or Preview */}
            {showCamera ? (
              <div className="relative w-full mb-6">
                <div className="relative w-full pb-[75%] bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }} // Mirror effect
                  />
                  
                  {/* Face Guide Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-64 border-2 border-white/50 rounded-lg"></div>
                  </div>

                  {/* Camera Controls */}
                  {isCameraReady && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors"
                      >
                        <FiX className="text-lg" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="bg-[#D4B139] text-black px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#c7a42f] transition-colors shadow-lg"
                      >
                        <FiCamera className="text-xl" />
                        Capture
                      </button>
                    </div>
                  )}

                  {/* Loading Indicator */}
                  {!isCameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="text-white">Initializing camera...</div>
                    </div>
                  )}
                </div>
              </div>
            ) : previewUrl ? (
              <div className="relative w-full mb-6">
                <div className="relative w-full pb-[75%] bg-black rounded-lg overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Face preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <FiX className="text-sm" />
                  Retake
                </button>
              </div>
            ) : (
              <div className="flex justify-center mb-8">
                <div className="w-32 h-32 border-4 border-gray-400 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-6xl">😊</div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!showCamera && !previewUrl && (
              <div className="space-y-4 mb-8">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="text-gray-600 mt-0.5">{instruction.icon}</div>
                    <p className="text-sm text-gray-700 flex-1">{instruction.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {!showCamera && !previewUrl && (
                <>
                  <CustomButton
                    type="button"
                    onClick={handleProceed}
                    disabled={isUploading}
                    className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
                  >
                    Open Camera
                  </CustomButton>
                  <label className="w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <CustomButton
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-transparent border-2 border-[#D4B139] text-[#D4B139] hover:bg-[#D4B139]/5 font-medium py-3 rounded-lg"
                    >
                      Upload Photo Instead
                    </CustomButton>
                  </label>
                </>
              )}
              
              {previewUrl && !showCamera && (
                <CustomButton
                  type="button"
                  onClick={handleProceed}
                  disabled={isUploading}
                  isLoading={isUploading}
                  className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
                >
                  {isUploading ? "Uploading..." : "Save & Continue"}
                </CustomButton>
              )}

              {cameraError && (
                <p className="text-red-500 text-sm text-center mt-2">{cameraError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-8">
              <p className="flex items-center justify-center gap-2 flex-wrap">
                <span>Licenced by CBN</span>
                <Image
                  src={images.cbnLogo}
                  alt="CBN Logo"
                  width={40}
                  height={20}
                  className="h-5 w-auto object-contain"
                />
                <span>Deposits Insured by</span>
                <span className="text-blue-600 underline">NDIC</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CameraPermissionModal
        isOpen={showCameraPermission}
        onClose={() => setShowCameraPermission(false)}
        onProceed={handleCameraPermissionGranted}
      />
      <SetupFailedModal
        isOpen={showSetupFailed}
        onClose={() => {
          setShowSetupFailed(false);
          setIsScanning(false);
        }}
        onRetry={handleRetry}
        onCancel={() => {
          setShowSetupFailed(false);
          setIsScanning(false);
        }}
      />
      <ProfileSetupSuccessModal
        isOpen={showSuccessModal}
        onProceed={handleSuccessProceed}
      />
    </div>
  );
};

export default FaceSetupContent;
