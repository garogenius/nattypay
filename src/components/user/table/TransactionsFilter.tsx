"use client";
import { useRef, useState } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { BiFilterAlt } from "react-icons/bi";
import cn from "classnames";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { TRANSACTION_STATUS } from "@/constants/types";
import { TRANSACTION_CATEGORY } from "@/constants/types";

type FilterCategory = "category" | "status";
type FilterState = {
  category?: TRANSACTION_CATEGORY;
  status?: TRANSACTION_STATUS;
  // dateRange?: [string, string];
};

type FilterProps = {
  onFilterChange: (filters: FilterState) => void;
};

const TransactionsFilter = ({ onFilterChange }: FilterProps) => {
  const [openPanel, setOpenPanel] = useState<FilterCategory | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({});
  const filterRef = useRef<HTMLDivElement>(null);
  // const [dateRange, setDateRange] = useState<
  //   [Date | undefined, Date | undefined]
  // >([undefined, undefined]);
  // const [startDate, endDate] = dateRange;

  useOnClickOutside(filterRef, () => setOpenPanel(null));

  const filterCategories = {
    category: [
      { label: "Transfer", value: "TRANSFER" },
      { label: "Deposit", value: "DEPOSIT" },
      { label: "Bill Payment", value: "BILL_PAYMENT" },
    ],

    status: [
      { label: "Processing", value: "pending" },
      { label: "Successful", value: "success" },
      { label: "Failed", value: "failed" },
    ],
  };

  const statusVisualList: { label: string; mapsTo?: string }[] = [
    { label: "All Status" },
    { label: "Processing", mapsTo: "pending" },
    { label: "Successful", mapsTo: "success" },
    { label: "Failed", mapsTo: "failed" },
    { label: "Cancelled" },
    { label: "Refunded" },
    { label: "Recent" },
  ];

  // Full visual category list to match the screenshot. Only a subset maps to existing enums.
  const categoryVisualList: { label: string; mapsTo?: string }[] = [
    { label: "All categories" },
    { label: "Intra-bank Transfer", mapsTo: "TRANSFER" },
    { label: "Inter-bank transfer", mapsTo: "TRANSFER" },
    { label: "Airtime", mapsTo: "BILL_PAYMENT" },
    { label: "Betting" },
    { label: "Mobile Data", mapsTo: "BILL_PAYMENT" },
    { label: "Flight" },
    { label: "Hotel" },
    { label: "Electricity", mapsTo: "BILL_PAYMENT" },
    { label: "Cable Tv", mapsTo: "BILL_PAYMENT" },
    { label: "Insurance" },
    { label: "Shopping" },
    { label: "Health" },
    { label: "Education" },
    { label: "Government" },
    { label: "International Airtime" },
    { label: "Water" },
    { label: "Bus Tickets" },
    { label: "Movie Tickets" },
    { label: "TSA & States" },
    { label: "Sell Giftcards" },
    { label: "Buy Giftcards" },
    { label: "Convert Currency" },
  ];

  const handleFilterClick = (category: FilterCategory, value: string) => {
    const newFilters = {
      ...selectedFilters,
      [category]: selectedFilters[category] === value ? undefined : value,
    };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  // const handleDateChange = (update: [Date | null, Date | null]) => {
  //   // Convert null to undefined for the dateRange state
  //   const dateRangeUpdate: [Date | undefined, Date | undefined] = [
  //     update[0] || undefined,
  //     update[1] || undefined,
  //   ];
  //   setDateRange(dateRangeUpdate);

  //   const dateStrings: [string, string] = [
  //     update[0] ? update[0].toISOString() : "",
  //     update[1] ? update[1].toISOString() : "",
  //   ];

  //   setSelectedFilters((prev) => ({
  //     ...prev,
  //     dateRange: dateStrings,
  //   }));

  //   onFilterChange({
  //     ...selectedFilters,
  //     dateRange: dateStrings,
  //   });
  // };

  const handleClearFilters = () => {
    setSelectedFilters({});
    // setDateRange([undefined, undefined]);
    onFilterChange({});
  };

  return (
    <div ref={filterRef} className="relative flex items-center gap-2">
      {/* Category trigger */}
      <div className="relative">
        <button
          onClick={() => setOpenPanel(openPanel === "category" ? null : "category")}
          className={cn(
            "rounded-lg px-3.5 py-2 bg-bg-600 dark:bg-bg-1100 text-text-200 dark:text-text-400 border",
            {
              "border-transparent": !selectedFilters.category,
              "border-secondary": !!selectedFilters.category,
            }
          )}
        >
          {selectedFilters.category ? "Category" : "All categories"}
        </button>
        {openPanel === "category" && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-bg-600 dark:bg-bg-1100 shadow-xl z-50">
            <div className="p-3">
              <div className="rounded-full bg-white/10 text-white/90 text-sm px-3 py-2">All categories</div>
              <div className="mt-2 flex flex-col max-h-96 overflow-auto pr-1 no-scrollbar">
                {categoryVisualList.map((item, idx) => {
                  const isHeader = idx === 0; // the 'All categories' pill already rendered above
                  if (isHeader) return null;
                  const isMapped = !!item.mapsTo;
                  const isSelected =
                    isMapped && selectedFilters.category === item.mapsTo;
                  return (
                    <button
                      key={item.label}
                      onClick={() =>
                        isMapped && handleFilterClick("category", item.mapsTo!)
                      }
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm",
                        isMapped
                          ? isSelected
                            ? "bg-white/10 text-white"
                            : "hover:bg-white/5 text-white/80"
                          : "text-white/50 cursor-not-allowed"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={() => setOpenPanel(null)} className="px-4 py-2 rounded-lg bg-[#D4B139] hover:bg-[#c7a42f] text-black text-sm font-medium">Done</button>
              </div>
              {(selectedFilters.category || selectedFilters.status) && (
                <div className="mt-2 flex justify-end">
                  <button onClick={handleClearFilters} className="text-xs text-white/70 hover:text-white flex items-center gap-1">
                    <IoIosCloseCircleOutline className="text-base" /> Clear active filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status trigger */}
      <div className="relative">
        <button
          onClick={() => setOpenPanel(openPanel === "status" ? null : "status")}
          className={cn(
            "rounded-lg px-3.5 py-2 bg-bg-600 dark:bg-bg-1100 text-text-200 dark:text-text-400 border",
            {
              "border-transparent": !selectedFilters.status,
              "border-secondary": !!selectedFilters.status,
            }
          )}
        >
          {selectedFilters.status ? "Status" : "All Status"}
        </button>
        {openPanel === "status" && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-bg-600 dark:bg-bg-1100 shadow-xl z-50">
            <div className="p-3">
              <div className="rounded-full bg-white/10 text-white/90 text-sm px-3 py-2">All Status</div>
              <div className="mt-2 flex flex-col">
                {statusVisualList.map((item, idx) => {
                  const isHeader = idx === 0;
                  if (isHeader) return null;
                  const isMapped = !!item.mapsTo;
                  const isSelected = isMapped && selectedFilters.status === item.mapsTo;
                  return (
                    <button
                      key={item.label}
                      onClick={() => isMapped && handleFilterClick("status", item.mapsTo!)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm",
                        isMapped
                          ? isSelected
                            ? "bg-white/10 text-white"
                            : "hover:bg-white/5 text-white/80"
                          : "text-white/50 cursor-not-allowed"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={() => setOpenPanel(null)} className="px-4 py-2 rounded-lg bg-[#D4B139] hover:bg-[#c7a42f] text-black text-sm font-medium">Done</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsFilter;
