export type NotificationType =
  | "TRANSACTION_SUCCESS"
  | "TRANSACTION_FAILED"
  | "BILL_PAYMENT_SUCCESS"
  | "DEPOSIT_SUCCESS"
  | "TRANSFER_SUCCESS"
  | "SECURITY_ALERT"
  | "ACCOUNT_UPDATE";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH";

export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export type NotificationCategory = "transaction" | "services" | "updates" | "messages";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  priority: NotificationPriority;
  status: NotificationStatus;
  isRead: boolean;
  readAt: string | null;
  sentAt: string;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed fields for UI compatibility
  read?: boolean;
  category?: NotificationCategory;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface UnreadCountResponse {
  message: string;
  statusCode: number;
  count: number;
}

export interface MarkAsReadResponse {
  message: string;
  statusCode: number;
  success: boolean;
  updatedCount: number;
}

export interface MarkAsReadRequest {
  notificationIds: string[];
}

export interface RegisterTokenRequest {
  token: string;
  deviceId: string;
  deviceType: "ios" | "android" | "web";
  deviceName: string;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
}

export interface RegisterTokenResponse {
  message: string;
  statusCode: number;
  deviceId: string;
}

export interface Device {
  id: string;
  deviceId: string;
  deviceType: "ios" | "android" | "web";
  deviceName: string;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  isTrusted: boolean;
  lastActiveAt: string;
  registeredAt: string;
  activeTokensCount: number;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
}
