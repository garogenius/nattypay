import { useState, ReactNode } from "react";
import { IoSearchOutline } from "react-icons/io5";
import SpinnerLoader from "../Loader/SpinnerLoader";

interface SearchableDropdownProps<T> {
  items: T[];
  searchKey: keyof T;
  displayFormat: (item: T) => string | ReactNode;
  onSelect: (item: T) => void;
  placeholder?: string;
  showSearch?: boolean;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const SearchableDropdown = <T extends object>({
  items,
  searchKey,
  displayFormat,
  onSelect,
  showSearch = true,
  placeholder = "Search...",
  isLoading,
  isOpen,
  onClose,
}: SearchableDropdownProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredItems = items?.filter((item) =>
    String(item[searchKey]).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-fit flex flex-col ">
      {showSearch ? (
        <div className="relative my-2 mx-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-3 py-2 rounded-md bg-bg-2400 dark:bg-bg-2100 border border-border-600 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4B139]"
          />
          <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      ) : null}

      <div className="h-fit">
        {isLoading ? (
          <div className="flex items-center gap-2 p-2 text-text-200 dark:text-text-400">
            <SpinnerLoader width={25} height={25} color="#d4b139" />
            <p>Fetching...</p>
          </div>
        ) : (
          <>
            {" "}
            {filteredItems?.length > 0 ? (
              filteredItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => { onSelect(item); onClose(); }}
                  className="hover:opacity-80 w-full flex items-center justify-between px-4 py-2 gap-2 cursor-pointer"
                >
                  <span className="w-full text-sm">{displayFormat(item)}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No results found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchableDropdown;
