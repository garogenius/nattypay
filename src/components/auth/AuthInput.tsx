/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import {
  handleNumericKeyDown,
  handleNumericPaste,
} from "@/utils/utilityFunctions";
import Link from "next/link";
import React, { useState, forwardRef } from "react";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { AiOutlineEye } from "react-icons/ai";

type AuthInputProps = {
  id: string;
  label: string;
  htmlFor?: string;
  type?: string;
  forgotPassword?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  [key: string]: any;
};

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      id,
      type = "text",
      placeholder,
      error,
      disabled,
      required,
      label,
      htmlFor,
      icon,
      forgotPassword = false,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const inputType =
      type === "password" && open ? "text" : type == "number" ? "text" : type;

    return (
      <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
        <div className="w-full flex items-center justify-between">
          <label
            className="text-base text-text-800 mb-1 flex items-start "
            htmlFor={htmlFor}
          >
            {label}
          </label>

          {forgotPassword && (
            <Link
              href="/forgot-password"
              className=" text-primary flex self-end mb-1"
            >
              Forgot Password?
            </Link>
          )}
        </div>
        <div className="w-full flex gap-2 justify-center items-center bg-bg-2000 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
          {React.isValidElement(icon) && (
            <div className="flex items-center gap-2">{icon}</div>
          )}
          <input
            ref={ref}
            id={id}
            className="w-full bg-transparent p-0 border-none outline-none text-base text-black dark:text-white placeholder:text-text-700 dark:placeholder:text-text-1000 placeholder:text-sm [&::-webkit-calendar-picker-indicator]:dark:invert"
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            type={inputType}
            {...(type === "number"
              ? {
                  onKeyDown: handleNumericKeyDown,
                  onPaste: handleNumericPaste,
                }
              : {})}
            {...props}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="pl-2.5 "
            >
              {open ? (
                <AiOutlineEye cursor="pointer" />
              ) : (
                <AiOutlineEyeInvisible cursor="pointer" />
              )}
            </button>
          )}
        </div>

        {error ? (
          <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
