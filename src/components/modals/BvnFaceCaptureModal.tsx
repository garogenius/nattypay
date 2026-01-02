"use client";

import React, { useState, useRef, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { FiCamera, FiUpload, FiX } from "react-icons/fi";
import CustomButton from "@/components/shared/Button";
import Image from "next/image";
import ErrorToast from "@/components/toast/ErrorToast";

interface BvnFaceCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
  bvn: string;
  isVerifying?: boolean;
}

const BvnFaceCaptureModal: React.FC<BvnFaceCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  bvn,
  isVerifying = false,
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [pendingStream, setPendingStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setIsCameraReady(false);
  };

  useEffect(() => {
    if (!isOpen) {
      // Cleanup when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (pendingStream) {
        pendingStream.getTracks().forEach((track) => track.stop());
        setPendingStream(null);
      }
      setPreviewUrl("");
      setCapturedImage("");
      setShowCamera(false);
      setCameraError("");
      setIsCameraReady(false);
    }
  }, [isOpen, pendingStream]);

  // Start camera stream when showCamera becomes true and video element is available
  useEffect(() => {
    if (showCamera && pendingStream) {
      // Use requestAnimationFrame to ensure video element is rendered
      requestAnimationFrame(() => {
        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = pendingStream;
          streamRef.current = pendingStream;
          setPendingStream(null);
          setIsCameraReady(false);

          // Wait for video metadata to load
          const handleLoadedMetadata = () => {
            console.log("Video metadata loaded");
            setIsCameraReady(true);
            // Ensure video plays
            video.play()
              .then(() => {
                console.log("Video playing successfully");
                setIsCameraReady(true);
              })
              .catch((err) => {
                console.error("Error playing video:", err);
                // Still show controls even if play fails
                setIsCameraReady(true);
              });
          };

          const handleCanPlay = () => {
            console.log("Video can play");
            setIsCameraReady(true);
          };

          const handleError = (e: Event) => {
            console.error("Video error:", e);
            setCameraError("Error loading video stream. Please try again.");
          };

          video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
          video.addEventListener("canplay", handleCanPlay, { once: true });
          video.addEventListener("error", handleError, { once: true });
          
          // Fallback: if metadata already loaded
          if (video.readyState >= video.HAVE_METADATA) {
            console.log("Video already has metadata");
            handleLoadedMetadata();
          }
        } else {
          console.error("Video ref not available after showCamera set to true");
          // Retry after a short delay
          setTimeout(() => {
            if (videoRef.current && pendingStream) {
              const video = videoRef.current;
              video.srcObject = pendingStream;
              streamRef.current = pendingStream;
              setPendingStream(null);
            }
          }, 100);
        }
      });
    }
  }, [showCamera, pendingStream]);

  const startCamera = async () => {
    try {
      console.log("Starting camera...");
      setCameraError("");
      setPreviewUrl("");
      setCapturedImage("");
      
      // Request camera permission first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      
      console.log("Camera permission granted, stream:", stream);
      
      // Set showCamera to true first, then useEffect will handle assigning stream to video
      setPendingStream(stream);
      setShowCamera(true);
      setIsCameraReady(false);
    } catch (err: any) {
      console.error("Camera error:", err);
      setShowCamera(false);
      setIsCameraReady(false);
      setPendingStream(null);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Please enable camera access in your browser settings.");
        ErrorToast({
          title: "Camera Permission Denied",
          descriptions: ["Please enable camera access in your browser settings and try again."],
        });
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera found on your device.");
        ErrorToast({
          title: "No Camera Found",
          descriptions: ["No camera device found. Please connect a camera and try again."],
        });
      } else {
        setCameraError("Unable to access camera. Please check your device settings.");
        ErrorToast({
          title: "Camera Error",
          descriptions: [err.message || "Unable to access camera. Please check permissions."],
        });
      }
    }
  };

  // Compress and resize image to reduce payload size
  const compressImage = (imageDataUrl: string, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.onload = () => {
        try {
          // Calculate new dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          // Create canvas with compressed dimensions
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageDataUrl;
    });
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (video && (video.readyState === video.HAVE_ENOUGH_DATA || video.readyState === video.HAVE_CURRENT_DATA || video.readyState === video.HAVE_FUTURE_DATA)) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const ctx = canvas.getContext("2d");
        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          // Flip horizontally for mirror effect
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Get initial base64 image
          const initialImage = canvas.toDataURL("image/jpeg", 0.9);
          
          // Compress the image
          const compressedImage = await compressImage(initialImage, 800, 600, 0.7);
          
          setPreviewUrl(compressedImage);
          setCapturedImage(compressedImage);
          stopCamera();
        } else {
          ErrorToast({
            title: "Capture Error",
            descriptions: ["Unable to capture photo. Please try again."],
          });
        }
      } catch (error) {
        console.error("Error capturing photo:", error);
        ErrorToast({
          title: "Capture Error",
          descriptions: ["Failed to capture photo. Please try again."],
        });
      }
    } else {
      ErrorToast({
        title: "Camera Not Ready",
        descriptions: ["Please wait for the camera to initialize."],
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        ErrorToast({
          title: "Invalid File Type",
          descriptions: ["Please upload a JPEG, PNG, or WebP image."],
        });
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB (we'll compress it anyway)
      if (file.size > maxSize) {
        ErrorToast({
          title: "File Too Large",
          descriptions: ["Please upload an image smaller than 5MB."],
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const result = reader.result as string;
          // Compress the uploaded image
          const compressedImage = await compressImage(result, 800, 600, 0.7);
          setPreviewUrl(compressedImage);
          setCapturedImage(compressedImage);
        } catch (error) {
          console.error("Error compressing image:", error);
          ErrorToast({
            title: "Image Processing Error",
            descriptions: ["Failed to process image. Please try again."],
          });
        }
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVerify = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    } else {
      ErrorToast({
        title: "No Image Captured",
        descriptions: ["Please capture or upload your selfie first."],
      });
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl("");
    setCapturedImage("");
  };

  if (!isOpen) {
    console.log("Modal not open, isOpen:", isOpen);
    return null;
  }

  console.log("Rendering BvnFaceCaptureModal, isOpen:", isOpen, "showCamera:", showCamera);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 z-10 shadow-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={isVerifying}
        >
          <CgClose className="text-lg sm:text-xl text-gray-600" />
        </button>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Capture Your Selfie</h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Take a clear selfie to verify your BVN ({bvn}). Make sure your face is well-lit and clearly visible.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {showCamera ? (
            <div className="relative w-full">
              <div className="relative w-full bg-black rounded-lg overflow-hidden min-h-[250px] sm:min-h-[400px]" style={{ aspectRatio: "16/9", position: "relative" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ 
                    transform: "scaleX(-1)",
                    zIndex: 1,
                    backgroundColor: "#000"
                  }}
                />
              {isCameraReady && (
                <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center gap-2 sm:gap-4 px-2 sm:px-4 z-20">
                  <CustomButton
                    type="button"
                    onClick={capturePhoto}
                    className="bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-2 sm:py-2.5 px-3 sm:px-6 rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-lg text-sm sm:text-base"
                  >
                    <FiCamera className="text-base sm:text-lg" />
                    <span className="hidden xs:inline">Capture Photo</span>
                    <span className="xs:hidden">Capture</span>
                  </CustomButton>
                  <CustomButton
                    type="button"
                    onClick={stopCamera}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 sm:py-2.5 px-3 sm:px-6 rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-lg text-sm sm:text-base"
                  >
                    <FiX className="text-base sm:text-lg" />
                    Cancel
                  </CustomButton>
                </div>
              )}
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-white">Initializing camera...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          ) : null}
          
          {!showCamera && previewUrl ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="relative w-full">
                <div className="relative w-full bg-black rounded-lg overflow-hidden min-h-[250px] sm:min-h-[400px]" style={{ aspectRatio: "16/9" }}>
                  <Image
                    src={previewUrl}
                    alt="Selfie preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm transition-colors"
                    disabled={isVerifying}
                  >
                    <FiX /> Remove Photo
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="text-[#D4B139] hover:text-[#c7a42f] flex items-center gap-2 text-sm transition-colors"
                    disabled={isVerifying}
                  >
                    <FiCamera /> Retake Photo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <CustomButton
                type="button"
                onClick={() => {
                  console.log("Opening camera...");
                  startCamera();
                }}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                disabled={isVerifying}
              >
                <FiCamera className="text-base sm:text-lg" />
                Open Camera
              </CustomButton>
              <label className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors text-sm sm:text-base">
                <FiUpload className="text-base sm:text-lg" />
                Upload Photo
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isVerifying}
                />
              </label>
            </div>
          )}

          {cameraError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{cameraError}</p>
            </div>
          )}

          <div className="flex gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
            <CustomButton
              type="button"
              onClick={() => {
                if (!isVerifying) {
                  if (showCamera) {
                    stopCamera();
                  } else {
                    onClose();
                  }
                }
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 sm:py-3 rounded-lg text-sm sm:text-base"
              disabled={isVerifying}
            >
              {showCamera ? "Back" : "Cancel"}
            </CustomButton>
            {capturedImage && !showCamera && (
              <CustomButton
                type="button"
                disabled={!capturedImage || isVerifying}
                isLoading={isVerifying}
                onClick={handleVerify}
                className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-2.5 sm:py-3 rounded-lg text-sm sm:text-base"
              >
                {isVerifying ? "Verifying..." : "Verify BVN"}
              </CustomButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BvnFaceCaptureModal;

