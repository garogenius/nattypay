"use client";

import Image from "next/image";
import images from "../../../public/images";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import useNavigate from "@/hooks/useNavigate";
import Link from "next/link";
import { NavItems } from "@/constants/index";
import CustomButton from "../shared/Button";
import cn from "classnames";
import { SlClose, SlMenu } from "react-icons/sl";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import { motion, AnimatePresence } from "framer-motion";
import DownloadPopupModal from "../modals/DownloadPopupModal";

const Navbar = () => {
  const navigate = useNavigate();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDownload, setOpenDownload] = useState(false);
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const [mobileDevOpen, setMobileDevOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDevMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuVariants = {
    initial: {
      y: "-100%",
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.1,
      },
    },
    exit: {
      y: "-100%",
      opacity: 0,
      transition: {
        duration: 0.01,
        ease: "easeInOut",
      },
    },
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full">
        <div className={`flex justify-center bg-bg-400 md:bg-bg-600 dark:bg-black text-text-200 py-3.5 w-full transition-all duration-300 ease-in-out ${scrolled ? "shadow-md" : ""}`}>
          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-between items-center w-[95%] lg:w-[90%]">
            <div className="flex items-center gap-6">
              <div className="bg-transparent">
                <Image
                  onClick={() => navigate("/")}
                  src={images.logo2}
                  alt="logo"
                  className="w-44 lg:w-48 h-auto cursor-pointer"
                />
              </div>
              <div className="flex justify-center items-center text-base gap-4 lg:gap-6">
                {NavItems.map((item) => (
                  <Link
                    href={item?.path}
                    key={item?.id}
                    className={cn(
                      `no-underline font-medium hover:text-secondary py-1`,
                      {
                        "text-primary border-b-2 border-primary": isActive(item.path),
                        "text-text-200 dark:text-text-400": !isActive(item.path),
                      }
                    )}
                  >
                    {item?.title}
                  </Link>
                ))}
                <div className="relative" ref={dropdownRef}>
                  <button
                    className={cn(
                      `no-underline font-medium py-1 hover:text-secondary`,
                      "text-text-200 dark:text-text-400"
                    )}
                    aria-haspopup="menu"
                    aria-expanded={devMenuOpen}
                    onClick={() => setDevMenuOpen((v) => !v)}
                  >
                    Developer
                  </button>
                  <div
                    className={cn(
                      "absolute left-0 mt-2 min-w-[220px] rounded-md border border-bg-500 bg-bg-400 dark:bg-bg-900 shadow-lg transition-opacity duration-150 z-50",
                      devMenuOpen ? "visible opacity-100" : "invisible opacity-0"
                    )}
                    role="menu"
                  >
                    <div className="flex flex-col py-2">
                      <Link
                        href="/developer/api-documentation"
                        className="px-4 py-2 text-sm no-underline text-text-200 dark:text-text-400 hover:text-secondary hover:bg-bg-500 dark:hover:bg-bg-800"
                        onClick={() => setDevMenuOpen(false)}
                      >
                        API Documentation
                      </Link>
                      <Link
                        href="/developer/api-reference"
                        className="px-4 py-2 text-sm no-underline text-text-200 dark:text-text-400 hover:text-secondary hover:bg-bg-800"
                        onClick={() => setDevMenuOpen(false)}
                      >
                        API Reference
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2.5 lg:gap-3.5">
              <CustomButton
                onClick={() => setOpenDownload(true)}
                className="rounded-2xl max-lg:px-6 bg-secondary"
              >
                Get Started
              </CustomButton>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-between items-center w-[95%]">
            <Image
              onClick={() => navigate("/")}
              src={images.logo2}
              alt="logo"
              className="w-40 h-auto cursor-pointer"
            />
            <div className="flex items-center gap-3">
              <Link href="/account-type">
                <CustomButton className="rounded-2xl px-4 py-2 text-sm bg-secondary">
                  Sign Up
                </CustomButton>
              </Link>
              <button
                onClick={() => setOpen((v) => !v)}
                className="p-2 rounded-full text-text-200 dark:text-text-400 hover:bg-bg-500 transition-colors"
                aria-label="Menu"
                aria-expanded={open}
              >
                <SlMenu className="text-xl" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {open && (
              <motion.div
                variants={menuVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed inset-0 bg-bg-700 dark:bg-bg-1000 z-50 overflow-y-auto h-screen"
              >
                <div className="flex flex-col items-stretch w-full bg-inherit h-full">
                  <div className="flex items-center justify-between w-full pt-10 pb-6 px-6">
                    <div className="w-10"></div>
                    <SlClose
                      onClick={() => setOpen(false)}
                      className="text-4xl text-text-500 dark:text-text-600 cursor-pointer"
                    />
                  </div>

                  <div className="w-full bg-transparent flex justify-start items-stretch flex-col gap-1.5 xs:gap-2">
                    {/* Primary Links */}
                    {NavItems.map((item) => (
                      <Link
                        href={item?.path}
                        key={item?.id}
                        className={cn(
                          `w-full text-left no-underline px-6 py-3 text-base hover:text-secondary border-b border-bg-600/40`,
                          {
                            "text-secondary dark:text-primary dark:bg-bg-1100":
                              isActive(item.path),
                            "text-text-200 dark:text-text-400": !isActive(item.path),
                          }
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item?.title}
                      </Link>
                    ))}
                    {/* Developer Dropdown (Mobile) */}
                    <div className="w-full">
                      <button
                        className="w-full flex items-center justify-between px-6 py-3 text-base no-underline border-b border-bg-600/40 text-text-200 dark:text-text-400 hover:text-secondary"
                        onClick={() => setMobileDevOpen((v) => !v)}
                        aria-expanded={mobileDevOpen}
                        aria-controls="mobile-dev-submenu"
                      >
                        <span>Developer</span>
                        {mobileDevOpen ? (
                          <SlArrowUp className="text-lg" />
                        ) : (
                          <SlArrowDown className="text-lg" />
                        )}
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileDevOpen && (
                          <motion.div
                            id="mobile-dev-submenu"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col">
                              <Link
                                href="/developer/api-documentation"
                                className={cn(
                                  `w-full text-left no-underline px-8 py-3 text-base hover:text-secondary border-b border-bg-600/40`,
                                  {
                                    "text-secondary dark:text-primary dark:bg-bg-1100": isActive(
                                      "/developer/api-documentation"
                                    ),
                                    "text-text-200 dark:text-text-400": !isActive(
                                      "/developer/api-documentation"
                                    ),
                                  }
                                )}
                                onClick={() => {
                                  setOpen(false);
                                  setMobileDevOpen(false);
                                }}
                              >
                                API Documentation
                              </Link>
                              <Link
                                href="/developer/api-reference"
                                className={cn(
                                  `w-full text-left no-underline px-8 py-3 text-base hover:text-secondary`,
                                  {
                                    "text-secondary dark:text-primary dark:bg-bg-1100": isActive(
                                      "/developer/api-reference"
                                    ),
                                    "text-text-200 dark:text-text-400": !isActive(
                                      "/developer/api-reference"
                                    ),
                                  }
                                )}
                                onClick={() => {
                                  setOpen(false);
                                  setMobileDevOpen(false);
                                }}
                              >
                                API Reference
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Link href="/account-type" className="w-full px-6 mb-8">
                      <CustomButton
                        onClick={() => setOpen(false)}
                        className="mt-2 w-full rounded-2xl max-lg:px-6 bg-secondary"
                      >
                        Sign Up
                      </CustomButton>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      <DownloadPopupModal
        isOpen={openDownload}
        onClose={() => setOpenDownload(false)}
      />
    </>
  );
};

export default Navbar;
