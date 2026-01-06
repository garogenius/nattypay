"use client";
import Image from "next/image";
import cn from "classnames";
import useUserStore from "@/store/user.store";
import { useState } from "react";
import images from "../../../../../public/images";
import Tier2UpgradeModal from "@/components/modals/tiers/Tier2UpgradeModal";
import Tier3UpgradeModal from "@/components/modals/tiers/Tier3UpgradeModal";

const TierContent = () => {
  const user = useUserStore((state) => state.user);
  const [openTier2Modal, setOpenTier2Modal] = useState(false);
  const [openTier3Modal, setOpenTier3Modal] = useState(false);

  const isStatusUpgradable = (tier: string) => {
    const tiers = ["one", "two", "three"];
    const currentIndex = tiers.indexOf(user?.tierLevel?.toLowerCase() || "");

    // The user can only upgrade to the next immediate tier
    const tierIndex = tiers.indexOf(tier.toLowerCase());
    return tierIndex === currentIndex + 1; // Only return true if it's the next tier
  };

  const UserTypes = [
    {
      planType: "one",
      maxBal: 5000000,
      transLimit: 1000000,
      title: "Tier One",
      image: images.tiers.tier1,
    },

    {
      planType: "two",
      maxBal: 10000000,
      transLimit: 5000000,
      title: "Tier Two",
      image: images.tiers.tier2,
    },

    {
      planType: "three",
      maxBal: Infinity,
      transLimit: Infinity,
      title: "Tier Three",
      image: images.tiers.tier3,
    },
  ];

  return (
    <div className="w-full h-full 2xs:bg-bg-600 2xs:dark:bg-bg-1100 py-4 md:py-8 px-1 2xs:px-5 lg:px-8 flex justify-center  rounded-xl sm:rounded-2xl">
      <div className="flex flex-col justify-center items-center gap-6 xs:gap-8  w-full 2xl:w-[90%] bg-transparent p-0 2xs:p-4 md:p-8">
        <div className="pt-6 w-[90%] flex flex-col gap-1.5 justify-center items-center text-center text-text-200 dark:text-text-400">
          <h2 className="text-xl 2xs:text-2xl sm:text-3xl font-bold ">
            Upgrade Tier
          </h2>

          <p className="text-sm 2xs:text-base sm:text-lg w-full">
            Upgrade your tier to unlock higher transaction limits and increased balance capacity.
          </p>
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-4">
          <p className="text-base xs:text-lg text-center font-bold text-text-200 dark:text-text-400">
            Tier Levels{" "}
          </p>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3  gap-4">
            {UserTypes.map((plan) => (
              <TierCard
                key={plan.planType}
                {...plan}
                active={
                  user?.tierLevel?.toLowerCase() === plan.planType.toLowerCase()
                }
                isUpgradable={isStatusUpgradable(plan.planType)}
                onUpgrade={() => {
                  if (plan.planType === "two") {
                    setOpenTier2Modal(true);
                  } else if (plan.planType === "three") {
                    setOpenTier3Modal(true);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tier Upgrade Modals */}
      <Tier2UpgradeModal isOpen={openTier2Modal} onClose={() => setOpenTier2Modal(false)} />
      <Tier3UpgradeModal isOpen={openTier3Modal} onClose={() => setOpenTier3Modal(false)} />
    </div>
  );
};

export default TierContent;

const TierCard = ({
  planType,
  maxBal,
  transLimit,
  active,
  title,
  image,
  isUpgradable,
  onUpgrade,
}: {
  planType: string;
  maxBal: number;
  transLimit: number;
  active: boolean;
  title: string;
  image: string;
  isUpgradable: boolean;
  onUpgrade?: () => void;
}) => {
  return (
    <div
      className={cn(
        "bg-bg-600 2xs:bg-bg-400 dark:bg-bg-1100 2xs:dark:bg-black text-base text-text-200 dark:text-text-400 rounded-xl px-6 xl:px-8 py-6 xl:py-8 flex flex-col  gap-2 sm:gap-3 ",
        {
          " shadow-[0_4px_20px_0_rgba(241,181,0,0.6)]": active,
          "border-none": !active,
        }
      )}
    >
      <div className="flex items-center gap-2 lg:gap-3">
        <Image src={image} alt="tier icon" className="w-10 lg:w-12" />
        <p className="">{title}</p>
      </div>
      {active ? (
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1">
            <span>Daily Limit: </span>
            <span className="font-bold">₦{transLimit.toLocaleString()}</span>
          </p>
          <p className="flex items-center gap-1">
            <span>Wallet Cap: </span>
            <span className="font-bold">
              {maxBal === Infinity
                ? "Unlimited"
                : `₦${maxBal.toLocaleString()}`}
            </span>
          </p>
          <div className="mt-4 text-sm xs:text-base w-fit text-center px-4 py-1 xs:py-1.5 rounded-full text-black bg-primary">
            Active Tier
          </div>{" "}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-5">
          <div className="flex flex-col gap-0.5">
            {" "}
            <p className="flex items-center gap-1">
              <p>Daily Limit: </p>
              <span className="font-bold">
                {" "}
                {maxBal === Infinity
                  ? "Unlimited"
                  : `₦${transLimit.toLocaleString()}`}
              </span>
            </p>
            <p className="flex items-center gap-1">
              <p>Wallet Cap: </p>
              <span className="font-bold">
                {maxBal === Infinity
                  ? "Unlimited"
                  : `₦${maxBal.toLocaleString()}`}
              </span>
            </p>
          </div>
          {isUpgradable ? (
            <button
              onClick={onUpgrade}
              className="text-sm font-bold text-primary text-left"
            >
              Upgrade
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};
