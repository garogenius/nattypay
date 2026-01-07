"use client";
import { useMemo } from "react";
import { useGetTransactions } from "@/api/wallet/wallet.queries";
import { TRANSACTION_TYPE } from "@/constants/types";
import BarChart from "./stats/BarChart";

interface StatsPlaceholderCardProps {
  spanCols?: number; // Number of columns this card should span (1, 2, or 3)
}

const StatsPlaceholderCard = ({ spanCols = 1 }: StatsPlaceholderCardProps) => {
  // Fetch transactions for the last 6 months
  const { transactionsData } = useGetTransactions({
    page: 1,
    limit: 1000, // Get enough transactions to analyze
  });

  // Process transactions to get monthly created (CREDIT) and debited (DEBIT) amounts
  const chartData = useMemo(() => {
    if (!transactionsData?.transactions || transactionsData.transactions.length === 0) {
      // Return demo data when no transactions available
      const months: string[] = [];
      const demoCredits: number[] = [];
      const demoDebits: number[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString("en-US", { month: "short" });
        months.push(monthKey);
        // Demo data with some variation
        demoCredits.push(Math.floor(Math.random() * 500000) + 100000);
        demoDebits.push(Math.floor(Math.random() * 300000) + 50000);
      }
      
      return {
        labels: months,
        credits: demoCredits,
        debits: demoDebits,
      };
    }

    // Get last 6 months
    const months: string[] = [];
    const creditsByMonth: { [key: string]: number } = {};
    const debitsByMonth: { [key: string]: number } = {};

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString("en-US", { month: "short" });
      months.push(monthKey);
      creditsByMonth[monthKey] = 0;
      debitsByMonth[monthKey] = 0;
    }

    // Process transactions
    transactionsData.transactions.forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      const monthKey = txDate.toLocaleDateString("en-US", { month: "short" });
      
      if (months.includes(monthKey)) {
        // Get actual transaction amount from transaction details
        let amount = 0;
        if (tx.transferDetails?.amountPaid) {
          amount = tx.transferDetails.amountPaid;
        } else if (tx.depositDetails?.amountPaid) {
          amount = tx.depositDetails.amountPaid;
        } else if (tx.billDetails?.amountPaid) {
          amount = tx.billDetails.amountPaid;
        } else {
          // Fallback to balance difference if details not available
          amount = Math.abs(tx.currentBalance - tx.previousBalance);
        }

        if (tx.type === TRANSACTION_TYPE.CREDIT) {
          creditsByMonth[monthKey] = (creditsByMonth[monthKey] || 0) + amount;
        } else if (tx.type === TRANSACTION_TYPE.DEBIT) {
          debitsByMonth[monthKey] = (debitsByMonth[monthKey] || 0) + amount;
        }
      }
    });

    return {
      labels: months,
      credits: months.map((m) => creditsByMonth[m] || 0),
      debits: months.map((m) => debitsByMonth[m] || 0),
    };
  }, [transactionsData]);

  // Prepare chart data for react-chartjs-2
  const chartDataConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Created",
        data: chartData.credits,
        backgroundColor: "rgba(212, 177, 57, 0.8)", // Secondary color with opacity
        borderColor: "rgba(212, 177, 57, 1)",
        borderWidth: 1,
      },
      {
        label: "Debited",
        data: chartData.debits,
        backgroundColor: "rgba(99, 102, 241, 0.8)", // Indigo color with opacity
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 11,
          },
          usePointStyle: true,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "rgba(255, 255, 255, 0.9)",
        bodyColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ₦${Number(context.parsed.y).toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          font: {
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          font: {
            size: 10,
          },
          callback: function (value: any) {
            return `₦${Number(value).toLocaleString()}`;
          },
        },
      },
    },
  };

  // Determine grid column span class
  // The grid is xl:grid-cols-4, so we need to span accordingly
  const gridColClass = useMemo(() => {
    if (spanCols === 3) return "sm:col-span-2 xl:col-span-3";
    if (spanCols === 2) return "sm:col-span-2 xl:col-span-2";
    return "sm:col-span-1 xl:col-span-1";
  }, [spanCols]);

  return (
    <div className={`${gridColClass} bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-4 flex flex-col gap-2 sm:gap-3`}>
      <div className="flex items-center gap-2 text-text-200 dark:text-text-800">
        <div className="w-8 h-8 rounded-md bg-secondary/15 grid place-items-center text-secondary">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </div>
        <p className="text-sm sm:text-base font-semibold">Transaction Overview</p>
      </div>
      
      {/* Chart - Visible on all screens */}
      <div className="w-full" style={{ height: "160px" }}>
        <BarChart chartData={chartDataConfig} chartOption={chartOptions} />
      </div>
    </div>
  );
};

export default StatsPlaceholderCard;

