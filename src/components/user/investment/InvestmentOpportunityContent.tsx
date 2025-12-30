"use client";

import React, { useState } from "react";
import { IoChevronBack, IoCheckmarkCircle, IoShieldCheckmark, IoDocumentText, IoTime } from "react-icons/io5";
import { FiArrowRight, FiDollarSign, FiLock, FiUsers, FiTarget, FiBarChart2, FiTrendingUp } from "react-icons/fi";
import { MdOutlineSecurity, MdOutlineAccountBalance } from "react-icons/md";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";
import InvestmentModal from "@/components/modals/finance/InvestmentModal";

const InvestmentOpportunityContent: React.FC = () => {
  const navigate = useNavigate();
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);

  const investmentIllustration = {
    principal: 100000000,
    roi: 15,
    tenure: 12,
    returns: 15000000,
    total: 115000000,
  };

  const growthPoints = [
    {
      title: "Massive Market Size",
      description: "Nigeria has over 200 million people, yet more than 40 million adults remain underbanked or financially excluded, presenting an untapped market for smart, tech-enabled financial services.",
      stats: "₦89 trillion in commercial banking assets (2024), growing 8–10% annually",
    },
    {
      title: "Rise of Digital Banking",
      description: "Fintech and digital banking adoption is accelerating across Africa. Nigeria leads the continent with over 150 million mobile connections and a young, tech-savvy population.",
      stats: "Technology-first bank with edge in acquisition, onboarding, and servicing",
    },
    {
      title: "Government and Regulatory Support",
      description: "The Security and Exchange Commission (SEC) would be fully involved in this investment plan and make it fully secured for investors.",
      stats: "Full SEC compliance and regulatory backing",
    },
  ];

  const futureOutlook = [
    {
      period: "Year 1–2",
      items: [
        "Obtain provisional license from CBN",
        "Launch with 3–5 core digital banking products",
        "Acquire 200,000+ customers through targeted digital marketing",
        "Build strategic alliances with telcos, fintechs, cooperatives",
      ],
    },
    {
      period: "Year 3–5",
      items: [
        "Expand to 1 million+ active users",
        "Introduce SME banking, diaspora banking, and investment products",
        "Break even and begin paying dividends to investors",
        "Deploy proprietary lending algorithm for faster microloans",
        "Develop agency banking networks in rural areas",
      ],
    },
    {
      period: "Year 6–10",
      items: [
        "Apply for national banking license",
        "Enter other West African markets",
        "Introduce blockchain-based financial products",
        "Prepare for listing on the Nigerian Stock Exchange",
        "Position Natty Pay among Nigeria's top 10 digital banks",
      ],
    },
  ];

  const revenueStreams = [
    "Retail and corporate banking",
    "Digital wallets and mobile banking",
    "Treasury operations",
    "Lending products and asset management",
    "Merchant payments and bill collections",
  ];

  const whyInvestPoints = [
    {
      icon: <FiUsers className="text-2xl" />,
      title: "Experienced Team",
      description: "NattyPay is led by financial, legal, and tech professionals with a proven track record.",
    },
    {
      icon: <MdOutlineSecurity className="text-2xl" />,
      title: "Regulatory Compliance",
      description: "We are following all required SEC protocols for Investment registration and operations.",
    },
    {
      icon: <IoShieldCheckmark className="text-2xl" />,
      title: "Capital Protection",
      description: "Your capital is secured and protected under a formal agreement.",
    },
    {
      icon: <FiTrendingUp className="text-2xl" />,
      title: "Guaranteed Returns",
      description: "Enjoy fixed profit with zero volatility or exposure to market swings.",
    },
    {
      icon: <FiLock className="text-2xl" />,
      title: "Exclusive Window",
      description: "This opportunity is only available at the pre-launch stage.",
    },
  ];

  const nextSteps = [
    {
      step: 1,
      title: "Expression of Interest (EOI)",
      description: "Submit a letter or email confirming your interest.",
    },
    {
      step: 2,
      title: "Due Diligence",
      description: "You will receive our Investment Agreement and supporting documents for review.",
    },
    {
      step: 3,
      title: "Capital Transfer",
      description: "Make your investment into the designated escrow account under strict legal and financial supervision.",
    },
    {
      step: 4,
      title: "Acknowledgment",
      description: "Receive formal confirmation, receipt, and schedule of expected return.",
    },
    {
      step: 5,
      title: "Payout",
      description: "After 12 months, receive your capital plus 15% ROI in a single payment.",
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Back Button */}
      <div
        onClick={() => navigate("/user/dashboard")}
        className="flex items-center gap-2 cursor-pointer text-text-200 dark:text-text-400"
      >
        <IoChevronBack className="text-2xl" />
        <p className="text-lg font-medium">Back</p>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#D4B139]/20 via-[#D4B139]/10 to-transparent border border-[#D4B139]/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Investment Opportunity</h1>
            <p className="text-white/80 text-lg">Join NattyPay's Strategic Capitalization Plan</p>
          </div>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-3xl">
            Natty Pay is a proposed Financial Institution in Nigeria, structured to deliver innovative, technology-driven financial solutions with a focus on speed, security, and seamless service delivery. As part of our strategic rollout and capitalization plan, we are opening a limited private investment window for forward-thinking investors.
          </p>
        </div>
      </div>

      {/* Investment Model Card */}
      <div className="bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#D4B139]/20 flex items-center justify-center">
            <FiDollarSign className="text-2xl text-[#D4B139]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Investment Model</h2>
        </div>
        <p className="text-white/70 mb-6">
          NattyPay is offering a fixed-return investment opportunity, designed to deliver predictable profits while minimizing risk.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Minimum Investment</p>
            <p className="text-white text-xl font-bold">₦50,000,000</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Tenure</p>
            <p className="text-white text-xl font-bold">12 Months</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Return on Investment</p>
            <p className="text-[#D4B139] text-xl font-bold">15% Flat</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Capital Guarantee</p>
            <p className="text-green-400 text-xl font-bold">100% Guaranteed</p>
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <IoDocumentText className="text-blue-400 text-xl mt-1" />
            <div>
              <p className="text-blue-400 text-sm font-semibold mb-1">Legal Documentation</p>
              <p className="text-white/80 text-sm">
                Each investor will receive a duly executed Investment Agreement prepared by a Legal Practitioner, outlining the terms, timelines, and protection clauses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Illustration */}
      <div className="bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <FiBarChart2 className="text-2xl text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Investment Illustration</h2>
        </div>
        <div className="bg-white/10 rounded-xl p-6 mb-4">
          <p className="text-white/70 text-sm mb-4">If you invest:</p>
          <p className="text-white text-3xl font-bold mb-6">₦{investmentIllustration.principal.toLocaleString()}</p>
          <div className="flex items-center gap-2 mb-4">
            <IoTime className="text-white/70" />
            <p className="text-white/70 text-sm">After {investmentIllustration.tenure} months, you receive:</p>
          </div>
          <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4">
            <p className="text-green-400 text-3xl font-bold">₦{investmentIllustration.total.toLocaleString()}</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-white/80">
                <span>Original Capital</span>
                <span>₦{investmentIllustration.principal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>15% Return (Profit)</span>
                <span className="font-semibold">₦{investmentIllustration.returns.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-white/60 text-sm">Investors may choose to invest larger amounts in multiples of ₦100 million.</p>
      </div>

      {/* Why Invest Section */}
      <div className="bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#D4B139]/20 flex items-center justify-center">
            <IoCheckmarkCircle className="text-2xl text-[#D4B139]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Why Invest in NattyPay?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {whyInvestPoints.map((point, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
              <div className="text-[#D4B139] mb-3">{point.icon}</div>
              <h3 className="text-white font-semibold mb-2">{point.title}</h3>
              <p className="text-white/70 text-sm">{point.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Potential */}
      <div className="bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <FiTrendingUp className="text-2xl text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Growth Potential</h2>
        </div>
        <p className="text-white/70 mb-6">
          NattyPay is strategically positioned to thrive in Nigeria's rapidly evolving financial sector. With a growing demand for digital-first banking and a largely underbanked population, the financial institution industry presents immense potential for long-term profitability and market penetration.
        </p>
        <div className="space-y-4">
          {growthPoints.map((point, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-white font-semibold text-lg mb-2">{point.title}</h3>
              <p className="text-white/70 text-sm mb-3">{point.description}</p>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-400 text-xs font-medium">{point.stats}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Streams */}
        <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <MdOutlineAccountBalance className="text-[#D4B139]" />
            Scalable Revenue Streams
          </h3>
          <p className="text-white/70 text-sm mb-3">Natty Pay will generate income across multiple channels:</p>
          <ul className="space-y-2">
            {revenueStreams.map((stream, idx) => (
              <li key={idx} className="flex items-start gap-2 text-white/80 text-sm">
                <IoCheckmarkCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>{stream}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Investor Returns Beyond Fixed ROI */}
        <div className="mt-6 bg-gradient-to-br from-[#D4B139]/20 to-transparent border border-[#D4B139]/30 rounded-xl p-5">
          <h3 className="text-white font-semibold text-lg mb-3">Investor Returns Beyond Fixed ROI</h3>
          <p className="text-white/70 text-sm mb-3">
            While the current offer provides a guaranteed 15% return, long-term investors may be offered equity or convertible note options as the investment scales. Early partners could benefit from:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-white/80 text-sm">
              <IoCheckmarkCircle className="text-[#D4B139] mt-0.5 flex-shrink-0" />
              <span>Equity buy-in at discounted valuations</span>
            </li>
            <li className="flex items-start gap-2 text-white/80 text-sm">
              <IoCheckmarkCircle className="text-[#D4B139] mt-0.5 flex-shrink-0" />
              <span>Board-level participation</span>
            </li>
            <li className="flex items-start gap-2 text-white/80 text-sm">
              <IoCheckmarkCircle className="text-[#D4B139] mt-0.5 flex-shrink-0" />
              <span>Preferred investor status in future fundraising rounds</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Future Outlook */}
      <div className="bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <FiTarget className="text-2xl text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Future Outlook</h2>
        </div>
        <div className="space-y-6">
          {futureOutlook.map((outlook, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-white font-bold text-lg mb-4">{outlook.period}</h3>
              <ul className="space-y-2">
                {outlook.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2 text-white/80 text-sm">
                    <IoCheckmarkCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-gradient-to-br from-[#D4B139]/20 to-transparent border border-[#D4B139]/30 rounded-xl p-5 text-center">
          <p className="text-white text-lg font-semibold">
            NattyPay is not just building a Financial Institution — we are building a financial ecosystem that empowers every Nigerian to dream, save, invest, and grow.
          </p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#D4B139]/20 flex items-center justify-center">
            <FiArrowRight className="text-2xl text-[#D4B139]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Next Steps for Investors</h2>
        </div>
        <div className="space-y-4">
          {nextSteps.map((step, idx) => (
            <div key={idx} className="flex gap-4 bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="w-10 h-10 rounded-full bg-[#D4B139] flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold">{step.step}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                <p className="text-white/70 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal & Administrative Support */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <MdOutlineSecurity className="text-2xl text-blue-400" />
          <h2 className="text-xl font-bold text-white">Legal & Administrative Support</h2>
        </div>
        <p className="text-white/80 text-sm">
          This investment plan and all investor engagements are backed by Legal Documents and a supervision of a lawyer, ensuring transparency, contract enforcement, and dispute protection.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <IoDocumentText className="text-2xl text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Disclaimer</h2>
        </div>
        <p className="text-white/80 text-sm">
          This is a private investment offer, not a public solicitation. It is strictly limited to eligible investors who understand the terms of engagement. All terms are subject to final legal agreement.
        </p>
      </div>

      {/* CTA Button */}
      <div className="sticky bottom-0 bg-bg-600 dark:bg-bg-1100 border-t border-white/10 p-4 -mx-4 sm:-mx-6">
        <CustomButton
          onClick={() => setIsInvestmentModalOpen(true)}
          className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-semibold py-4 rounded-lg text-lg flex items-center justify-center gap-2"
        >
          <FiDollarSign />
          <span>Express Interest to Invest</span>
          <FiArrowRight />
        </CustomButton>
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={isInvestmentModalOpen}
        onClose={() => setIsInvestmentModalOpen(false)}
      />
    </div>
  );
};

export default InvestmentOpportunityContent;

