"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import cn from "classnames";
import type { ReactNode } from "react";

const Tab = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
  <Link
    href={href}
    className={cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
      active
        ? "bg-secondary/20 text-secondary border border-secondary"
        : "bg-white/10 text-white/85 hover:bg-white/15 border border-white/10"
    )}
  >
    {label}
  </Link>
);

type HeaderProps = {
  right?: ReactNode;
};

export default function DeveloperHeader({ right }: HeaderProps) {
  const pathname = usePathname();
  const isDocs = pathname?.includes("/developer/api-documentation");
  const isRef = pathname?.includes("/developer/api-reference");

  return (
    <header className="w-full flex justify-center bg-gradient-to-r from-black via-black to-primary text-white">
      <div className="w-[92%] md:w-[86%] xl:w-[75%] py-6 md:py-10">
        {/* Top bar: Logo left, Sign Up right */}
        <div className="flex items-center justify-between mb-8">
          {/* Logo and Company Name */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/images/logo.svg"
              alt="NattyPay Logo"
              className="h-12 w-auto"
            />
            <span className="text-xl font-bold text-white"></span>
          </Link>
          {/* Sign Up button aligned right */}
          <Link
            href="/account-type"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Sign Up
          </Link>
        </div>
        
        <div className="flex items-start justify-between gap-4">
          {/* Left copy */}
          <div className="flex-1 flex flex-col gap-4">
            <span className="text-xs md:text-sm tracking-[0.2em] text-secondary font-semibold">
              DEVELOPERS
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
              Build with NattyPay APIs
            </h1>
            {/* <p className="text-white/80 max-w-2xl">
              Explore endpoints, authentication and examples. Switch between docs and reference using the tabs below.
            </p> */}
            <div className="flex items-center gap-2 pt-1">
              <Tab href="/developer/api-documentation" label="Documentation" active={!!isDocs} />
              <Tab href="/developer/api-reference" label="API Reference" active={!!isRef} />
            </div>
          </div>

          {/* Right actions (desktop) */}
          {right ? (
            <div className="hidden md:flex items-start gap-2">{right}</div>
          ) : null}
        </div>

        {/* Right actions (mobile stacked) */}
        {right ? <div className="md:hidden mt-4 flex flex-wrap gap-2">{right}</div> : null}
      </div>
    </header>
  );
}
