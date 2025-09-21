import AccountTypeDescription from "@/components/auth/accountType/AccountTypeDescription";
import AccountTypeSelector from "@/components/auth/accountType/AccountTypeSelector";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const AccountTypePage = () => {
  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden bg-black">
      {/* Mobile Logo */}
      <div className="absolute top-6 left-6 z-50 lg:hidden">
        <Link href="/">
          {/* <Image
            src="/images/logo.svg"
            alt="NattyPay Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          /> */}
        </Link>
      </div>

      {/* Left side - Image with overlay */}
      <div className="hidden lg:block lg:w-3/5 relative">
        {/* Desktop Logo at top-left */}
        <div className="absolute top-6 left-6 z-50 hidden lg:block">
          <Link href="/">
            <Image
              src="/images/logo.svg"
              alt="NattyPay Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>
        <AccountTypeDescription />
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col items-center justify-center bg-black p-6 sm:p-8 lg:w-2/5 lg:overflow-y-auto">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Choose Account Type
            </h1>
            <p className="mt-2 text-gray-300">
              Are you creating a business or personal account?
            </p>
          </div>

          <div className="mt-8">
            <AccountTypeSelector />
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/90">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountTypePage;
