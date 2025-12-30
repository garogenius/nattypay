import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  deleteNotification,
  toggleRead,
  registerFCMToken,
  getUserDevices,
  removeDevice,
  removeToken,
} from "./notifications.apis";
import { GetNotificationsParams, RegisterTokenRequest } from "./notifications.types";

export const useGetNotifications = (params?: GetNotificationsParams) => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["notifications", params],
    queryFn: () => fetchNotifications(params),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
  return {
    notifications: data?.notifications || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    isPending,
    isError,
    refetch,
  };
};

export const useGetUnreadCount = () => {
  const { data, isPending, refetch } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    staleTime: 10 * 1000, // Consider data fresh for 10 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
  return {
    count: data?.count || 0,
    isPending,
    refetch,
  };
};

export const useMarkAllAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};

export const useToggleNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};

export const useRegisterFCMToken = () => {
  return useMutation({
    mutationFn: (data: RegisterTokenRequest) => registerFCMToken(data),
  });
};

export const useGetUserDevices = () => {
  const { data, isPending, refetch } = useQuery({
    queryKey: ["notifications", "devices"],
    queryFn: getUserDevices,
  });
  return {
    devices: data || [],
    isPending,
    refetch,
  };
};

export const useRemoveDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeDevice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", "devices"] });
    },
  });
};

export const useRemoveToken = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeToken,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", "devices"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};
