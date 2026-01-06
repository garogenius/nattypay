"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiMail, FiPhone, FiAlertTriangle, FiChevronDown, FiChevronRight, FiMessageCircle } from "react-icons/fi";

const faqs = [
  {
    q: "How do I reset my password?",
    a:
      "Go to Settings → Security → Change Password, or tap 'Forgot Password' on the login screen and follow the instructions sent to your email or phone.",
  },
  {
    q: "What should I do if a transaction fails but I’m debited?",
    a:
      "Please wait a few minutes; most failed debits are auto-reversed. If it persists, contact support with the transaction reference.",
  },
  {
    q: "Can I have more than one account on NattyPay?",
    a:
      "No, each user can only have one verified account tied to their BVN and ID for security reasons.",
  },
  {
    q: "Can I schedule payments ahead of time?",
    a:
      "Yes, under Schedule Payments, you can set automatic airtime, bills, or transfers at specific dates or intervals.",
  },
  {
    q: "What if my transfer is delayed?",
    a:
      "Transfers may take a short time depending on network conditions. If it exceeds 30 minutes, reach out to support with the reference.",
  },
  {
    q: "How long does it take for support to respond?",
    a:
      "Email responses take 24–48 hours, while chat and phone support are usually instant during business hours.",
  },
];

const quickLinks = [
  { label: "Terms & Conditions", href: "/terms&condition" },
  { label: "Privacy Policy", href: "/privacyPolicy" },
  { label: "About NattyPay", href: "/about" },
];

const SupportContent: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="w-full flex flex-col gap-3">
        <div className="w-full flex items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-white text-xl sm:text-2xl font-semibold">Support Center</h1>
          <Link
            href="/user/support/live-chat"
            className="inline-flex items-center gap-2 rounded-lg bg-[#D4B139] hover:bg-[#c7a42f] text-black text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 h-9 sm:h-10 whitespace-nowrap shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4B139]/30"
          >
            <FiMessageCircle />
            <span>Start Live Chat</span>
          </Link>
        </div>
        <p className="text-white/60 text-sm">Get help, report issues, and find answers to your questions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
          <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-white mb-3">
            <FiMail />
          </div>
          <p className="text-white font-semibold">Email Support</p>
          <p className="text-white/70 text-sm mt-1">Reach our support team anytime via email for quick help and inquiries</p>
          <Link href="mailto:support@nattypay.com" className="inline-flex items-center gap-1.5 text-[#D4B139] font-semibold text-sm mt-3">
            <span>Send Email</span>
            <FiChevronRight />
          </Link>
        </div>
        <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
          <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-white mb-3">
            <FiPhone />
          </div>
          <p className="text-white font-semibold">Phone Support</p>
          <p className="text-white/70 text-sm mt-1">Speak directly with our support team for faster assistance</p>
          <Link href="tel:+2348134146906" className="inline-flex items-center gap-1.5 text-[#D4B139] font-semibold text-sm mt-3">
            <span>Call Now</span>
            <FiChevronRight />
          </Link>
        </div>
        <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
          <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-white mb-3">
            <FiAlertTriangle />
          </div>
          <p className="text-white font-semibold">Report Scam</p>
          <p className="text-white/70 text-sm mt-1">Report any suspicious activity or fraudulent transaction</p>
          <Link href="/user/support/report" className="inline-flex items-center gap-1.5 text-[#D4B139] font-semibold text-sm mt-3">
            <span>Report</span>
            <FiChevronRight />
          </Link>
        </div>
      </div>

      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold">Frequently Asked Questions</p>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {faqs.map((item, idx) => {
            const open = openIdx === idx;
            return (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenIdx(open ? null : idx)}
                  className="w-full flex items-center justify-between text-left px-3 sm:px-4 py-3 sm:py-3.5 text-white"
                >
                  <span className="text-sm sm:text-base">{item.q}</span>
                  <FiChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="px-3 sm:px-4 pb-3 text-white/80 text-sm">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
        <p className="text-white font-semibold mb-3">Quick Links</p>
        <div className="flex flex-col gap-1">
          {quickLinks.map((l, index) => (
            <Link
              key={l.href}
              href={l.href}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-3 rounded-xl hover:bg-white/5 active:bg-white/10 text-white/90 border border-transparent hover:border-white/10 transition-colors"
            >
              <span className="text-sm sm:text-base font-medium">{l.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4B139]" />
                <FiChevronRight className="text-[#D4B139] text-sm" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportContent;
