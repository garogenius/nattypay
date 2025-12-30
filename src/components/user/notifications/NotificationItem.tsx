"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import images from "../../../../public/images";
import { NotificationItem as Notif } from "@/api/notifications/notifications.types";
import { useRouter } from "next/navigation";

const NotificationItem = ({
  item,
  onMarkRead,
  onDelete,
}: {
  item: Notif;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const router = useRouter();

  const getNavigationPath = useCallback((): string | null => {
    // Navigate based on notification type and transactionId
    if (item.transactionId) {
      // Navigate to transactions page - the transaction ID can be used to filter/view specific transaction
      return "/user/transactions";
    }

    // Navigate based on notification type
    switch (item.type) {
      case "TRANSACTION_SUCCESS":
      case "TRANSACTION_FAILED":
      case "DEPOSIT_SUCCESS":
      case "TRANSFER_SUCCESS":
        return "/user/transactions";
      case "BILL_PAYMENT_SUCCESS":
        return "/user/bills";
      case "ACCOUNT_UPDATE":
      case "SECURITY_ALERT":
        return "/user/settings";
      default:
        return null;
    }
  }, [item.type, item.transactionId]);

  const handleClick = useCallback(() => {
    const path = getNavigationPath();
    if (path) {
      router.push(path);
    }
  }, [getNavigationPath, router]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(item.id);
    },
    [onDelete, item.id]
  );

  const handleMarkRead = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMarkRead(item.id);
    },
    [onMarkRead, item.id]
  );

  return (
    <div
      className="w-full px-2 sm:px-3 py-3 flex items-start gap-3 hover:bg-white/5 rounded-lg cursor-pointer"
      onClick={handleClick}
    >
      <div className="mt-1 w-9 h-9 rounded-md bg-white/10 grid place-items-center overflow-hidden">
        <Image src={images.singleLogo} alt="NattyPay" className="w-7 h-7 object-contain" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-white font-semibold">{item.title}</p>
            <p className="text-white/70 text-sm mt-0.5">{item.body}</p>
            <div className="flex items-center gap-4 mt-2 text-xs">
              {!item.read ? (
                <button
                  onClick={handleMarkRead}
                  className="text-[#D4B139] hover:text-[#E5C249]"
                >
                  Mark as read
                </button>
              ) : (
                <span className="text-white/30">Read</span>
              )}
              <button
                onClick={handleDelete}
                className="text-white/20 hover:text-white/40"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-white/60 text-xs whitespace-nowrap">{timeAgo(item.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hr = Math.floor(diff / 36e5);
  if (hr < 1) return "Just now";
  if (hr < 24) return `${hr} hour${hr>1?"s":""} ago`;
  const days = Math.floor(hr / 24);
  return `${days} day${days>1?"s":""} ago`;
}

export default NotificationItem;
