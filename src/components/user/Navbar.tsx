"use client";

import { FiMenu } from "react-icons/fi";
import useUserStore from "@/store/user.store";

import useUserLayoutStore from "@/store/userLayout.store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CURRENCY, TIER_LEVEL } from "@/constants/types";
import { FiSearch, FiBell, FiClock, FiX } from "react-icons/fi";
import { MdKeyboardArrowDown } from "react-icons/md";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { useRef } from "react";
import { useGetUnreadCount, useGetNotifications } from "@/api/notifications/notifications.queries";

const Navbar = () => {
  const { user } = useUserStore();
  const [imgUrl, setImgUrl] = useState(user?.profileImageUrl || "");

  useEffect(() => {
    if (user?.profileImageUrl) {
      setImgUrl(user.profileImageUrl);
    }
  }, [user]);

  // Helper function to format tier level display
  const getTierDisplayText = (tierLevel?: TIER_LEVEL): string => {
    if (!tierLevel || tierLevel === TIER_LEVEL.notSet) {
      return "Tier Not Set";
    }
    const tierNumber = tierLevel === TIER_LEVEL.one ? "1" : tierLevel === TIER_LEVEL.two ? "2" : "3";
    return `Tier ${tierNumber} Account`;
  };

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

  // profile dropdown
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setOpen(false));

  // notifications dropdown
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(bellRef, () => setBellOpen(false));
  const { count: unreadCount } = useGetUnreadCount();
  const { notifications } = useGetNotifications({ page: 1, limit: 5 });

  // search dropdown state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(searchRef, () => setSearchOpen(false));

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('recent_searches') : null;
    if (saved) setRecent(JSON.parse(saved));
  }, []);

  const persistRecent = (items: string[]) => {
    setRecent(items);
    if (typeof window !== 'undefined') localStorage.setItem('recent_searches', JSON.stringify(items.slice(0, 10)));
  };

  const onSubmitSearch = () => {
    const term = searchValue.trim();
    if (!term) return;
    const next = [term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())];
    persistRecent(next);
    setSearchOpen(false);
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="w-full z-40 xs:z-50 sticky top-0 flex items-center gap-3 bg-bg-600 dark:bg-bg-1100 px-4 2xs:px-6 lg:px-8 py-3 border-b border-[#253041]">
      {/* Left: menu + search */}
      <FiMenu
        onClick={toggleMenu}
        className="lg:hidden text-2xl text-text-200 dark:text-text-400 mr-1"
      />
      <div className="flex-1 max-w-[820px]" ref={searchRef}>
        <div className="relative">
          <div className="w-full flex items-center gap-2 bg-bg-600 dark:bg-bg-1100 border border-[#2C3947] rounded-xl px-4 py-2.5">
            <FiSearch className="text-text-200 dark:text-text-400" />
            <input
              aria-label="search"
              placeholder="Search transactions, bills or payments..."
              className="bg-transparent outline-none w-full text-text-200 dark:text-text-800 placeholder-white"
              value={searchValue}
              onChange={(e)=> setSearchValue(e.target.value)}
              onFocus={()=> setSearchOpen(true)}
              onKeyDown={(e)=> { if (e.key === 'Enter') onSubmitSearch(); }}
            />
            {searchOpen && (
              <button aria-label="close" onClick={()=> setSearchOpen(false)} className="text-white/70 hover:text-white">
                <FiX />
              </button>
            )}
          </div>

          {searchOpen && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-bg-600 dark:bg-bg-1100 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <p className="text-white/80 text-sm">Recent Search</p>
                {recent.length > 0 && (
                  <button className="text-[#D4B139] text-sm" onClick={()=> persistRecent([])}>Clear All</button>
                )}
              </div>
              <div className="h-px bg-[#2C3947]" />
              <div className="max-h-80 overflow-auto scroll-area py-2">
                {recent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <FiClock className="text-white/30 text-2xl" />
                    <p className="text-white/60 text-sm">No recent searches</p>
                  </div>
                ) : recent.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-white/5">
                    <button
                      className="flex items-center gap-3 flex-1 text-left"
                      onClick={()=> { setSearchValue(r); onSubmitSearch(); }}
                    >
                      <FiClock className="text-white/50" />
                      <span className="text-sm text-white/80">{r}</span>
                    </button>
                    <button aria-label="remove" onClick={()=> persistRecent(recent.filter((x)=> x!==r))} className="text-white/40 hover:text-white/70">
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      <div ref={bellRef} className="relative hidden sm:block mr-2">
        <FiBell onClick={() => setBellOpen((v) => !v)} className="text-2xl text-white cursor-pointer" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-[2px] min-w-[18px] text-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {bellOpen && (
          <div className="absolute right-0 mt-3 w-80 bg-[#0F1A2A] border border-[#2C3947] rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-[#2C3947] flex items-center justify-between">
              <span className="text-sm text-[#E7EAEE] font-semibold">Notifications</span>
              {notifications.length > 0 && (
                <Link
                  href="/user/notifications"
                  onClick={() => setBellOpen(false)}
                  className="text-xs text-[#D4B139] hover:text-[#E5C249]"
                >
                  View all
                </Link>
              )}
            </div>
            <div className="max-h-80 overflow-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <FiBell className="text-white/30 text-2xl" />
                  <p className="text-white/60 text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href="/user/notifications"
                    onClick={() => setBellOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#121E2F] border-t border-[#2C3947] first:border-t-0"
                  >
                    <span
                      className={`mt-1 w-2 h-2 rounded-full ${
                        !n.isRead ? "bg-secondary" : "bg-[#2C3947]"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-[#E7EAEE]">{n.title}</p>
                      <p className="text-xs text-[#9AA3B2] mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-xs text-[#9AA3B2] mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile pill + dropdown */}
      <div ref={dropdownRef} className="relative flex items-center ml-auto">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 bg-transparent rounded-full pl-2 pr-3 py-1.5"
        >
          <span className="relative uppercase flex justify-center items-center rounded-full bg-secondary w-10 h-10 text-center text-black text-sm font-bold overflow-hidden">
            {imgUrl ? (
              <Image src={imgUrl} alt="profile" fill objectFit="cover" className="w-fit h-fit rounded-full" />
            ) : (
              <span>{user?.fullname.slice(0, 1)}</span>
            )}
          </span>
          <div className="hidden md:flex flex-col items-start pr-1">
            <span className="text-[15px] text-[#E7EAEE] font-normal leading-4">
              {user?.fullname}
            </span>
            <span className="text-[12px] text-[#9AA3B2] leading-4">
              {getTierDisplayText(user?.tierLevel)}
            </span>
          </div>
          <MdKeyboardArrowDown className="text-[#E7EAEE] text-lg" />
        </button>

        {open && (
          <div className="absolute right-0 top-12 bg-[#0F1A2A] rounded-xl border border-[#2C3947] shadow-2xl w-56 overflow-hidden">
            <Link href="/user/settings/profile" className="block px-4 py-3 text-sm text-[#E7EAEE] hover:bg-[#121E2F]">
              My Account
            </Link>
            <Link href="/user/settings/profile" className="block px-4 py-3 text-sm text-[#E7EAEE] border-t border-[#2C3947] hover:bg-[#121E2F]">
              Profile Settings
            </Link>
            <Link href="/user/settings" className="block px-4 py-3 text-sm text-[#E7EAEE] border-t border-[#2C3947] hover:bg-[#121E2F]">
              Account Info
            </Link>
            <Link href="/logout" className="block px-4 py-3 text-sm font-semibold text-red-500 border-t border-[#2C3947] hover:bg-[#121E2F]">
              Logout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
