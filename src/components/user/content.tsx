"use client";
import cn from "classnames";
import Navbar from "./Navbar";

const Content = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "flex flex-col overflow-y-auto transition-all duration-300 flex-1"
      )}
    >
      <Navbar />
      <main className="w-full px-4 md:px-6 py-4">
        {children}
      </main>
    </div>
  );
};

export default Content;
