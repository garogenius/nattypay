import AccountTypeSelector from "@/components/auth/accountType/AccountTypeSelector";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import images from "../../../../public/images";

const AccountTypePage = () => {
  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
          {/* Illustration */}
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
          <h1 className="text-4xl font-bold text-white mb-4">Savings</h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            Set targets for your savings and get high interests when you meet your targets
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
              width={150}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Choose Account Type</h2>
            <p className="text-gray-600">Are you creating a business or personal account?</p>
          </div>

          {/* Account Type Selector */}
          <div className="mt-8">
            <AccountTypeSelector />
          </div>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#D4B139] hover:text-[#c7a42f]">
              Sign in
            </Link>
          </p>

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

export default AccountTypePage;
