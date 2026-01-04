"use client";

import React from "react";
import { CgOptions } from "react-icons/cg";
import useNavigate from "@/hooks/useNavigate";
import images from "../../../../public/images";
import Image from "next/image";
import PaymentTransferTab from "@/components/user/payments/PaymentTransferTab";
import PaymentSettingsModal from "@/components/modals/PaymentSettingsModal";
import TabGroup from "@/components/shared/TabGroup";
import PayBillsTab from "@/components/user/payments/PayBillsTab";
import SchedulePaymentsTab from "@/components/user/payments/SchedulePaymentsTab";
import usePaymentSettingsStore from "@/store/paymentSettings.store";
import QRCodeModal from "@/components/modals/QRCodeModal";
import { IoQrCodeOutline } from "react-icons/io5";

const PaymentsContent: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<"transfer" | "bills" | "schedule">("transfer");
  const [transferType, setTransferType] = React.useState<"nattypay" | "bank" | "merchant" | null>("nattypay");
  const [openSettings, setOpenSettings] = React.useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = React.useState(false);
  const { selectedCurrency } = usePaymentSettingsStore();

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 overflow-y-auto scroll-area scroll-smooth pr-1">
      <div className="w-full flex flex-col gap-3">
        <div className="w-full flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-white">Payments</h1>
            <span className="hidden sm:inline-block px-2 py-1 rounded-lg bg-white/10 text-white/80 text-xs font-medium border border-white/20">
              {selectedCurrency}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              className="flex items-center gap-1 sm:gap-2 rounded-xl border border-[#2C3947] px-2 sm:px-3 py-1.5 sm:py-2 text-white/80 hover:bg-white/5 transition-colors"
              onClick={() => setIsQRCodeOpen(true)}
            >
              <IoQrCodeOutline className="text-base sm:text-lg" />
              <span className="text-xs sm:text-sm">QR Code</span>
            </button>
            <button
              className="flex items-center gap-1 sm:gap-2 rounded-xl border border-[#2C3947] px-2 sm:px-3 py-1.5 sm:py-2 text-white/80 hover:bg-white/5 transition-colors"
              onClick={()=> setOpenSettings(true)}
            >
              <CgOptions className="text-base sm:text-lg" />
              <span className="text-xs sm:text-sm">Settings</span>
            </button>
          </div>
        </div>
        <p className="text-white/60 text-xs sm:text-sm">Pay bills securely, and manage scheduled payments easily</p>
      </div>

      {/* Top Tabs (Savings-style) */}
      <div className="w-full bg-white/10 rounded-full p-1.5 sm:p-2 grid grid-cols-3 gap-1.5 sm:gap-2">
        {[
          { key: "transfer", label: "Transfer" },
          { key: "bills", label: "Pay Bills" },
          { key: "schedule", label: "Schedule Payments" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`rounded-full py-1.5 sm:py-2 text-[11px] xs:text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center ${
              tab === (t.key as any) ? "bg-white/15 text-white" : "text-white/70 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "transfer" && <PaymentTransferTab transferType={transferType} setTransferType={setTransferType} />}

      <PaymentSettingsModal isOpen={openSettings} onClose={()=> setOpenSettings(false)} />

      <QRCodeModal 
        isOpen={isQRCodeOpen} 
        onClose={() => setIsQRCodeOpen(false)}
        onQRDecoded={(data) => {
          // Handle decoded QR data - could pre-fill transfer form
          // SECURITY: Only log in development
          if (process.env.NODE_ENV === "development") {
            console.log("QR Decoded:", data);
          }
        }}
      />

      {tab === "bills" && <PayBillsTab />}

      {tab === "schedule" && <SchedulePaymentsTab />}
    </div>
  );
};

export default PaymentsContent;
