"use client";

import CustomButton from "@/components/shared/Button";

interface VerifyingBiometricModalProps {
  isOpen: boolean;
  onCancel: () => void;
  biometricType: "fingerprint" | "face";
}

const VerifyingBiometricModal: React.FC<VerifyingBiometricModalProps> = ({
  isOpen,
  onCancel,
  biometricType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 z-10 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Verifying {biometricType === "fingerprint" ? "Fingerprint" : "FaceID"}
        </h2>
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 mb-4 flex items-center justify-center">
            {biometricType === "fingerprint" ? (
              <svg
                className="w-full h-full text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 103 0m-3-6V9m0 0a1.5 1.5 0 103 0m-3-3a1.5 1.5 0 103 0m0 3v6m0-6a1.5 1.5 0 103 0m0 0v3m0-3a1.5 1.5 0 103 0"
                />
              </svg>
            ) : (
              <svg
                className="w-full h-full text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          <p className="text-gray-700 text-sm text-center">
            Scan your {biometricType === "fingerprint" ? "fingerprint" : "face"}
          </p>
        </div>
        <CustomButton
          onClick={onCancel}
          className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
        >
          Cancel
        </CustomButton>
      </div>
    </div>
  );
};

export default VerifyingBiometricModal;

