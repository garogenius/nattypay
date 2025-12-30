import { request } from "@/utils/axios-utils";
import {
  NotificationItem,
  NotificationsResponse,
  UnreadCountResponse,
  MarkAsReadRequest,
  MarkAsReadResponse,
  RegisterTokenRequest,
  RegisterTokenResponse,
  Device,
  GetNotificationsParams,
} from "./notifications.types";

// Map notification type to category for UI filtering
const mapTypeToCategory = (type: string): "transaction" | "services" | "updates" | "messages" => {
  if (
    type === "TRANSACTION_SUCCESS" ||
    type === "TRANSACTION_FAILED" ||
    type === "DEPOSIT_SUCCESS" ||
    type === "TRANSFER_SUCCESS"
  ) {
    return "transaction";
  }
  if (type === "BILL_PAYMENT_SUCCESS") {
    return "services";
  }
  if (type === "ACCOUNT_UPDATE" || type === "SECURITY_ALERT") {
    return "updates";
  }
  return "messages";
};

// Transform API response to include UI-compatible fields
const transformNotification = (n: NotificationItem): NotificationItem => {
  return {
    ...n,
    read: n.isRead,
    category: mapTypeToCategory(n.type),
  };
};

export const fetchNotifications = async (
  params?: GetNotificationsParams
): Promise<NotificationsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.type) queryParams.append("type", params.type);
  if (params?.isRead !== undefined) queryParams.append("isRead", params.isRead.toString());

  const url = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await request({
    url,
    method: "get",
  });

  return {
    ...response.data,
    notifications: response.data.notifications.map(transformNotification),
  };
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await request({
    url: "/notifications/unread-count",
    method: "get",
  });
  return response.data;
};

export const markAllAsRead = async (): Promise<MarkAsReadResponse> => {
  const response = await request({
    url: "/notifications/mark-all-as-read",
    method: "put",
  });
  return response.data;
};

export const markAsRead = async (
  notificationIds: string[]
): Promise<MarkAsReadResponse> => {
  const response = await request({
    url: "/notifications/mark-as-read",
    method: "put",
    data: { notificationIds } as MarkAsReadRequest,
  });
  return response.data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await request({
    url: `/notifications/${id}`,
    method: "delete",
  });
};


export const toggleRead = async (id: string): Promise<void> => {
  await markAsRead([id]);
};

export const registerFCMToken = async (
  data: RegisterTokenRequest
): Promise<RegisterTokenResponse> => {
  const response = await request({
    url: "/notifications/register-token",
    method: "post",
    data,
  });
  return response.data;
};

export const getUserDevices = async (): Promise<Device[]> => {
  const response = await request({
    url: "/notifications/devices",
    method: "get",
  });
  return response.data;
};

export const removeDevice = async (deviceId: string): Promise<void> => {
  await request({
    url: `/notifications/remove-device/${deviceId}`,
    method: "delete",
  });
};

export const removeToken = async (token: string): Promise<void> => {
  await request({
    url: `/notifications/remove-token/${token}`,
    method: "delete",
  });
};
