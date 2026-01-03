import React from "react";
import toast, { Toast } from "react-hot-toast";
import { CgClose } from "react-icons/cg";
import Image from "next/image";
import icons from "../../../public/icons";

const ErrorToast = ({
  title,
  descriptions,
}: {
  title: string;
  descriptions?: string[];
}) => {
  const toastId = toast.custom(
    (t: Toast) => (
      <div
        className={`max-w-md w-full bg-white shadow-lg px-3 sm:px-4 py-4 sm:py-6 rounded-lg pointer-events-auto flex justify-between gap-4 border-x-8 border-border-300 ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
      >
        <div className="">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Image
                className="w-9"
                src={icons.toastErrorIcon}
                alt="errorIcon"
              />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-sm 2xs:text-base font-bold text-text-200">
                {title}
              </p>
              {descriptions &&
                descriptions.map((description, index) => (
                  <p
                    key={index}
                    className="text-xs 2xs:text-sm text-text-1000 capitalize"
                  >
                    {description}
                  </p>
                ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end pl-4 border-l border-border-400">
          <button
            onClick={() => toast.remove(toastId)}
            className="flex items-center justify-center"
            aria-label="Dismiss"
          >
            <CgClose className="text-black text-xl cursor-pointer" />
          </button>
        </div>
      </div>
    ),
    { id: "error-toast", duration: 10000 }
  );

  return null;
};

export default ErrorToast;
