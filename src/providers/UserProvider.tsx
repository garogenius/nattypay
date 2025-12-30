"use client";
import { useGetUser } from "@/api/user/user.queries";
import useUserStore from "@/store/user.store";
import { useEffect } from "react";
import { initializeFCM, clearFCMToken } from "@/services/fcm.service";

interface ApiError {
  response?: {
    status: number;
  };
}

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { initializeAuth, isInitialized, isLoggedIn } = useUserStore();

  // Initialize query in background without blocking
  const { user, isSuccess, error } = useGetUser();

  const isApiError = (error: unknown): error is ApiError => {
    return error !== null && typeof error === "object" && "response" in error;
  };

  useEffect(() => {
    if (isSuccess) {
      initializeAuth(user);
    } else if (error && isApiError(error) && error.response?.status === 401) {
      initializeAuth(null);
    }
  }, [initializeAuth, user, isSuccess, error, isInitialized]);

  // Initialize FCM when user is logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      initializeFCM().catch((err) => {
        console.error("FCM initialization failed:", err);
      });
    } else if (!isLoggedIn) {
      // Clear FCM token on logout
      clearFCMToken();
    }
  }, [isLoggedIn, user]);

  return <>{children}</>;
};

export default UserProvider;
