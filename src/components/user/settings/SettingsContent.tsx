"use client";
import cn from "classnames";
import useUserStore from "@/store/user.store";
import SettingsCard from "./SettingsCard";
import useNavigate from "@/hooks/useNavigate";
import { CgProfile } from "react-icons/cg";
import { MdSystemSecurityUpdateWarning } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { BiSupport } from "react-icons/bi";
import { HiMiniPhone } from "react-icons/hi2";
import { useState } from "react";
import Tier2UpgradeModal from "@/components/modals/tiers/Tier2UpgradeModal";
import Tier3UpgradeModal from "@/components/modals/tiers/Tier3UpgradeModal";

export const SettingsPages = [
  {
    id: 1,
    title: "Profile",
    path: "/user/settings/profile",
    icon: CgProfile,
  },

  {
    id: 2,
    title: "Reset Pin",
    path: "/user/settings/reset-pin",
    icon: MdSystemSecurityUpdateWarning,
  },

  {
    id: 3,
    title: "Change password",
    path: "/user/settings/changePassword",
    icon: TbLockPassword,
  },

  {
    id: 4,
    title: "Change phone number",
    path: "/user/settings/changePhoneNumber",
    icon: HiMiniPhone,
  },

  // {
  //   id: 4,
  //   title: "Referral",
  //   path: "/user/settings/support",
  //   icon: IoGiftOutline,
  // },

  {
    id: 5,
    title: "Support",
    path: "/user/settings/support",
    icon: BiSupport,
  },
];

const SettingsContent = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [openTier2Modal, setOpenTier2Modal] = useState(false);
  const [openTier3Modal, setOpenTier3Modal] = useState(false);

  return (
    <>
      <div className="w-full  bg-transparent 2xs:bg-bg-600 2xs:dark:bg-bg-1100 py-4 md:py-8 px-0 2xs:px-5 md:px-10 flex flex-col gap-4 xs:gap-6 rounded-xl sm:rounded-2xl">
        {/* <h2 className="text-xl sm:text-2xl font-bold text-text-200 dark:text-text-400 ">
          Settings
        </h2> */}

        <div className="flex flex-col rounded-lg gap-4">
          <div
            className={`w-full bg-bg-600  dark:bg-bg-1100 2xs:bg-bg-400 2xs:dark:bg-bg-2200 text-text-200 dark:text-text-800 flex flex-col xl:flex-row items-center justify-start xl:justify-between gap-4  xl:gap-2.5 py-4 sm:py-6 px-4 xs:px-6 2xl:px-8 rounded-2xl`}
          >
            <div className="w-full  xl:w-[50%] 2xl:w-full flex flex-col gap-3 sm:gap-2.5">
              <div className="w-full flex flex-col-reverse xs:flex-row xs:items-center gap-2">
                <h2 className="text-lg xl:text-xl font-bold">
                  Complete Account Verification
                </h2>
                <span
                  className={cn("w-fit px-2 2xl:px-3 py-2 rounded-xl text-sm", {
                    "border border-[#ffb200] text-[#ffb200] bg-[#fff7dd]":
                      user?.tierLevel !== "three",

                    "border border-[#24a40e] text-[#24a40e] bg-[#e2ffdd]":
                      user?.tierLevel === "three",
                  })}
                >
                  Tier <span className="capitalize">{user?.tierLevel}</span>
                </span>
              </div>
              <p className="text-text-200 dark:text-text-400 text-sm xl:text-base ">
                {user?.tierLevel === "three"
                  ? "Your account has been verified, you now have full access to features like Instant Wallet Funding."
                  : "To comply with regulations, identity verification is required. Complete your Verification process to unlock features like Instant Wallet Funding and increase your transaction limits."}
              </p>
            </div>
            <div className="w-full xl:w-[50%] 2xl:w-full flex flex-col 2xs:flex-row  xl:flex-row xl:justify-end  xl:items-center gap-3">
              <button
                onClick={() => {
                  navigate("/user/settings/tiers", "push");
                }}
                className="w-full 2xs:w-fit py-2.5 xl:py-3.5 px-4 2xs:px-6 2xl:px-8 bg-transparent rounded-2xl 2xs:rounded-full text-black dark:text-white font-medium border-2 border-black dark:border-white text-sm"
              >
                View Tiers
              </button>

              {user?.tierLevel !== "three" && (
                <button
                  onClick={() => {
                    if (user?.tierLevel === "one") {
                      setOpenTier2Modal(true);
                    } else if (user?.tierLevel === "two") {
                      setOpenTier3Modal(true);
                    }
                  }}
                  className="w-full 2xs:w-fit py-3 xl:py-3.5 px-4 2xs:px-6 2xl:px-8 border-2 border-secondary bg-secondary rounded-2xl 2xs:rounded-full text-white font-medium text-sm"
                >
                  Upgrade Tier{" "}
                </button>
              )}
            </div>
          </div>
          {SettingsPages.map((item, index) => (
            <SettingsCard
              key={index}
              path={item.path}
              text={item.title}
              icon={item.icon}
            />
          ))}
        </div>
      </div>

      {/* Tier Upgrade Modals */}
      <Tier2UpgradeModal isOpen={openTier2Modal} onClose={() => setOpenTier2Modal(false)} />
      <Tier3UpgradeModal isOpen={openTier3Modal} onClose={() => setOpenTier3Modal(false)} />
    </>
  );
};

export default SettingsContent;
