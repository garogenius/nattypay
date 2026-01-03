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
          {/* Illustration - Account Type Selection */}
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Choose Account Type</h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            Select the account type that best fits your needs - personal or business. Get started with the right account for you.
          </p>
        </div>
      </div>

      {/* Right Panel - White Background */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo - NattyPay Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src={images.singleLogo}
              alt="NattyPay Logo"
              width={120}
              height={60}
              className="w-24 sm:w-28 md:w-32 h-auto object-contain"
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
              <span>Licenced by CBN</span>
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
