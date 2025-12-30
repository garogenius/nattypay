"use client";

import React, { useState } from "react";
import useNavigate from "@/hooks/useNavigate";
import toast from "react-hot-toast";
import AirtimeModal from "@/components/modals/AirtimeModal";
import MobileDataModal from "@/components/modals/MobileDataModal";
import ElectricityModal from "@/components/modals/ElectricityModal";
import CableTvModal from "@/components/modals/CableTvModal";
import InternationalAirtimeModal from "@/components/modals/InternationalAirtimeModal";
import InternetModal from "@/components/modals/InternetModal";
import TransportModal from "@/components/modals/TransportModal";
import EducationModal from "@/components/modals/EducationModal";
import GiftCardModal from "@/components/modals/GiftCardModal";
import { AiOutlineInsurance, AiOutlineThunderbolt } from "react-icons/ai";
import { BiCameraMovie } from "react-icons/bi";
import { CiShop } from "react-icons/ci";
import { IoBusOutline, IoSchoolOutline } from "react-icons/io5";
import { LiaRedoAltSolid } from "react-icons/lia";
import { LuShieldPlus, LuTv } from "react-icons/lu";
import { MdCardGiftcard, MdOutlinePhoneAndroid, MdOutlineWifi } from "react-icons/md";
import { RiGovernmentLine } from "react-icons/ri";
import { SlPlane, SlTrophy } from "react-icons/sl";
import { TbWorld } from "react-icons/tb";
import { FaDroplet } from "react-icons/fa6";

type BillItem = { 
  name: string; 
  icon: React.ComponentType<any>; 
  path?: string; 
  available?: boolean;
  onClick?: () => void;
};

const sections: { title: string; items: BillItem[] }[] = [
  {
    title: "Mobile & Connectivity",
    items: [
      { name: "Airtime", icon: MdOutlinePhoneAndroid, path: "/user/airtime", available: true },
      { name: "Mobile Data", icon: MdOutlineWifi, available: true },
      { name: "International Airtime", icon: TbWorld, available: true },
      { name: "Internet", icon: MdOutlineWifi, available: true },
    ],
  },
  {
    title: "Utilities",
    items: [
      { name: "Electricity", icon: AiOutlineThunderbolt, available: true },
      { name: "Cable Tv", icon: LuTv, available: true },
      { name: "Pay Water", icon: FaDroplet, available: false },
    ],
  },
  {
    title: "Payments",
    items: [
      { name: "Pay Tax", icon: RiGovernmentLine, available: false },
      { name: "TSA & Staters", icon: RiGovernmentLine, available: false },
      { name: "Government Fee", icon: RiGovernmentLine, available: false },
    ],
  },
  {
    title: "Entertainment & Travel",
    items: [
      { name: "Movie Tickets", icon: BiCameraMovie, available: false },
      { name: "Flight", icon: SlPlane, available: false },
      { name: "Bus Tickets", icon: IoBusOutline, onClick: () => {}, available: true },
      { name: "Hotel", icon: LuShieldPlus, available: false },
    ],
  },
  {
    title: "Betting & Currency",
    items: [
      { name: "Betting", icon: SlTrophy, available: false },
      { name: "Convert Currency", icon: LiaRedoAltSolid, available: false },
      { name: "Sell Giftcards", icon: MdCardGiftcard, available: false },
      { name: "Buy Giftcards", icon: MdCardGiftcard, onClick: () => {}, available: true },
    ],
  },
  {
    title: "Health & Lifestyle",
    items: [
      { name: "Health", icon: LuShieldPlus, available: false },
      { name: "Insurance", icon: AiOutlineInsurance, available: false },
      { name: "Shopping", icon: CiShop, available: false },
    ],
  },
  {
    title: "School",
    items: [
      { name: "Education", icon: IoSchoolOutline, onClick: () => {}, available: true },
      { name: "Jamb & Waec", icon: IoSchoolOutline, onClick: () => {}, available: true },
    ],
  },
];

const Card: React.FC<BillItem & { 
  onAirtimeClick?: () => void; 
  onMobileDataClick?: () => void; 
  onElectricityClick?: ()=>void; 
  onCableClick?: ()=>void; 
  onInternationalAirtimeClick?: ()=>void; 
  onInternetClick?: ()=>void;
  onTransportClick?: () => void;
  onEducationClick?: () => void;
  onGiftCardClick?: () => void;
}> = ({ 
  name, 
  icon: Icon, 
  path, 
  available, 
  onClick: itemOnClick,
  onAirtimeClick, 
  onMobileDataClick, 
  onElectricityClick, 
  onCableClick, 
  onInternationalAirtimeClick, 
  onInternetClick,
  onTransportClick,
  onEducationClick,
  onGiftCardClick,
}) => {
  const navigate = useNavigate();
  const onClick = () => {
    if (itemOnClick) {
      itemOnClick();
    } else if (name === "Airtime" && onAirtimeClick) {
      onAirtimeClick();
    } else if (name === "Mobile Data" && onMobileDataClick) {
      onMobileDataClick();
    } else if (name === "International Airtime" && onInternationalAirtimeClick) {
      onInternationalAirtimeClick();
    } else if (name === "Internet" && onInternetClick) {
      onInternetClick();
    } else if (name === "Electricity" && onElectricityClick) {
      onElectricityClick();
    } else if (name === "Cable Tv" && onCableClick) {
      onCableClick();
    } else if ((name === "Bus Tickets" || name === "Flight") && onTransportClick) {
      onTransportClick();
    } else if ((name === "Education" || name === "Jamb & Waec") && onEducationClick) {
      onEducationClick();
    } else if (name === "Buy Giftcards" && onGiftCardClick) {
      onGiftCardClick();
    } else if (available && path) {
      navigate(path);
    } else {
      toast.dismiss();
      toast.error("Unavailable at the moment", { duration: 2500 });
    }
  };
  return (
    <button
      onClick={onClick}
      type="button"
      className="cursor-pointer w-full flex px-2 py-3 sm:px-4 sm:py-5 flex-col gap-1.5 sm:gap-2.5 justify-center items-center bg-bg-600 dark:bg-bg-1100 rounded-lg sm:rounded-xl border border-border-600 hover:bg-white/5 transition-colors"
    >
      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full p-2 sm:p-3 flex justify-center items-center bg-bg-2700 dark:bg-bg-1200">
        <Icon className="text-[#D4B139] text-sm sm:text-xl" />
      </div>
      <p className="text-xs sm:text-sm md:text-base font-medium text-text-200 dark:text-text-400 text-center leading-tight">{name}</p>
    </button>
  );
};

const PayBillsTab: React.FC = () => {
  const [isAirtimeModalOpen, setIsAirtimeModalOpen] = useState(false);
  const [isMobileDataModalOpen, setIsMobileDataModalOpen] = useState(false);
  const [isElectricityModalOpen, setIsElectricityModalOpen] = useState(false);
  const [isCableModalOpen, setIsCableModalOpen] = useState(false);
  const [isInternationalAirtimeOpen, setIsInternationalAirtimeOpen] = useState(false);
  const [isInternetOpen, setIsInternetOpen] = useState(false);
  const [isTransportOpen, setIsTransportOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {sections.map((sec, idx) => (
        <div key={idx} className="rounded-2xl border border-border-800 dark:border-border-700 bg-bg-600 dark:bg-bg-1100 p-4 sm:p-5">
          <p className="text-white/80 text-sm mb-4">{sec.title}</p>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {sec.items.map((it, i) => (
              <Card
                key={i}
                {...it}
                onAirtimeClick={() => setIsAirtimeModalOpen(true)}
                onMobileDataClick={() => setIsMobileDataModalOpen(true)}
                onElectricityClick={() => setIsElectricityModalOpen(true)}
                onCableClick={() => setIsCableModalOpen(true)}
                onInternationalAirtimeClick={() => setIsInternationalAirtimeOpen(true)}
                onInternetClick={() => setIsInternetOpen(true)}
                onTransportClick={() => setIsTransportOpen(true)}
                onEducationClick={() => setIsEducationOpen(true)}
                onGiftCardClick={() => setIsGiftCardOpen(true)}
              />
            ))}
          </div>
        </div>
      ))}
      
      <AirtimeModal 
        isOpen={isAirtimeModalOpen} 
        onClose={() => setIsAirtimeModalOpen(false)} 
      />
      
      <MobileDataModal 
        isOpen={isMobileDataModalOpen} 
        onClose={() => setIsMobileDataModalOpen(false)} 
      />

      <ElectricityModal
        isOpen={isElectricityModalOpen}
        onClose={() => setIsElectricityModalOpen(false)}
      />

      <CableTvModal
        isOpen={isCableModalOpen}
        onClose={() => setIsCableModalOpen(false)}
      />

      <InternationalAirtimeModal
        isOpen={isInternationalAirtimeOpen}
        onClose={() => setIsInternationalAirtimeOpen(false)}
      />

      <InternetModal
        isOpen={isInternetOpen}
        onClose={() => setIsInternetOpen(false)}
      />

      <TransportModal
        isOpen={isTransportOpen}
        onClose={() => setIsTransportOpen(false)}
      />

      <EducationModal
        isOpen={isEducationOpen}
        onClose={() => setIsEducationOpen(false)}
      />

      <GiftCardModal
        isOpen={isGiftCardOpen}
        onClose={() => setIsGiftCardOpen(false)}
      />
    </div>
  );
};

export default PayBillsTab;
