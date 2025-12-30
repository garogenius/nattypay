"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useNavigate from "@/hooks/useNavigate";
import useUserStore from "@/store/user.store";
import { TIER_LEVEL } from "@/constants/types";
import Loader from "@/components/Loader/Loader";
import { isTokenExpired } from "@/utils/tokenChecker";
import Cookies from "js-cookie";

interface UserProtectionProviderProps {
  children: React.ReactNode;
}

const UserProtectionProvider = ({ children }: UserProtectionProviderProps) => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isInitialized } = useUserStore();
  const isBvnVerified =
    user?.tierLevel !== TIER_LEVEL.notSet && user?.isBvnVerified;
  const isPinCreated = user?.isWalletPinSet;

  const isVerified = isBvnVerified && isPinCreated;

  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const token = Cookies.get("accessToken");
  const tokenExpired = token ? isTokenExpired(token) : true;

  useEffect(() => {
    const isLoggingOut = sessionStorage.getItem("isLoggingOut");
    const isOnAuthPage = pathname.startsWith("/login") || 
                         pathname.startsWith("/add-phone-number") ||
                         pathname.startsWith("/validate-phoneNumber") ||
                         pathname.startsWith("/two-factor-auth") ||
                         pathname.startsWith("/verify-email") ||
                         pathname.startsWith("/currency-selection") ||
                         pathname.startsWith("/open-account") ||
                         pathname.startsWith("/face-setup") ||
                         pathname.startsWith("/transaction-pin") ||
                         pathname.startsWith("/onboarding-success");

    // Skip protection checks for auth pages
    if (isOnAuthPage || isLoggingOut || isLoading || !isInitialized) {
      if (isLoggingOut) {
        sessionStorage.removeItem("isLoggingOut");
      }
      return;
    }

    // Check if token exists and is valid
    const hasValidToken = token && !tokenExpired;
    
    // If token is missing or expired, clear user state and redirect to login
    if (!hasValidToken) {
      // Clear user state if token is missing
      if (user || isLoggedIn) {
        const { setUser, setIsLoggedIn } = useUserStore.getState();
        setUser(null);
        setIsLoggedIn(false);
      }
    }
    
    // Only redirect to login if:
    // 1. No valid token AND (no user OR not logged in)
    // 2. OR token expired AND (no user OR not logged in)
    if ((!hasValidToken || !user) && !isLoggedIn) {
      // Prevent redirect loop by checking if we're already redirecting
      const isRedirecting = sessionStorage.getItem("isRedirecting");
      if (!isRedirecting && !pathname.startsWith("/login")) {
        sessionStorage.setItem("isRedirecting", "true");
        sessionStorage.setItem("returnTo", pathname);
        navigate("/login", "replace");
        // Clear redirect flag after a short delay
        setTimeout(() => {
          sessionStorage.removeItem("isRedirecting");
        }, 1000);
      }
    }
  }, [
    isLoggedIn,
    navigate,
    pathname,
    isInitialized,
    isLoading,
    tokenExpired,
    user,
    token,
  ]);

  useEffect(() => {
    if (
      !isLoading &&
      isLoggedIn &&
      isInitialized &&
      !isVerified &&
      pathname !== "/user/dashboard"
    ) {
      navigate("/user/dashboard", "replace");
    }
  }, [isVerified, navigate, pathname, isInitialized, isLoading, isLoggedIn]);

  // Show loading state while checking auth
  if (isLoading && !isLoggedIn && !isInitialized) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default UserProtectionProvider;
