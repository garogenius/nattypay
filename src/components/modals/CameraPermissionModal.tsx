"use client";

import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { useState, useEffect } from "react";
import ErrorToast from "@/components/toast/ErrorToast";

interface CameraPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const CameraPermissionModal: React.FC<CameraPermissionModalProps> = ({
  isOpen,
  onClose,
  onProceed,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach((track) => track.stop());
      setIsRequesting(false);
      onProceed();
    } catch (error: any) {
      setIsRequesting(false);
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        ErrorToast({
          title: "Permission Denied",
          descriptions: [
            "Camera permission was denied. Please enable camera access in your browser settings and try again.",
          ],
        });
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        ErrorToast({
          title: "No Camera Found",
          descriptions: ["No camera device found on your device. Please connect a camera and try again."],
        });
      } else {
        ErrorToast({
          title: "Camera Error",
          descriptions: ["Unable to access camera. Please check your device settings."],
        });
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsRequesting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 z-10 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full"
        >
          <CgClose className="text-xl text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-4 pr-8">Camera Permission</h2>
        <p className="text-gray-700 text-sm mb-6">
          We need access to your camera to capture your face for account security. This helps us verify your identity and protect your account.
        </p>
        <div className="flex gap-3">
          <CustomButton
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg"
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="button"
            onClick={handleRequestPermission}
            disabled={isRequesting}
            isLoading={isRequesting}
            className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
          >
            {isRequesting ? "Requesting..." : "Allow Camera Access"}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default CameraPermissionModal;



