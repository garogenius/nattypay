"use client";

import Image from "next/image";
import Link from "next/link";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";
import images from "../../../../public/images";

const WelcomeContent = () => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate("/account-type");
  };

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
          {/* Illustration - Transfers illustration */}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Transfers</h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            Send and receive money locally or globally with ease and speed.
          </p>
        </div>
      </div>

      {/* Right Panel - White Background */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo - NattyPay Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src={images.logo2}
              alt="NattyPay Logo"
              className="w-24 h-12"
              priority
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to NattyPay</h2>
            <p className="text-gray-600">We make the best & easiest banking for you.</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <CustomButton
              type="button"
              onClick={handleCreateAccount}
              className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3.5 rounded-lg text-base"
            >
              Create New Account
            </CustomButton>
            <CustomButton
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-transparent border-2 border-[#D4B139] text-[#D4B139] hover:bg-[#D4B139]/5 font-medium py-3.5 rounded-lg text-base"
            >
              I have an account
            </CustomButton>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mt-8">
            <p className="flex items-center justify-center gap-2 flex-wrap">
              <span>Licenced by</span>
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
  );
};

export default WelcomeContent;






