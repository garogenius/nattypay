"use client";
import { useGetTransactions } from "@/api/wallet/wallet.queries";
import { useTheme } from "@/store/theme.store";
import { FiSearch, FiDownload } from "react-icons/fi";
import EmptyState from "../table/EmptyState";
import Table from "../table/Table";
import MobileTable from "../table/MobileTable";
import images from "../../../../public/images";
import Pagination from "../table/Pagination";
import Skeleton from "react-loading-skeleton";
import { useState } from "react";
import { GenerateColumns } from "../table/columns";
import TransactionsFilter from "../table/TransactionsFilter";
import { TRANSACTION_CATEGORY, TRANSACTION_STATUS } from "@/constants/types";
import DownloadStatementModal from "@/components/modals/transactions/DownloadStatementModal";

type FilterChangeEvent = {
  category?: TRANSACTION_CATEGORY;
  status?: TRANSACTION_STATUS;
};

const TransactionsContent = () => {
  const theme = useTheme();
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterChangeEvent>({});
  const [openDownload, setOpenDownload] = useState(false);

  const { transactionsData, isPending, isError } = useGetTransactions({
    page: pageNumber,
    limit: pageSize,
    search,
    ...filter,
  });

  const handleFilterChange = (filters: FilterChangeEvent) => {
    const filterOptions = {
      category: filters.category,
      status: filters.status,
    };
    setFilter(filterOptions);
  };

  const columns = GenerateColumns();

  const hasTransactions =
    transactionsData?.transactions && transactionsData.transactions.length > 0;
  const tableLoading = isPending && !isError;

  return (
    <div className="flex flex-col gap-5 md:gap-6 mt-2 md:mt-4">

      {/* Section header + controls */}
      <div className="flex flex-col gap-3">
        <div className="w-full flex items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div>
            <h2 className="text-white text-sm sm:text-base md:text-lg font-semibold">Transaction History</h2>
            <p className="text-white/60 text-xs sm:text-sm">View and manage all your transaction history</p>
          </div>
          <button
            onClick={() => setOpenDownload(true)}
            className="inline-flex items-center gap-1 sm:gap-2 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium rounded-lg px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm"
          >
            <FiDownload className="text-xs sm:text-sm" />
            <span className="hidden xs:inline">Download Statement</span>
            <span className="xs:hidden">Download</span>
          </button>
        </div>
        <div className="w-full flex items-center justify-between gap-2 sm:gap-3">
          <div className="w-[70%] xs:w-[60%] sm:w-[50%] md:w-[40%] 2xl:w-[30%] flex items-center gap-1 sm:gap-1.5 sm:gap-2 py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4 rounded-lg bg-white/5 border border-white/10">
            <FiSearch className="text-text-700 text-xs sm:text-sm md:text-base" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs sm:text-sm md:text-base outline-none bg-transparent placeholder:text-text-700 text-text-200 dark:text-text-400"
            />
          </div>
          <TransactionsFilter onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Table panel */}
      <div className="pb-10 w-full flex flex-col justify-center items-center gap-8 xs:gap-10">
        <div className="w-full bg-bg-600 dark:bg-bg-1100 rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-3 sm:px-4 pt-3 sm:pt-4">
          {tableLoading ? (
            <div className="flex flex-col gap-3 py-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-8"
                  baseColor={theme === "light" ? "#e0e0e0" : "#202020"}
                  highlightColor={theme === "light" ? "#f5f5f5" : "#444444"}
                />
              ))}
            </div>
          ) : hasTransactions ? (
            <>
              <div className="hidden md:block">
                <Table
                  data={transactionsData?.transactions || []}
                  columns={columns}
                  rowStyle={"secondary"}
                />
              </div>
              <div className="block md:hidden">
                <MobileTable
                  data={transactionsData?.transactions || []}
                  columns={columns}
                />
              </div>
            </>
          ) : (
            <EmptyState
              image={images.emptyState.emptyTransactions}
              title={"No transactions"}
              path={"/user/services"}
              placeholder={"Pay a bill"}
              showButton={false}
            />
          )}
          </div>
        </div>

        {hasTransactions && (
          <Pagination
            pageCount={transactionsData?.totalPages}
            onPageChange={(newPage) => setPageNumber(newPage)}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            pageNumber={pageNumber}
          />
        )}
      </div>

      {/* Modals */}
      <DownloadStatementModal isOpen={openDownload} onClose={() => setOpenDownload(false)} />
    </div>
  );
};

export default TransactionsContent;
