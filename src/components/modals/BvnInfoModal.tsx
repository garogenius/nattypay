"use client";

import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";

interface BvnInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const BvnInfoModal: React.FC<BvnInfoModalProps> = ({ isOpen, onClose, onProceed }) => {
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
        <p className="text-gray-900 text-base mb-6 pr-8">
          We need your BVN to confirm your identity and ensure your account is secure. Sharing your
          BVN does not give us access to your bank account or funds.
        </p>
        <CustomButton
          onClick={onProceed}
          className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
        >
          Proceed
        </CustomButton>
      </div>
    </div>
  );
};

export default BvnInfoModal;






