"use client";
import useUserStore from "@/store/user.store";
import BalanceCard from "../../BalanceCard";
import TransferNgnProcess from "./TransferNgnProcess";
import { CURRENCY } from "@/constants/types";

const AddFundsNgnContent = () => {
  const { user } = useUserStore();

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
        <BalanceCard
          wallets={user?.wallet?.filter((w) => w.currency === CURRENCY.NGN) || []}
          currencyAccounts={[]}
        />
      </div>
      <TransferNgnProcess />
    </div>
  );
};

export default AddFundsNgnContent;
