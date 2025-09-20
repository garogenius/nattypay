'use client';

import Navbar from "@/components/home/Navbar";
import RootProtectionProvider from "@/providers/RootProtectionProvider";
import { usePathname } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";

const hideNavbarPaths = [
  '/account-type',
  '/signup',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/two-factor-auth',
  '/validate-phoneNumber',
  '/verify-email',
  '/verify-phoneNumber',
  '/verify-reset-email'
];

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <RootProtectionProvider>
      <div className="relative flex flex-col min-h-screen h-full bg-bg-600 dark:bg-black">
        {/* Mobile Logo - shown on auth pages */}
        <div className="absolute top-6 left-6 z-50 lg:hidden">
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

        <div className="flex flex-1">{children}</div>
      </div>
    </RootProtectionProvider>
  );
}
