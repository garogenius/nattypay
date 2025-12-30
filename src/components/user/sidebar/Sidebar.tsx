"use client";
import MainSidebar from "./MainSidebar";
import cn from "classnames";
import useUserLayoutStore from "@/store/userLayout.store";

const Sidebar = () => {
  const { isMenuOpen, toggleMenu } = useUserLayoutStore();
  return (
    <>
      <div
        className={cn(
          "hidden lg:flex flex-col bg-bg-600 dark:bg-bg-1100 h-screen sticky z-50 transform transition-all duration-300 ease-in-out",
          {
            "lg:w-[240px] xl:w-[250px] 2xl:w-[260px]": true,
          }
        )}
      >
        <MainSidebar />
      </div>

      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[98]"
          onClick={toggleMenu} // Close the menu when clicking the overlay
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed z-[99] flex flex-col bg-bg-600 dark:bg-bg-1100 h-screen transition-transform duration-300 ease-in-out",
          {
            "translate-x-0 w-[80%] 2xs:w-[70%] xs:w-[60%] md:w-[50%]":
              isMenuOpen,
            "-translate-x-full": !isMenuOpen,
          }
        )}
      >
        <MainSidebar />
      </div>
    </>
  );
};

export default Sidebar;
