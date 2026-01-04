"use client";

import React, { useMemo, useState, useCallback } from "react";
import NotificationItem from "@/components/user/notifications/NotificationItem";
import {
  useGetNotifications,
  useMarkAllAsRead,
  useToggleNotificationRead,
  useDeleteNotification,
} from "@/api/notifications/notifications.queries";
import EmptyState from "@/components/user/table/EmptyState";
import images from "../../../../public/images";
import { NotificationType } from "@/api/notifications/notifications.types";

const tabs = [
  { key: "all", label: "All" },
  { key: "transaction", label: "Transaction" },
  { key: "services", label: "Services" },
  { key: "updates", label: "Updates" },
  { key: "messages", label: "Messages" },
] as const;

const ITEMS_PER_PAGE = 20;

const NotificationsPage = () => {
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("all");
  const [page, setPage] = useState(1);
  const [isReadFilter, setIsReadFilter] = useState<boolean | undefined>(undefined);

  // Map category to notification type for API filtering
  const getTypeFilter = (category: string): NotificationType | undefined => {
    if (category === "all") return undefined;
    // Note: API doesn't have a direct category filter, so we'll filter client-side
    // But we can filter by isRead
    return undefined;
  };

  const { notifications, totalCount, totalPages, currentPage, isPending, refetch } =
    useGetNotifications({
      page,
      limit: ITEMS_PER_PAGE,
      isRead: isReadFilter,
    });

  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: toggleRead } = useToggleNotificationRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead(undefined, {
      onSuccess: () => {
        refetch();
      },
    });
  }, [markAllAsRead, refetch]);

  const handleDeleteAll = useCallback(() => {
    // Delete all notifications one by one
    notifications.forEach((n) => {
      deleteNotification(n.id, {
        onSuccess: () => {
          if (notifications.indexOf(n) === notifications.length - 1) {
            refetch();
          }
        },
      });
    });
  }, [notifications, deleteNotification, refetch]);

  const filtered = useMemo(() => {
    if (active === "all") return notifications;
    return notifications.filter((n) => n.category === active);
  }, [notifications, active]);

  const counts = useMemo(() => {
    return {
      all: totalCount,
      transaction: notifications.filter((n) => n.category === "transaction").length,
      services: notifications.filter((n) => n.category === "services").length,
      updates: notifications.filter((n) => n.category === "updates").length,
      messages: notifications.filter((n) => n.category === "messages").length,
    };
  }, [notifications, totalCount]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Header + actions */}
      <div className="flex flex-col gap-2 px-1 sm:px-0">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-white text-base sm:text-lg font-semibold">Notifications</h1>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={handleMarkAllAsRead} className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-[#2C3947] text-white/80 text-xs sm:text-sm hover:bg-white/5 whitespace-nowrap">
            <span className="hidden xs:inline">Mark all as read</span>
            <span className="xs:hidden">Mark read</span>
          </button>
          <button onClick={handleDeleteAll} className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-[#2C3947] text-white/80 text-xs sm:text-sm hover:bg-white/5 whitespace-nowrap">Clear All</button>
        </div>
        </div>
        <p className="text-white/60 text-xs sm:text-sm">Stay updated with your account activity</p>
      </div>

      {/* Tabs */}
      <div className="py-1 flex items-center gap-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActive(t.key);
              setPage(1); // Reset to first page when changing tabs
            }}
            className={`relative px-2.5 py-1.5 rounded-md text-sm ${active===t.key?"text-[#D4B139] bg-white/5":"text-white/70 hover:text-white"}`}
          >
            {t.label}
            <span className={`ml-2 px-1.5 py-[2px] rounded-md text-[11px] ${active===t.key?"bg-[#D4B139] text-black":"bg-white/10 text-white/80"}`}>
              {counts[t.key as keyof typeof counts] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Messages card only */}
      <div className="rounded-xl bg-bg-600 dark:bg-bg-1100 p-2 sm:p-3 h-[58vh] overflow-auto flex flex-col gap-2 scroll-area">
        {isPending ? (
          <p className="text-white/70 text-sm px-2">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="px-2">
            <EmptyState
              image={images.emptyState.emptyTransactions}
              title={"No notifications"}
              path={"/user/dashboard"}
              placeholder={"Go to Dashboard"}
              showButton={false}
            />
          </div>
        ) : (
          <>
            {filtered.map((n) => (
              <NotificationItem
                key={n.id}
                item={n}
                onMarkRead={(id) =>
                  toggleRead(id, {
                    onSuccess: () => refetch(),
                  })
                }
                onDelete={(id) =>
                  deleteNotification(id, {
                    onSuccess: () => refetch(),
                  })
                }
              />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 px-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md border border-[#2C3947] text-white/80 text-sm hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-white/60 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md border border-[#2C3947] text-white/80 text-sm hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
