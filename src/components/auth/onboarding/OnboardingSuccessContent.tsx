"use client";

import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";
import { FaCheckCircle } from "react-icons/fa";

const OnboardingSuccessContent = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden bg-gray-900">
      <div className="w-full flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl">
            <div className="flex flex-col items-center text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <FaCheckCircle className="w-12 h-12 text-white" />
              </div>

              {/* Success Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Congratulations! You've successfully created your account
              </h2>

              {/* Action Button */}
              <CustomButton
                onClick={() => navigate("/user/dashboard")}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-white font-medium py-3.5 rounded-lg mt-6"
              >
                Go to Dashboard
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSuccessContent;






