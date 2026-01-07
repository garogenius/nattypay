"use client";

import useNavigate from "@/hooks/useNavigate";
import { usePathname } from "next/navigation";
import { IoChevronBack } from "react-icons/io5";

const HeadingData = [
  {
    title: "Profile Settings",
    path: "/user/settings/profile",
  },

  {
    title: "Reset Pin",
    path: "/user/settings/reset-pin",
  },

  {
    title: "Reset Pin",
    path: "/user/settings/reset-pin/reset",
  },

  {
    title: "Change Password",
    path: "/user/settings/changePassword",
  },
  {
    title: "Support",
    path: "/user/settings/support",
  },

  {
    title: "Tier Levels",
    path: "/user/settings/tiers",
  },
];

const SettingsBack = () => {
  const navigate = useNavigate();
  const pathname = usePathname();

  const Heading = HeadingData.sort(
    (a, b) => b.path.length - a.path.length
  ).find((item) => {
    if (Array.isArray(item.path)) {
      return item.path.includes(pathname);
    }
    return pathname.startsWith(item.path); // Match paths with dynamic segments
  });
  return (
    <div
      onClick={() => {
        navigate(-1);
      }}
      className="w-fit flex items-center gap-1 sm:gap-2 cursor-pointer text-text-200 dark:text-text-400"
    >
      <IoChevronBack className="text-xl sm:text-2xl" />
      <h2 className="text-lg sm:text-xl font-bold text-text-200 dark:text-text-400 ">
        {Heading?.title}{" "}
      </h2>
      {/* <p className="text-lg font-medium"> {Heading?.title}</p> */}
    </div>
  );
};

export default SettingsBack;
