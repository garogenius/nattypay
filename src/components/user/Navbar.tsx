"use client";

import { FiMenu } from "react-icons/fi";
import useUserStore from "@/store/user.store";

import useUserLayoutStore from "@/store/userLayout.store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CURRENCY } from "@/constants/types";

const Navbar = () => {
  const { user } = useUserStore();
  const [imgUrl, setImgUrl] = useState(user?.profileImageUrl || "");

  useEffect(() => {
    if (user?.profileImageUrl) {
      setImgUrl(user.profileImageUrl);
    }
  }, [user]);

  const { toggleMenu } = useUserLayoutStore();
  const pathname = usePathname();

  const HeadingData = [
    {
      title: "Dashboard",
      path: "/user/dashboard",
    },
    {
      title: "Send Money",
      path: "/user/send-money",
    },

    {
      title: "Wallet",
      path: "/user/wallet",
    },
    {
      title: "Add Funds",
      path: "/user/add-funds",
    },
    {
      title: "Transactions",
      path: "/user/transactions",
    },
    {
      title: "Airtime",
      path: "/user/airtime",
    },
    {
      title: "Mobile Data",
      path: "/user/internet",
    },
    {
      title: "Bills Payment",
      path: "/user/bills",
    },
    {
      title: "Cable / TV Bills",
      path: "/user/bills/cable",
    },

    {
      title: "Settings",
      path: "/user/settings",
    },
    {
      title: "Receipt",
      path: "/user/receipt",
    },
  ];

  const Heading = HeadingData.sort(
    (a, b) => b.path.length - a.path.length
  ).find((item) => {
    if (Array.isArray(item.path)) {
      return item.path.includes(pathname);
    }
    return pathname.startsWith(item.path); // Match paths with dynamic segments
  });

  return (
    <div className="w-full z-40 xs:z-50 sticky top-0 flex justify-between items-center shadow gap-2 bg-bg-600 dark:bg-bg-2200 px-4 2xs:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-2.5 sm:gap-4">
        <FiMenu
          onClick={toggleMenu}
          className="lg:hidden text-2xl text-text-200 dark:text-text-400"
        />
        <p className="text-xl sm:text-2xl font-semibold text-text-1000 dark:text-text-400">
          {Heading?.title}
        </p>
      </div>

      <div className="flex items-center gap-3 xs:gap-4 lg:gap-6 xl:gap-8">
        <div className="flex items-center gap-2">
          <Link
            href="/user/settings/profile"
            className="relative uppercase flex justify-center items-center rounded-full bg-primary w-10 xs:w-12 h-10 xs:h-12 text-center text-text-200 text-lg font-medium"
          >
            {imgUrl ? (
              <Image
                src={imgUrl}
                alt="profile"
                fill
                objectFit="cover"
                className="w-fit h-fit rounded-full"
              />
            ) : (
              <p> {user?.fullname.slice(0, 2)}</p>
            )}{" "}
          </Link>
          <div className="max-lg:hidden flex flex-col text-text-1000 dark:text-text-800">
            {user?.wallet ? (
              <>
                <p className="capitalize text-base font-semibold mb-0.5">
                  Bal: ₦{" "}
                  {user?.wallet
                    .find((w) => w.currency === CURRENCY.NGN)
                    ?.balance.toLocaleString()}
                </p>

                <p className="text-sm -mt-1.5">
                  Acc No:{" "}
                  {
                    user?.wallet.find((w) => w.currency === CURRENCY.NGN)
                      ?.accountNumber
                  }
                </p>
              </>
            ) : (
              <>
                <p className="capitalize text-base font-semibold mb-0.5">
                  {user?.fullname}
                </p>
                <p className="text-sm -mt-1.5">{user?.email}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
