"use client";

import CustomButton from "@/components/shared/Button";
import { FaCheckCircle } from "react-icons/fa";

interface ProfileSetupSuccessModalProps {
  isOpen: boolean;
  onProceed: () => void;
}

const ProfileSetupSuccessModal: React.FC<ProfileSetupSuccessModalProps> = ({
  isOpen,
  onProceed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 z-10 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FaCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Profile Setup Successfully</h2>
          <p className="text-gray-700 text-sm mb-6">
            We're almost there! To keep your account secure, set up a passcode that will be used to
            authorize transactions.
          </p>
          <CustomButton
            onClick={onProceed}
            className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
          >
            Yes, Proceed
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupSuccessModal;






