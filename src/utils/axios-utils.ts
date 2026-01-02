import axios from "axios";
import Cookies from "js-cookie";

const api = process.env.NEXT_PUBLIC_BACKEND_API || "";
const apiKey = process.env.NEXT_PUBLIC_BACKEND_API_KEY || "";

if (!api && typeof window !== "undefined") {
  console.error("NEXT_PUBLIC_BACKEND_API is not set. Please configure it in your environment variables.");
}

export const client = axios.create({
  baseURL: api,
  headers: {
    "x-api-key": apiKey,
  },
});

// Helper function to validate JWT token format
const isValidJWT = (token: string | undefined): boolean => {
  if (!token) return false;
  const trimmedToken = token.trim();
  // JWT should have 3 parts separated by dots
  const parts = trimmedToken.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
};

// Add request interceptor to always include token from cookies
client.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    
    // Always set API key
    if (apiKey) {
      config.headers["x-api-key"] = apiKey;
    }

    // Add Authorization header if token exists and is valid
    if (token && isValidJWT(token)) {
      const trimmedToken = token.trim();
      config.headers.Authorization = `Bearer ${trimmedToken}`;
    } else if (token) {
      // Token exists but is malformed - remove malformed token silently
      // SECURITY: Don't log token details to prevent information disclosure
      Cookies.remove("accessToken");
      // Don't include Authorization header if token is malformed
    }
    // SECURITY: Don't log missing tokens to prevent information disclosure

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors (missing/invalid token)
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      const token = Cookies.get("accessToken");
      
      // Only redirect if we're not already on an auth page
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname;
        const isAuthPage = 
          pathname.startsWith("/login") ||
          pathname.startsWith("/add-phone-number") ||
          pathname.startsWith("/validate-phoneNumber") ||
          pathname.startsWith("/two-factor-auth") ||
          pathname.startsWith("/verify-email") ||
          pathname.startsWith("/currency-selection") ||
          pathname.startsWith("/open-account") ||
          pathname.startsWith("/face-setup") ||
          pathname.startsWith("/transaction-pin") ||
          pathname.startsWith("/onboarding-success") ||
          pathname.startsWith("/account-type");

        // Only clear token and redirect if NOT on an auth page
        // This prevents clearing the token during BVN/NIN verification failures
        // which would cause unwanted redirects to login
        if (!isAuthPage) {
          // Clear token and user state
          Cookies.remove("accessToken");
          
          // Clear user store if available (will be handled by UserProtectionProvider)
          // We just clear the token here, the provider will handle the rest

          // Redirect to login if not already on an auth page
          const isRedirecting = sessionStorage.getItem("isRedirecting");
          if (!isRedirecting) {
            sessionStorage.setItem("isRedirecting", "true");
            sessionStorage.setItem("returnTo", pathname);
            window.location.href = "/login";
            setTimeout(() => {
              sessionStorage.removeItem("isRedirecting");
            }, 1000);
          }
        }
        // If on auth page, don't clear token or redirect - let the error handler handle it
      }
    }

    return Promise.reject(error);
  }
);

export const request = ({ ...options }) => {
  // Create a new config object for this request
  const config: any = {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
    withCredentials: true,
  };

  // The interceptor will handle adding the token and API key
  return client(config);
};

export const removeHeaderToken = (): void => {
  delete client.defaults.headers.common["Authorization"];
};
