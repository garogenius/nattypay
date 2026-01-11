'use client';

import Navbar from "@/components/home/Navbar";
import RootProtectionProvider from "@/providers/RootProtectionProvider";
import { usePathname } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import images from "../../../public/images";
import AuthThemeGuard from "@/components/auth/AuthThemeGuard";

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
      <AuthThemeGuard>
        <div className="relative flex flex-col min-h-screen h-full bg-[#F7F7F8]">
        {/* Mobile Logo - hidden on mobile responsive screens */}
        <div className="fixed top-6 left-6 z-[9999] hidden">
          <Link href="/">
            <Image
              src={images.logo2}
              alt="NattyPay Logo"
              width={120}
              height={40}
              className="h-10 w-auto cursor-pointer"
              priority
            />
          </Link>
        </div>

        <div className="flex flex-1">{children}</div>
        </div>
      </AuthThemeGuard>
    </RootProtectionProvider>
  );
}
