"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { SidebarData } from "../../../constants/index";
import images from "../../../../public/images";
import useUserLayoutStore from "@/store/userLayout.store";
import useNavigate from "@/hooks/useNavigate";
import useUserStore from "@/store/user.store";
import { TIER_LEVEL } from "@/constants/types";
import ErrorToast from "@/components/toast/ErrorToast";

const MainSidebar = () => {
  const { user } = useUserStore();
  const isBvnVerified =
    user?.tierLevel !== TIER_LEVEL.notSet && user?.isBvnVerified;
  const isPinCreated = user?.isWalletPinSet;

  const isVerified = isBvnVerified && isPinCreated;

  const navigate = useNavigate();
  const pathname = usePathname();

  const { toggleMenu } = useUserLayoutStore();

  return (
    <div className={`w-full h-full overflow-auto relative no-scrollbar`}>
      <div className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#253041]">
        <Image
          alt="logo"
          src={images.singleLogo}
          className="cursor-pointer w-12 h-12"
          onClick={() => {
            navigate("/", "push");
          }}
        />
        <span className="text-[#E7EAEE] text-xl font-semibold">NattyPay</span>
      </div>

      <div className="flex flex-col w-full pb-40 xs:pb-20">
        {SidebarData.map((section, index) => (
          <div
            key={`section-${index}`}
            className="flex flex-col px-3 gap-1"
          >
            {section.data
              .filter((item) => {
                const hidePrefixes = [
                  "/user/withdraw",
                  "/user/send-money",
                  "/user/airtime",
                  "/user/internet",
                  "/user/wallet",
                  "/user/invest",
                  "/user/bills",
                ];
                const shouldHide = hidePrefixes.some((p) => item.path.startsWith(p));
                return !shouldHide;
              })
              .map((item) => {
              const isActive =
                item.path === "/"
                  ? pathname === item.path
                  : pathname.startsWith(item.path);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    toggleMenu();
                    if (
                      [
                        "/user/invest",
                        "/user/withdraw",
                      ].includes(item.path)
                    ) {
                      ErrorToast({
                        title: "This feature is not available yet",
                        descriptions: ["Coming Soon"],
                      });
                    } else if (item.id === 1) {
                      navigate(item.path);
                    } else if (item.path === "/user/cards") {
                      // Always allow Cards navigation (no verification gating)
                      navigate(item.path);
                    } else if (isVerified) {
                      navigate(item.path);
                    } else {
                      ErrorToast({
                        title: "This feature is not available yet",
                        descriptions: [
                          "Complete your verification to access this feature",
                        ],
                      });
                    }
                  }}
                  className={`cursor-pointer flex items-center gap-3 py-3 pl-4 pr-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-secondary text-black"
                      : "text-[#9AA3B2] hover:bg-[#121E2F] hover:text-[#E7EAEE]"
                  }`}
                >
                  <item.icon className={`text-xl ${isActive ? "text-black" : "text-[#9AA3B2]"}`} />
                  <p className={`text-[15px] ${isActive ? "text-black font-semibold" : ""}`}>{item.title}</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainSidebar;
