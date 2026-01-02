import { DashboardSortList } from "@/constants";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { motion } from "framer-motion";
import { SetStateAction, Dispatch, useRef, useState } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { MdFilterListAlt, MdKeyboardArrowDown } from "react-icons/md";

const StatsFilter = ({
  sort,
  setSort,
}: {
  sort: string;
  setSort: Dispatch<SetStateAction<"all" | "today" | "week" | "month" | "year">>;
}) => {
  const [sortModalState, setSortModalState] = useState(false);

  const sortModalStateRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(sortModalStateRef, () => setSortModalState(false));

  return (
    <div className="w-full flex items-center justify-between gap-2 mb-8">
      <p className="text-text-200 dark:text-text-400 font-semibold text-lg xs:text-xl">
        Analytics{" "}
      </p>
      <div ref={sortModalStateRef} className="flex flex-col relative">
        <p
          onClick={() => {
            setSortModalState(!sortModalState);
          }}
          className="cursor-pointer hidden xs:flex justify-center items-center gap-1 py-2 xl:py-2.5 px-3.5 rounded-full bg-secondary text-black text-sm font-semibold"
        >
          {!sort
            ? "All Time"
            : DashboardSortList.find((item) => item.value === sort)?.label}
          <motion.span
            animate={{ rotate: sortModalState ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-base 2xs:text-lg"
          >
            <MdKeyboardArrowDown />
          </motion.span>
        </p>
        <MdFilterListAlt
          onClick={() => {
            setSortModalState(!sortModalState);
          }}
          className={`xs:hidden text-2xl  cursor-pointer ${
            sort ? "text-secondary" : "text-text-200"
          }`}
        />
        {sortModalState ? (
          <div className="bg-white dark:bg-black absolute flex flex-col self-end mt-12 w-48 sm:w-60 rounded-xl shadow-2xl">
            {DashboardSortList.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-4 font-semibold cursor-pointer ${
                  index !== DashboardSortList?.length - 1
                    ? "border-b border-border-200 dark:border-border-700"
                    : ""
                }`}
                onClick={() => {
                  setSort(item.value as "all" | "today" | "week" | "month" | "year");
                  setSortModalState(false);
                }}
              >
                {sort == item.value ? (
                  <IoMdCheckmark className="text-text-200 dark:text-text-400" />
                ) : null}
                <span className="text-text-200 dark:text-text-400 text-xs sm:text-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StatsFilter;
