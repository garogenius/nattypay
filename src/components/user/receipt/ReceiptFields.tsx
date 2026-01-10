import images from "../../../../public/images";

import Image from "next/image";
import { format } from "date-fns";
import useTransactionStore from "@/store/useTransaction.store";

import {
  BILL_TYPE,
  Transaction,
  TRANSACTION_CATEGORY,
} from "@/constants/types";
import { formatNumberWithCommas } from "@/utils/utilityFunctions";

type FieldMapping = {
  label: string;
  value: string;
};

export const statusStyles: Record<string, string> = {
  default: "px-3 py-1.5 rounded-full text-xs font-medium capitalize",
  defaultReceipt: "px-3 pb-3.5 rounded-full text-xs font-medium capitalize",
  success: "bg-green-400 text-green-800",
  pending: "bg-yellow-400 text-yellow-800",
  failed: "bg-red-400 text-red-800",
};

const formatSenderName = (senderName: string) => {
  return senderName?.replace(/^(NATTYPAY|NATTYPAYGLOBALS)\s*\/\s*/, '') || '';
};

export const getTransactionDetails = (
  transaction: Transaction,
  fields: FieldMapping[]
): {
  label: string;
  value: string;
  isStatus?: boolean;
  isReference?: boolean;
}[] => {
  const isFailedTransaction = transaction?.status?.toLowerCase() === "failed";

  return fields
    .filter((field) => {
      if (isFailedTransaction) {
        return !["Reference", "Transaction ID"].includes(field.label);
      }
      return true;
    })
    .map((field) => ({
      label: field.label,
      value: field.value.replace(/\{([^}]+)\}/g, (match, key: string) => {
        if (key === "createdAt") {
          return format(
            new Date(transaction.createdAt),
            "dd-MM-yyyy hh:mm a"
          ).toUpperCase();
        }

        if (field.label === "Transaction Date" && field.value === "{category}") {
           // This is the second 'Transaction Date' row in the screenshot which shows the type/category
           if (transaction.category === TRANSACTION_CATEGORY.TRANSFER) {
             const isInterBank = transaction.transferDetails?.beneficiaryBankName && 
               transaction.transferDetails.beneficiaryBankName.toLowerCase() !== 'nattypay';
             return isInterBank ? "Inter-bank Transfer" : "Intra-bank Transfer";
           }
           if (transaction.category === TRANSACTION_CATEGORY.DEPOSIT) return "Merchant Deposit";
           if (transaction.category === TRANSACTION_CATEGORY.BILL_PAYMENT) return transaction.billDetails?.type || "Bill Payment";
           return transaction.category;
        }

        // Handle nested properties
        const props = key.split(".");
        let value: unknown = transaction;
        for (const prop of props) {
          if (value && typeof value === "object") {
            value = (value as Record<string, unknown>)[prop];
          } else {
            value = undefined;
          }
        }

        if (field.label === "Sender Name" || field.label === "Beneficiary Name") {
          return formatSenderName(String(value ?? ""));
        }

        if (field.label === "Amount" || 
          field.label === "Balance Before" || 
          field.label === "Balance After") {
        return `₦${formatNumberWithCommas(String(value ?? "0"))}`;
      }

        return String(value ?? "0");
      }),
      isStatus: field.label === "Status",
      isReference:
        field.label === "Transaction Ref" || field.label === "Reference",
    }));
};

// Unified fields array to match the screenshot's exact order
export const receiptFieldsSequence = [
  { label: "Transaction Date", value: "{createdAt}" },
  { label: "Transaction ID", value: "{transactionRef}" },
  { label: "Amount", value: "{amount}" }, // Handled in mapping
  { label: "Currency", value: "{currency}" },
  { label: "Transaction Date", value: "{category}" }, // Screenshot shows 'Transaction Date' again for the type
  { label: "Sender Name", value: "{senderName}" },
  { label: "Beneficiary Details", value: "{beneficiaryName}" },
  { label: "Beneficiary Bank", value: "{beneficiaryBank}" },
  { label: "Narration", value: "{narration}" },
  { label: "Status", value: "{status}" },
];

const ReceiptContainer = () => {
  const { transaction } = useTransactionStore();

  if (!transaction) return null;

  // Derive values for the unified fields
  const category = transaction.category;
  const amount = ((): string => {
    if (category === TRANSACTION_CATEGORY.TRANSFER) return transaction.transferDetails?.amountPaid ?? transaction.transferDetails?.amount ?? "0";
    if (category === TRANSACTION_CATEGORY.DEPOSIT) return transaction.depositDetails?.amountPaid ?? transaction.depositDetails?.amount ?? "0";
    if (category === TRANSACTION_CATEGORY.BILL_PAYMENT) return transaction.billDetails?.amountPaid ?? transaction.billDetails?.amount ?? "0";
    return "0";
  })();

  const walletName = transaction.wallet?.accountName || transaction.wallet?.user?.fullname || "-";
  const walletAccount = transaction.wallet?.accountNumber || "-";
  const walletBank = transaction.wallet?.bankName || "NattyPay";

  let senderName = "-";
  let beneficiaryName = "-";
  let beneficiaryBank = "-";
  let beneficiaryAccount = "";

  if (category === TRANSACTION_CATEGORY.TRANSFER) {
    senderName = transaction.transferDetails?.senderName || walletName;
    beneficiaryName = transaction.transferDetails?.beneficiaryName || "-";
    beneficiaryAccount = transaction.transferDetails?.beneficiaryAccountNumber || "";
    beneficiaryBank = transaction.transferDetails?.beneficiaryBankName || "-";
  } else if (category === TRANSACTION_CATEGORY.DEPOSIT) {
    senderName = transaction.depositDetails?.senderName || "-";
    beneficiaryName = walletName;
    beneficiaryAccount = walletAccount;
    beneficiaryBank = walletBank;
  } else if (category === TRANSACTION_CATEGORY.BILL_PAYMENT) {
    senderName = walletName;
    beneficiaryName = transaction.billDetails?.recipientPhone || transaction.billDetails?.billerName || "-";
    beneficiaryBank = transaction.billDetails?.billerName || "-";
  }

  const narration = transaction.description || transaction.billDetails?.type || "-";

  // Override transaction object temporarily for display mapping
  const displayTx = {
    ...transaction,
    amount,
    senderName,
    beneficiaryName,
    beneficiaryBank,
    narration,
    transactionRef: transaction.transactionRef || transaction.transferDetails?.sessionId || transaction.depositDetails?.reference || "-"
  };

  const details = getTransactionDetails(displayTx as any, receiptFieldsSequence);

  return (
    <div
      id="receipt-container"
      className="flex flex-col w-full max-w-[500px] mx-auto overflow-hidden bg-white dark:bg-[#0B0F1A] p-6 sm:p-8 transition-colors duration-200"
    >
      {/* Header section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Image
            src={images.logo}
            alt="NattyPay Logo"
            width={120}
            height={40}
            className="h-8 w-auto object-contain dark:brightness-200"
          />
        </div>
        <div className="text-black dark:text-white text-sm font-medium">
          Smart Banking
        </div>
      </div>

      {/* Center Badge */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#D4B139] text-white px-8 py-2.5 rounded-lg font-semibold text-lg shadow-sm">
          Transaction Receipt
        </div>
      </div>

      {/* Transaction details list */}
      <div className="flex flex-col gap-0 w-full mb-8">
        {details.map((detail, index) => {
          let displayValue = detail.value;
          
          // Format beneficiary details to include account number in brackets if it exists
          if (detail.label === "Beneficiary Details" && beneficiaryAccount) {
            displayValue = `${detail.value} (${beneficiaryAccount})`;
          }

          return (
            <div key={index} className="w-full">
              <div className="w-full border-t border-dotted border-[#D4B139] border-[1.5px] opacity-100 my-0"></div>
              
              <div className="flex items-center justify-between py-4 px-1">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">
                  {detail.label}
                </p>
                {detail.isStatus ? (
                  <span className="text-[#068E44] dark:text-[#64D284] text-sm font-semibold">
                    {detail.value.toLowerCase() === "success" ? "Successful" : detail.value}
                  </span>
                ) : (
                  <p className="text-black dark:text-white text-sm font-semibold text-right">
                    {displayValue}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div className="w-full border-t border-dotted border-[#D4B139] border-[1.5px] opacity-100 my-0"></div>
      </div>

      {/* Footer with contact info */}
      <div className="mt-auto pt-4 text-left">
        <p className="text-[11px] sm:text-[12px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
          Thank you for banking with NattyPay. For support, contact us at{" "}
          <span className="font-semibold">Support@nattypay.com</span>, call{" "}
          <span className="font-semibold">+2348134146906</span> or Head Office:
          C3&C4 Suite 2nd Floor Ejison Plaza 9a New Market Road Main Market
          Onitsha
        </p>
      </div>
    </div>
  );
};

export default ReceiptContainer;
