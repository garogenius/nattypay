"use client";

import CustomButton from "@/components/shared/Button";
import { FaCheckCircle } from "react-icons/fa";

interface PasscodeChangedSuccessModalProps {
  isOpen: boolean;
  onLogin: () => void;
}

const PasscodeChangedSuccessModal: React.FC<PasscodeChangedSuccessModalProps> = ({
  isOpen,
  onLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 z-10 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <FaCheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Congratulations! You've successfully changed your new passcode
          </h2>
          <CustomButton
            onClick={onLogin}
            className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg mt-4"
          >
            Login
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default PasscodeChangedSuccessModal;






