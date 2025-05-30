"use client";

import Image from "next/image";
import images from "../../../public/images";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useNavigate from "@/hooks/useNavigate";
import Link from "next/link";
import { NavItems } from "@/constants/index";
import { useTheme } from "@/store/theme.store";
import Toggler from "../shared/Toggler";
import CustomButton from "../shared/Button";
import cn from "classnames";
import { SlClose, SlMenu } from "react-icons/sl";
import { motion, AnimatePresence } from "framer-motion";
import DownloadPopupModal from "../modals/DownloadPopupModal";

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDownload, setOpenDownload] = useState(false);

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
        <div
          className={`flex justify-center bg-bg-400 md:bg-bg-600 dark:bg-black text-text-200 py-3.5 w-full transition-all duration-300 ease-in-out ${
            scrolled ? "shadow-md" : ""
          }`}
        >
          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-between items-center w-[95%] lg:w-[90%]">
            <div className="flex items-center gap-6">
              <Image
                onClick={() => navigate("/")}
                src={images.logo}
                alt="logo"
                className="w-44 lg:w-48 h-auto"
              />
              <div className="flex justify-center items-center text-base gap-4 lg:gap-6">
                {NavItems.map((item) => (
                  <Link
                    href={item?.path}
                    key={item?.id}
                    className={cn(
                      `no-underline font-medium hover:text-secondary py-1`,
                      {
                        "text-primary border-b-2 border-primary": isActive(
                          item.path
                        ),
                        "text-text-200 dark:text-text-400": !isActive(
                          item.path
                        ),
                      }
                    )}
                  >
                    {item?.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 lg:gap-3.5">
              <Toggler />
              <CustomButton
                onClick={() => setOpenDownload(true)}
                className="rounded-3xl max-lg:px-6 bg-secondary"
              >
                Download App
              </CustomButton>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex text-white justify-between items-center w-[95%] lg:w-[90%]">
            <Image
              onClick={() => navigate("/")}
              src={images.logo}
              alt="logo"
              className="w-44 lg:w-48 h-auto my-auto" // Added my-auto for vertical centering
            />

            <div className="flex items-center justify-center gap-3.5 my-auto"> {/* Added my-auto */}
              <div className="flex items-center my-auto"> {/* Wrapper for Toggler */}
                <Toggler />
              </div>
              <CustomButton
                onClick={() => setOpenDownload(true)}
                className="max-md:hidden rounded-3xl max-lg:px-6 bg-secondary my-auto" // Added my-auto
              >
                Download App
              </CustomButton>
              <div
                onClick={() => setOpen(true)}
                className="cursor-pointer p-3 rounded-full text-text-200 dark:text-text-400 text-xl bg-bg-500 flex items-center my-auto" // Added flex items-center and my-auto
              >
                <SlMenu />
              </div>
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
                className="fixed md:hidden inset-0 bg-bg-700 dark:bg-bg-1000 z-50 overflow-y-auto h-[90%]"
              >
                <div className="flex flex-col items-center w-full bg-inherit h-full">
                  <div className="flex items-center justify-between w-full pt-10 pb-10 px-6">
                    <p></p>
                    <SlClose
                      onClick={() => setOpen(false)}
                      className="text-4xl text-text-500 dark:text-text-600 cursor-pointer"
                    />
                  </div>

                  <div className="w-full bg-transparent flex justify-center items-center flex-col gap-2.5 xs:gap-4">
                    {NavItems.map((item) => (
                      <Link
                        href={item?.path}
                        key={item?.id}
                        className={cn(
                          `w-full text-center no-underline py-3 text-base hover:text-secondary`,
                          {
                            "bg-bg-400": theme === "light",
                            "text-secondary dark:text-primary dark:bg-bg-1100":
                              isActive(item.path),
                            "text-text-200 dark:text-text-400": !isActive(
                              item.path
                            ),
                          }
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item?.title}
                      </Link>
                    ))}

                    <CustomButton
                      onClick={() => {
                        setOpenDownload(true);
                      }}
                      className="mt-2 w-[90%] rounded-3xl max-lg:px-6 bg-secondary"
                    >
                      Download App
                    </CustomButton>
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
