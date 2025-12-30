"use client";
import React from "react";
import LineChart from "./LineChart";
import { statsLineOption } from "./data";
import { useGetUserStatisticsLineChart } from "@/api/user/user.queries";
import { useTheme } from "@/store/theme.store";
import Skeleton from "react-loading-skeleton";

const PortfolioCard = () => {
  const theme = useTheme();
  const { data: statsData, isPending: linePending, isError: lineError } = useGetUserStatisticsLineChart();

  const isLoading = linePending && !lineError;
  
  // Transform API response to chart format
  // Handle different possible API response structures
  const labels = statsData?.labels || statsData?.data?.labels || [];
  const values = statsData?.values || statsData?.data?.values || [];
  const debits = statsData?.debits || statsData?.data?.debits || [];
  
  const lineStats = labels?.map((label: string, index: number) => ({
    date: label,
    credits: values[index] || 0,
    debits: debits[index] || 0,
  })) || [];

  const statsLineData =
    lineStats && !lineError
      ? {
          labels: lineStats.map((data) => data.date),
          datasets: [
            {
              fill: false,
              label: "Credits (₦)",
              data: lineStats.map((item) => item.credits),
              borderColor: "#068E44",
              backgroundColor: "#068E44",
              tension: 0.4,
              borderWidth: 2,
            },
            {
              fill: false,
              label: "Debits (₦)",
              data: lineStats.map((item) => item.debits),
              borderColor: "#E4063D",
              backgroundColor: "#E4063D",
              tension: 0.4,
              borderWidth: 2,
            },
          ],
        }
      : null;

  const renderChartSkeleton = () => (
    <div className="w-full h-fit flex flex-col gap-4">
      {[1, 2, 3, 4].map((index) => (
        <Skeleton
          key={index}
          className="h-8"
          baseColor={theme === "light" ? "#e0e0e0" : "#202020"}
          highlightColor={theme === "light" ? "#f5f5f5" : "#444444"}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-4 xs:px-6 py-4 xs:py-6 2xl:py-8 rounded-lg sm:rounded-xl">
      <h2 className="text-text-200 dark:text-text-400 text-lg md:text-xl font-semibold mb-4">
        My Portfolio
      </h2>
      <div className="w-full h-full flex justify-center items-center">
        {isLoading
          ? renderChartSkeleton()
          : statsLineData && (
              <div className="w-full h-full flex justify-center items-center">
                <LineChart chartData={statsLineData ?? []} chartOption={{ ...statsLineOption }} />
              </div>
            )}
      </div>
    </div>
  );
};

export default PortfolioCard;
