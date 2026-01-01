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
          {/* Logo - Globe with NATTY text */}
          <div className="flex justify-center mb-8">
            <div className="relative flex items-center justify-center">
              {/* Globe Icon with grid */}
              <div className="relative w-20 h-20">
                <svg
                  className="w-full h-full text-[#D4B139]"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Globe circle */}
                  <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  {/* Horizontal grid lines */}
                  <line x1="10" y1="30" x2="110" y2="30" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="45" x2="110" y2="45" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="75" x2="110" y2="75" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="90" x2="110" y2="90" stroke="currentColor" strokeWidth="1.5" />
                  {/* Vertical grid lines */}
                  <line x1="25" y1="10" x2="25" y2="110" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="40" y1="10" x2="40" y2="110" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="60" y1="10" x2="60" y2="110" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="80" y1="10" x2="80" y2="110" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="95" y1="10" x2="95" y2="110" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {/* NATTY text overlay - centered horizontally */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#D4B139] tracking-wide">NATTY</span>
                </div>
              </div>
            </div>
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
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
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






