"use client";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";
import useTransactionStore from "@/store/useTransaction.store";
import useNavigate from "@/hooks/useNavigate";
import { LuCopy } from "react-icons/lu";
import toast from "react-hot-toast";
import ReceiptContainer, {
  getBillsFields,
  getTransactionDetails,
  statusStyles,
} from "./ReceiptFields";
import CustomButton from "@/components/shared/Button";
import { TRANSACTION_STATUS } from "@/constants/types";
import { shortenReference } from "@/utils/utilityFunctions";

interface TransactionDetail {
  label: string;
  value: string;
  fullValue?: string;
  isStatus?: boolean;
  isReference?: boolean;
}

const TransactionReceipt = () => {
  const transaction = useTransactionStore((state) => state.transaction);
  console.log("Transaction Receipt" , transaction);
  const navigate = useNavigate();
  if (!transaction) return null;
  const fields = getBillsFields(transaction);

  const handleDownload = async () => {
    console.log("downloading");

    // Create a temporary div and render the receipt
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    document.body.appendChild(tempDiv);

    // Create root and render the ReceiptContainer content into the temp div
    const root = createRoot(tempDiv);
    root.render(<ReceiptContainer />);

    try {
      // Wait a moment for the content to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Convert canvas to PNG and trigger download
      const link = document.createElement("a");
      link.download = "transaction-receipt.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    } finally {
      // Clean up: unmount the root and remove the temporary div
      root.unmount();
      document.body.removeChild(tempDiv);
    }
  };

  if (typeof window === "undefined") {
    return null;
  }

  if (!transaction) {
    navigate("/user/transactions", "replace");
  }

  return (
    <div className="w-full 2xs:w-[90%] xl:w-[80%] 2xl:w-[70%] flex flex-col justify-center items-center gap-6 2xs:gap-8 xs:gap-10">
      <div className="text-text-200 dark:text-text-400 w-full 2xs:w-[90%] xs:w-[80%] flex flex-col justify-center items-center">
        {(
          getTransactionDetails(transaction, fields) as TransactionDetail[]
        ).map((detail, index) => (
          <div
            key={index}
            className="border-b border-bg-400 dark:border-bg-1000 font-medium text-sm w-full flex items-center justify-between py-4"
          >
            <p>{detail.label}</p>
            {detail.isStatus ? (
              <span
                className={`${statusStyles.default} ${
                  statusStyles[detail.value.toLowerCase()]
                }`}
              >
                {detail.value}
              </span>
            ) : detail.isReference ? (
              <div className="flex items-center gap-2">
                <p>{shortenReference({ ref: detail.value || "" })}</p>
                <button
                  onClick={() => {
                    toast.dismiss();
                    navigator.clipboard.writeText(detail.fullValue || "");
                    toast.success("Copied to clipboard", {
                      duration: 2000,
                    });
                  }}
                  className="hover:text-green-500 transition-colors"
                >
                  <LuCopy className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p>{detail.value}</p>
            )}
          </div>
        ))}
      </div>

      <CustomButton
        onClick={() => {
          if (transaction?.status === TRANSACTION_STATUS.success) {
            handleDownload();
          }
        }}
        disabled={transaction?.status !== TRANSACTION_STATUS.success}
        type="button"
        className="w-full py-3.5 rounded-md text-white my-8 xs:my-10"
      >
        Download Receipt
      </CustomButton>
    </div>
  );
};

export default TransactionReceipt;
