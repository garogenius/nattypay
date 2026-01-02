"use client";
import React, { useState } from "react";
import StatsFilter from "./StatsFilter";
import LineChart from "./LineChart";
import { statsLineOption } from "./data";
import BarChart from "./BarChart";
import { useGetUserStatisticsLineChart } from "@/api/user/user.queries";
import { useTheme } from "@/store/theme.store";
import Skeleton from "react-loading-skeleton";

const StatsContent = () => {
  const [sort, setSort] = useState<"all" | "today" | "week" | "month" | "year">("all");
  const theme = useTheme();

  const periodMap: Record<string, string | undefined> = {
    all: undefined,
    today: "day",
    week: "week",
    month: "month",
    year: "year",
  };

  const {
    data: statsData,
    isPending: linePending,
    isError: lineError,
  } = useGetUserStatisticsLineChart({ period: periodMap[sort] });

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

  // Only create chart data if the stats are available and there's no error
  const statsLineData =
    lineStats && !lineError
      ? {
          labels: lineStats.map((data: { date: string; credits: number; debits: number }) => data.date),
          datasets: [
            {
              fill: false,
              label: "Credits (₦)",
              data: lineStats.map((item: { date: string; credits: number; debits: number }) => item.credits),
              borderColor: "#068E44",
              backgroundColor: "#068E44",
              tension: 0.4,
              borderWidth: 2,
            },
            {
              fill: false,
              label: "Debits (₦)",
              data: lineStats.map((item: { date: string; credits: number; debits: number }) => item.debits),
              borderColor: "#E4063D",
              backgroundColor: "#E4063D",
              tension: 0.4,
              borderWidth: 2,
            },
          ],
        }
      : null;

  // Use the filtered data from API (period is handled server-side)
  const filtered = !lineError ? lineStats : null;

  // Build bar chart data from filtered line stats (incoming/outgoing)
  const statsBarData =
    filtered && filtered.length
      ? {
          labels: filtered.map((d: { date: string; credits: number; debits: number }) => d.date),
          datasets: [
            {
              label: "Incoming",
              data: filtered.map((d: { date: string; credits: number; debits: number }) => d.credits),
              backgroundColor: "#2F80ED",
              borderRadius: 6,
              maxBarThickness: 18,
            },
            {
              label: "Outgoing",
              data: filtered.map((d: { date: string; credits: number; debits: number }) => d.debits),
              backgroundColor: "#27AE60",
              borderRadius: 6,
              maxBarThickness: 18,
            },
          ],
        }
      : { labels: [], datasets: [] };

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
    <div className="w-full flex flex-col gap-2 mt-2 overflow-x-hidden h-full">
      <div className="w-full h-full">
        <div className="w-full h-full flex flex-col bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-4 xs:px-6 py-4 xs:py-6 2xl:py-8 rounded-lg sm:rounded-xl min-h-[400px]">
          <div className="w-full flex items-center justify-between mb-4">
            <div>
              <h2 className="text-text-200 dark:text-text-800 text-lg sm:text-xl font-semibold mb-1">Analytics</h2>
              <p className="text-text-200 dark:text-text-400 text-sm">See how your money moved and how you spent it</p>
            </div>
            <StatsFilter sort={sort} setSort={setSort} />
          </div>
          <div className="flex-1 flex items-center justify-center">
            {isLoading
              ? renderChartSkeleton()
              : statsBarData && (
                  <div className="w-full flex justify-center items-center">
                    <BarChart chartData={statsBarData} chartOption={{
                      responsive: true,
                      plugins: { legend: { display: true, position: "bottom" } },
                      scales: { x: { grid: { color: "rgba(255,255,255,0.08)" } }, y: { grid: { color: "rgba(255,255,255,0.08)" } } }
                    }} />
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsContent;
