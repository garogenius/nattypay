import Image, { StaticImageData } from "next/image";

type Option = {
  value: string;
  label: string;
  logo?: StaticImageData | string;
  [key: string]: unknown; // Allow for additional properties
};

interface CustomSelectProps {
  options: Option[];
  value: Option | null;
  onChange: (option: Option) => void;
  placeholder?: string;
  className?: string;
  isSearchable?: boolean;
  renderOption?: (option: Option) => React.ReactNode;
  renderSelected?: (option: Option) => React.ReactNode;
  searchPlaceholder?: string;
  maxHeight?: string;
  disabled?: boolean;
  selectClassName?: string;
  placeholderClassName?: string;
  loading?: boolean;
}

import { cn } from "@/utils/cn";
import React, { useState, useEffect, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";
import SpinnerLoader from "./Loader/SpinnerLoader";

const CustomSelect: React.FC<CustomSelectProps> = ({
  options = [],
  value = null,
  onChange,
  placeholder = "Select...",
  className = "",
  isSearchable = true,
  renderOption = null,
  renderSelected = null,
  searchPlaceholder = "Search...",
  maxHeight = "60",
  disabled = false,
  selectClassName = "",
  placeholderClassName = "",
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const defaultRenderOption = (option: Option) => (
    <div className="flex items-center gap-2">
      {option.logo && (
        <Image
          src={option.logo}
          alt={`${option.label} logo`}
          className="w-9 h-9 rounded-full"
        />
      )}
      <span>{option.label}</span>
    </div>
  );

  const defaultRenderSelected = (option: Option) => (
    <div className="flex items-center gap-2 h-full py-2">
      {option.logo && (
        <Image
          src={option.logo}
          width={20}
          height={20}
          alt={`${option.label} logo`}
          className="w-9 h-9 rounded-full"
        />
      )}
      <span className="text-sm">{option.label}</span>
    </div>
  );

  const renderOptionFn = renderOption || defaultRenderOption;
  const renderSelectedFn = renderSelected || defaultRenderSelected;

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full otline-none border-none text-left rounded-lg 
          flex items-center justify-between transition-colors
          ${
            disabled
              ? "bg-gray-50 cursor-not-allowed text-gray-400"
              : "hover:border-gray-400"
          }
          ${selectClassName}
        `}
      >
        <div className="flex-1 truncate">
          <div className="flex items-center gap-2">
            {loading && <SpinnerLoader />}
            {value ? (
              renderSelectedFn(value)
            ) : (
              <span className={placeholderClassName}>{placeholder}</span>
            )}
          </div>
        </div>
        <IoIosArrowDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ml-2
            ${isOpen ? "transform rotate-180" : ""}
            ${disabled ? "text-gray-400" : ""}
          `}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute w-full mt-1 bg-bg-1100 border border-border-700 text-white rounded-lg shadow-lg z-[9999]">
          {isSearchable && (
            <div className="p-2 border-b">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none bg-bg-1000 border-border-700 text-white placeholder:text-white/50"
                autoFocus
              />
            </div>
          )}

          <div className={`overflow-y-auto`} style={{ maxHeight: typeof maxHeight === 'string' ? `${maxHeight}px` : undefined }}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-white/60 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center transition-colors"
                >
                  {renderOptionFn(option)}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
