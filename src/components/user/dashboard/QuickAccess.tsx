import useNavigate from "@/hooks/useNavigate";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaTowerCell } from "react-icons/fa6";
import { IoIosOptions } from "react-icons/io";
import { IoWalletOutline } from "react-icons/io5";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import { IconType } from "react-icons";
import { SlTrophy } from "react-icons/sl";
import SendMoneyModal from "@/components/modals/SendMoneyModal";
import AddMoneyModal from "@/components/modals/AddMoneyModal";
import MobileDataModal from "@/components/modals/MobileDataModal";
import AirtimeModal from "@/components/modals/AirtimeModal";

type QuickAccessItem = {
  title: string;
  icon: IconType;
  path: string;
  desktopOnly?: boolean;
};

const QuickAccessData: QuickAccessItem[] = [
  {
    title: "Send Money",
    icon: IoWalletOutline,
    path: "/user/send-money",
  },
  {
    title: "Add Money",
    icon: IoIosOptions,
    path: "/user/add-funds",
  },
  {
    title: "Airtime",
    icon: MdOutlinePhoneAndroid,
    path: "/user/airtime",
  },
  {
    title: "Mobile Data",
    icon: FaTowerCell,
    path: "/user/internet/mobile-data",
    desktopOnly: true,
  },
  {
    title: "Betting",
    icon: SlTrophy,
    path: "/user/betting",
  },
];

const QuickAccess = () => {
  const navigate = useNavigate();
  const [sendOpen, setSendOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [mobileDataOpen, setMobileDataOpen] = useState(false);
  const [airtimeOpen, setAirtimeOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl px-4 sm:px-6 py-6">
        <div className="w-full flex items-center justify-between mb-4">
          <h2 className="text-text-200 dark:text-text-800 text-lg sm:text-xl font-semibold">Quick Access</h2>
        </div>
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 justify-center items-center">
          {QuickAccessData.map((item, index) => {
            const ItemIcon = item.icon;
            return (
            <div
              key={index}
              onClick={() => {
                if (item.title === "Send Money") setSendOpen(true);
                else if (item.title === "Add Money") setAddOpen(true);
                else if (item.title === "Betting") navigate("/user/betting");
                else if (item.title === "Mobile Data") setMobileDataOpen(true);
                else if (item.title === "Airtime") setAirtimeOpen(true);
                else navigate(item.path);
              }}
              className={`cursor-pointer px-6 py-6 rounded-xl bg-transparent transition-colors flex flex-col justify-center items-center gap-4 ${
                item.desktopOnly ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="flex justify-center items-center w-14 h-14 rounded-md bg-[#6B7280]/40 dark:bg-[#9CA3AF]/20 text-secondary">
                <ItemIcon className="text-2xl"/>
              </div>
              <p className="text-base text-center text-black dark:text-white">
                {item.title}
              </p>
            </div>
          );})}
        </div>
      </div>
      <SendMoneyModal isOpen={sendOpen} onClose={() => setSendOpen(false)} />
      <AddMoneyModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
      <MobileDataModal isOpen={mobileDataOpen} onClose={() => setMobileDataOpen(false)} />
      <AirtimeModal isOpen={airtimeOpen} onClose={() => setAirtimeOpen(false)} />
    </div>
  );
};

export default QuickAccess;
