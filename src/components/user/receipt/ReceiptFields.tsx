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
      // Hide reference fields if transaction failed

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
            "yyyy-MM-dd '|' h:mm a"
          );
        }

        
        if (field.label === "Category" && transaction.category === TRANSACTION_CATEGORY.TRANSFER) {
          const isInterBank = transaction.transferDetails?.beneficiaryBankName && 
            transaction.transferDetails.beneficiaryBankName.toLowerCase() !== 'nattypay';
          return isInterBank ? "Inter Bank Transfer" : "Intra Bank Transfer";
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

        if (field.label === "Total Amount Paid" || 
          field.label === "Balance Before" || 
          field.label === "Balance After") {
        return formatNumberWithCommas(String(value ?? "0"));
      }


        return String(value ?? "0");
      }),
      isStatus: field.label === "Status",
      isReference:
        field.label === "Transaction Ref" || field.label === "Reference",
    }));
};

export const depositFields = [

  { label: "Category", value: "{category}" },
  { label: "Currency", value: "{currency}" },
  { label: "Transaction Type", value: "{type}" },

  { label: "Total Amount Paid", value: "₦{depositDetails.amountPaid}" },
  { label: "Sender Name", value: "{depositDetails.senderName}" },
  { label: "Sender Bank Name", value: "{depositDetails.senderBankName}" },
  {
    label: "Sender Account Number",
    value: "{depositDetails.senderAccountNumber}",
  },

  { label: "Beneficiary Name", value: "{depositDetails.beneficiaryName}" },
  {
    label: "Beneficiary Bank Name",
    value: "{depositDetails.beneficiaryBankName}",
  },
  {
    label: "Beneficiary Account Number",
    value: "{depositDetails.beneficiaryAccountNumber}",
  },

  { label: "Status", value: "{status}" },

  { label: "Balance Before", value: "₦{previousBalance}" },
  { label: "Balance After", value: "₦{currentBalance}" },
  { label: "Date & Time", value: "{createdAt}" },
  { label: "Transaction Ref", value: "{transactionRef}" },
];

export const transferFields = [

  { label: "Category", value: "{category}" },
  { label: "Currency", value: "{currency}" },
  { label: "Transaction Type", value: "{type}" },

  { label: "Total Amount Paid", value: "₦{transferDetails.amountPaid}" },
  { label: "Sender Name", value: "{transferDetails.senderName}" },
 

  { label: "Beneficiary Name", value: "{transferDetails.beneficiaryName}" },
  {
    label: "Beneficiary Bank Name",
    value: "{transferDetails.beneficiaryBankName}",
  },
  {
    label: "Beneficiary Account Number",
    value: "{transferDetails.beneficiaryAccountNumber}",
  },

  { label: "Status", value: "{status}" },

  { label: "Balance Before", value: "₦{previousBalance}" },
  { label: "Balance After", value: "₦{currentBalance}" },
  { label: "Date & Time", value: "{createdAt}" },
  { label: "Transaction Ref", value: "{transferDetails.sessionId}" },
];

export const networksFields = [

  { label: "Category", value: "{category}" },
  { label: "Currency", value: "{currency}" },
  { label: "Transaction Type", value: "{type}" },

  { label: "Total Amount Paid", value: "₦{billDetails.amountPaid}" },
  { label: "Bill Type", value: "{billDetails.type}" },
  { label: "Network", value: "{billDetails.network}" },
  { label: "Recipient", value: "{billDetails.recipientPhone}" },

  { label: "Status", value: "{status}" },

  { label: "Balance Before", value: "₦{previousBalance}" },
  { label: "Balance After", value: "₦{currentBalance}" },
  { label: "Date & Time", value: "{createdAt}" },
  { label: "Transaction Ref", value: "{transactionRef}" },
];

export const electricityFields = [

  { label: "Category", value: "{category}" },
  { label: "Currency", value: "{currency}" },
  { label: "Transaction Type", value: "{type}" },

  { label: "Total Amount Paid", value: "₦{billDetails.amountPaid}" },
  { label: "Bill Type", value: "{billDetails.type}" },
  { label: "Recipient", value: "{billDetails.recipientPhone}" },
  { label: "Reference", value: "{billDetails.reference}" },

  { label: "Status", value: "{status}" },

  { label: "Balance Before", value: "₦{previousBalance}" },
  { label: "Balance After", value: "₦{currentBalance}" },
  { label: "Date & Time", value: "{createdAt}" },
  { label: "Transaction Ref", value: "{transactionRef}" },
];

export const giftCardFields = [

  { label: "Category", value: "{category}" },
  { label: "Currency", value: "{currency}" },
  { label: "Transaction Type", value: "{type}" },

  { label: "Total Amount Paid", value: "₦{billDetails.amountPaid}" },
  { label: "Bill Type", value: "{billDetails.type}" },
  { label: "Transaction ID", value: "{billDetails.transactionId}" },

  { label: "Status", value: "{status}" },

  { label: "Balance Before", value: "₦{previousBalance}" },
  { label: "Balance After", value: "₦{currentBalance}" },
  { label: "Date & Time", value: "{createdAt}" },
  { label: "Transaction Ref", value: "{transactionRef}" },
];

export const defaultBillsFields = [

  { label: "Category", value: "{category}" },
  { label: "Currency", value: "{currency}" },
  { label: "Transaction Type", value: "{type}" },

  { label: "Total Amount Paid", value: "₦{billDetails.amountPaid}" },
  { label: "Bill Type", value: "{billDetails.type}" },
  { label: "Recipient", value: "{billDetails.recipientPhone}" },

  { label: "Status", value: "{status}" },

  { label: "Balance Before", value: "₦{previousBalance}" },
  { label: "Balance After", value: "₦{currentBalance}" },
  { label: "Date & Time", value: "{createdAt}" },
  { label: "Transaction Ref", value: "{transactionRef}" },
];

export const getBillsFields = (transaction: Transaction) => {
  const billsFields =
    transaction.billDetails?.type === BILL_TYPE.AIRTIME ||
    transaction.billDetails?.type === BILL_TYPE.DATA
      ? networksFields
      : transaction.billDetails?.type === BILL_TYPE.ELECTRICITY
      ? electricityFields
      : transaction.billDetails?.type === BILL_TYPE.GIFTCARD
      ? giftCardFields
      : defaultBillsFields;
  switch (transaction?.category) {
    case TRANSACTION_CATEGORY.DEPOSIT:
      return depositFields;
    case TRANSACTION_CATEGORY.BILL_PAYMENT:
      return billsFields;
    case TRANSACTION_CATEGORY.TRANSFER:
      return transferFields;

    default:
      return [];
  }
};

const ReceiptContainer = () => {
  const { transaction } = useTransactionStore();

  if (!transaction) return null;

  const fields = getBillsFields(transaction);
  const formattedDate = transaction?.createdAt ? 
    format(new Date(transaction.createdAt), "EEEE, MMMM d, yyyy h:mm a") : "";

  return (
    <div id="receipt-container" className="flex flex-col max-w-md mx-auto overflow-hidden rounded-2xl shadow-lg">

      <div className="bg-amber-100 p-4 rounded-b-2xl relative">
   
        <div className="absolute -left-3 -top-1 w-6 h-6 bg-white rounded-full"></div>
        <div className="absolute -right-3 -top-1 w-6 h-6 bg-white rounded-full"></div>
        
        <div className="flex items-center justify-between mb-3">
  <div className="flex items-center bg-white p-2 rounded-lg"> {/* Added bg-white, p-2, and rounded-lg */}
    <Image 
      src={images.logo} 
      alt="logo" 
      className="h-8 w-auto font-bold" // Added font-bold
      style={{ objectFit: 'contain' }} // Ensures logo maintains its aspect ratio
    />
  </div>
  <div className="text-gray-700 text-sm font-medium">
    Smart Banking
  </div>
</div>
        
        <h1 className="text-xl font-bold text-center text-gray-800 mb-1">Transaction Receipt</h1>
        <p className="text-xs text-center text-gray-500">
          Generated by Nattypay on {formattedDate}
        </p>
      </div>

      {/* Transaction details */}
      <div className="bg-white">
        {getTransactionDetails(transaction, fields)
          .filter(
            (detail) =>
       
              detail.label !== "Balance Before" &&
              detail.label !== "Balance After"
          )
          .map((detail, index) => (
            // <div
            //   key={index}
            //   className="border-b border-gray-100 px-4 py-2 w-full flex items-center justify-between"
            // >
            //   <p className="text-amber-100 text-xs font-medium">{detail.label}</p>
            //   {detail.isStatus ? (
            //     <span
            //       className={`px-2 py-2 rounded-full text-xs font-medium ${detail.value.toLowerCase() === "success" ? "bg-green-100 text-green-600" : detail.value.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}
            //     >
            //       {detail.value}
            //     </span>
            //   ) : (
            //     <p className="text-gray-800 text-xs font-medium text-right">{detail.value}</p>
            //   )}
            // </div>

            <div
  key={index}
  className="border-b border-gray-100 px-4 py-2 w-full flex items-center justify-between"
>
  <p className="text-amber-300 text-xs font-medium">{detail.label}</p>
  {detail.isStatus ? (
    <span
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium ${
        detail.value.toLowerCase() === "success"
          ? " text-green-600"
          : detail.value.toLowerCase() === "pending"
          ? " text-yellow-600"
          : "text-red-600"
      }`}
    >
      {detail.value}
    </span>
  ) : (
    <p className="text-gray-800 text-xs font-medium text-right">{detail.value}</p>
  )}
</div>
          ))}
      </div>

      {/* Footer with contact info */}
      <div className="bg-white p-3 text-center border-t border-gray-100 rounded-b-2xl">
        <p className="text-xs text-gray-500 mb-1">
          If You Have Questions Or You Would Like To Know More Informations About NattyPay, Please Call Our 24/7 Contact Centre On <span className="text-amber-500">+2348134146906</span> Or Send Us Mail To <a href="mailto:support@nattypay.com" className="text-amber-500">support@nattypay.com</a>
        </p>
        <p className="text-xs text-gray-500">
          Thanks For Choosing Nattypay
        </p>
      </div>
    </div>
  );
};

export default ReceiptContainer;
