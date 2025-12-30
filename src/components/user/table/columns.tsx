// columns.ts
"use client";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { LuCopy } from "react-icons/lu";
import { Row } from "react-table";
import {
  BILL_TYPE,
  Transaction,
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
} from "@/constants/types";
import { handleCopy, shortenReference } from "@/utils/utilityFunctions";
import useNavigate from "@/hooks/useNavigate";
import useTransactionViewModalStore from "@/store/transactionViewModal.store";

const statusBadgeStyles: Record<string, string> = {
  success:
    "bg-green-500/15 text-green-400 border border-green-500/20",
  pending:
    "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  failed:
    "bg-red-500/15 text-red-400 border border-red-500/20",
};

export const GenerateColumns = () => {
  const navigate = useNavigate();
  const { open } = useTransactionViewModalStore();
  return [
    {
      Header: "Trx. Ref",
      accessor: "transactionRef",
      Cell: ({ value }: { value: string }) => {
        return (
          <div className="flex items-center gap-2">
            <p>{shortenReference({ ref: value })}</p>
            <button
              onClick={() => {
                handleCopy(value, () => {
                  toast.dismiss();
                  toast.success("Copied", {
                    duration: 3000,
                  });
                });
              }}
              className="hover:text-primary transition-colors"
            >
              <LuCopy className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
    {
      Header: "Category",
      accessor: "category",
      Cell: ({ value }: { value: TRANSACTION_CATEGORY }) => {
        return <span>{value}</span>;
      },
    },
    {
      Header: "Details",
      id: "details",
      accessor: "category",
      Cell: ({
        row,
        value,
      }: {
        row: Row<Transaction>;
        value: TRANSACTION_CATEGORY;
      }) => {
        if (value === TRANSACTION_CATEGORY.TRANSFER) {
          const transferDetails = row.original?.transferDetails;

          return (
            <span>
              To {transferDetails?.beneficiaryAccountNumber} -{" "}
              {transferDetails?.beneficiaryBankName} (
              {transferDetails?.beneficiaryName})
            </span>
          );
        } else if (value === TRANSACTION_CATEGORY.DEPOSIT) {
          const depositDetails = row.original?.depositDetails;
          return (
            <span>
              From {depositDetails?.senderAccountNumber} -{" "}
              {depositDetails?.senderBankName} ({depositDetails?.senderName})
            </span>
          );
        } else if (value === TRANSACTION_CATEGORY.BILL_PAYMENT) {
          const billDetails = row.original?.billDetails;

          return (
            <span className="capitalize">
              {billDetails?.type} purchase{" "}
              {billDetails.type !== BILL_TYPE.GIFTCARD &&
                `for ${billDetails?.recipientPhone}`}
            </span>
          );
        }
        return <span>N/A</span>;
      },
    },
    {
      Header: "Date & Time",
      accessor: "createdAt",
      Cell: ({ value }: { value: string }) => {
        return <span>{format(new Date(value), "yyyy-MM-dd '|' h:mm a")}</span>;
      },
    },
    // {
    //   Header: "Amount",
    //   id: "amount",
    //   accessor: "category",
    //   Cell: ({ value, row }: { value: string; row: Row<Transaction> }) => {
    //     if (value === TRANSACTION_CATEGORY.TRANSFER) {
    //       const transferDetails = row.original?.transferDetails;
    //       return <span>₦{transferDetails?.amount} </span>;
    //     } else if (value === TRANSACTION_CATEGORY.DEPOSIT) {
    //       const depositDetails = row.original?.depositDetails;
    //       return <span>₦{depositDetails?.amount}</span>;
    //     } else if (value === TRANSACTION_CATEGORY.BILL_PAYMENT) {
    //       const billDetails = row.original?.billDetails;
    //       return <span>₦{billDetails?.amount}</span>;
    //     }
    //     return <span>N/A</span>;
    //   },
    // },
    {
      Header: "Amount",
      id: "amountPaid",
      accessor: "category",
      Cell: ({ value, row }: { value: string; row: Row<Transaction> }) => {
        let raw = 0;
        let incoming = false;
        if (value === TRANSACTION_CATEGORY.TRANSFER) {
          raw = Number(row.original?.transferDetails?.amountPaid ?? 0);
          incoming = false; // transfers are outflow in history table
        } else if (value === TRANSACTION_CATEGORY.DEPOSIT) {
          raw = Number(row.original?.depositDetails?.amountPaid ?? 0);
          incoming = true; // deposits are inflow
        } else if (value === TRANSACTION_CATEGORY.BILL_PAYMENT) {
          raw = Number(row.original?.billDetails?.amountPaid ?? 0);
          incoming = false; // bill payments are outflow
        } else {
          return <span>N/A</span>;
        }

        const sign = incoming ? "+" : "-";
        const color = incoming ? "text-green-500" : "text-red-500";
        const amount = `₦${Number(raw || 0).toLocaleString()}`;
        return (
          <span className={`font-medium ${color}`}>{sign}{amount}</span>
        );
      },
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ value }: { value: TRANSACTION_STATUS }) => {
        const status = String(value || "").toLowerCase() as keyof typeof statusBadgeStyles;
        const label = status === "success" ? "Completed" : status.charAt(0).toUpperCase() + status.slice(1);
        const styles = statusBadgeStyles[status] || "bg-white/10 text-white border border-white/15";
        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
            {label}
          </span>
        );
      },
    },

    {
      Header: "Receipt",
      accessor: "",
      Cell: ({ row }: { row: Row<Transaction> }) => {
        const transaction = row.original;
        return (
          <button
            onClick={() => open(transaction)}
            className="text-white/90 hover:text-white underline underline-offset-4 cursor-pointer"
          >
            View
          </button>
        );
      },
    },
  ];
};
