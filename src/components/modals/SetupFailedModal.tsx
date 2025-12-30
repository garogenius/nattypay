"use client";

import CustomButton from "@/components/shared/Button";

interface SetupFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onCancel: () => void;
}

const SetupFailedModal: React.FC<SetupFailedModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 z-10 shadow-xl">
        <h2 className="text-xl font-bold text-red-600 mb-4">Setup Failed</h2>
        <p className="text-gray-700 text-sm mb-6">
          Your facial scan was unsuccessful. Would you like to retry the process now?
        </p>
        <div className="flex flex-col gap-3">
          <CustomButton
            onClick={onRetry}
            className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
          >
            Yes, Proceed
          </CustomButton>
          <CustomButton
            onClick={onCancel}
            className="w-full bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg"
          >
            No, Cancel
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default SetupFailedModal;






