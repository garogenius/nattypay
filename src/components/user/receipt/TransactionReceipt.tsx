"use client";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";
import useTransactionStore from "@/store/useTransaction.store";
import useNavigate from "@/hooks/useNavigate";
import ReceiptContainer from "./ReceiptFields";
import CustomButton from "@/components/shared/Button";
import { TRANSACTION_STATUS } from "@/constants/types";

const TransactionReceipt = () => {
  const transaction = useTransactionStore((state) => state.transaction);
  const navigate = useNavigate();
  
  if (typeof window === "undefined") {
    return null;
  }

  if (!transaction) {
    navigate("/user/transactions", "replace");
    return null;
  }

  const handleDownload = async () => {
    // Create a temporary div and render the receipt for high-quality capture
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.width = "500px"; // Fixed width for consistent receipt size
    document.body.appendChild(tempDiv);

    const root = createRoot(tempDiv);
    // Render the container with white background explicitly for the download
    root.render(
      <div className="bg-white">
        <ReceiptContainer />
      </div>
    );

    try {
      // Wait for content and images to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(tempDiv, {
        scale: 3, // High quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `NattyPay_Receipt_${transaction.transactionRef || 'transaction'}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating receipt:", error);
    } finally {
      root.unmount();
      document.body.removeChild(tempDiv);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 py-4 px-4 sm:px-6">
      {/* Receipt Display */}
      <div className="w-full max-w-[500px] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <ReceiptContainer />
      </div>

      {/* Download Action */}
      <div className="w-full max-w-[500px]">
        <CustomButton
          onClick={handleDownload}
          disabled={transaction?.status !== TRANSACTION_STATUS.success}
          type="button"
          className="w-full py-4 rounded-xl text-white font-semibold text-lg"
        >
          Download Receipt
        </CustomButton>
      </div>
    </div>
  );
};

export default TransactionReceipt;
