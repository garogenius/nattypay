import { registerFCMToken } from "@/api/notifications/notifications.apis";
import { RegisterTokenRequest } from "@/api/notifications/notifications.types";
import Cookies from "js-cookie";

// Device ID storage key
const DEVICE_ID_KEY = "nattypay_device_id";
const FCM_TOKEN_KEY = "nattypay_fcm_token";

// Generate or retrieve device ID
export const getDeviceId = (): string => {
  if (typeof window === "undefined") return "";

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    // Generate a UUID-like device ID
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

// Get device information
export const getDeviceInfo = () => {
  if (typeof window === "undefined") {
    return {
      deviceType: "web" as const,
      deviceName: "Unknown Device",
      deviceModel: "Unknown",
      osVersion: "Unknown",
      appVersion: "1.0.0",
    };
  }

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  // Detect device type
  let deviceType: "ios" | "android" | "web" = "web";
  let deviceName = "Web Browser";
  let deviceModel = "Unknown";
  let osVersion = "Unknown";

  // Detect iOS
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    deviceType = "ios";
    deviceName = "iOS Device";
    const match = userAgent.match(/OS (\d+)_(\d+)/);
    if (match) {
      osVersion = `iOS ${match[1]}.${match[2]}`;
    }
    // Try to detect model
    if (/iPhone/.test(userAgent)) {
      deviceModel = "iPhone";
    } else if (/iPad/.test(userAgent)) {
      deviceModel = "iPad";
    }
  }
  // Detect Android
  else if (/Android/.test(userAgent)) {
    deviceType = "android";
    deviceName = "Android Device";
    const match = userAgent.match(/Android (\d+(\.\d+)?)/);
    if (match) {
      osVersion = `Android ${match[1]}`;
    }
    // Try to detect model
    const modelMatch = userAgent.match(/; ([^;)]+)\)/);
    if (modelMatch) {
      deviceModel = modelMatch[1];
    }
  } else {
    // Desktop browser
    deviceName = `${platform} Browser`;
    deviceModel = platform;
    const match = userAgent.match(/(?:Chrome|Firefox|Safari|Edge)\/(\d+)/);
    if (match) {
      osVersion = `Browser ${match[1]}`;
    }
  }

  return {
    deviceType,
    deviceName,
    deviceModel,
    osVersion,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  };
};

// Get FCM token (placeholder - will be replaced with actual FCM token when Firebase is integrated)
export const getFCMToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  // Check if token is already stored
  const storedToken = localStorage.getItem(FCM_TOKEN_KEY);
  if (storedToken) {
    return storedToken;
  }

  // TODO: When Firebase is integrated, use:
  // import { getMessaging, getToken } from "firebase/messaging";
  // const messaging = getMessaging();
  // const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY });
  // if (token) {
  //   localStorage.setItem(FCM_TOKEN_KEY, token);
  //   return token;
  // }

  // For now, generate a placeholder token
  // In production, this should be replaced with actual FCM token
  const placeholderToken = `fcm_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem(FCM_TOKEN_KEY, placeholderToken);
  return placeholderToken;
};

// Register FCM token with backend
export const registerToken = async (): Promise<void> => {
  const token = Cookies.get("accessToken");
  if (!token) {
    console.warn("Cannot register FCM token: User not authenticated");
    return;
  }

  try {
    const fcmToken = await getFCMToken();
    if (!fcmToken) {
      console.warn("Cannot register FCM token: No token available");
      return;
    }

    const deviceId = getDeviceId();
    const deviceInfo = getDeviceInfo();

    const payload: RegisterTokenRequest = {
      token: fcmToken,
      deviceId,
      ...deviceInfo,
    };

    await registerFCMToken(payload);
    console.log("FCM token registered successfully");
  } catch (error: any) {
    const statusCode = error?.response?.status;
    
    // Handle 404 - endpoint might not be implemented yet
    if (statusCode === 404) {
      console.warn("FCM token registration endpoint not available (404). This feature may not be implemented yet.");
      return;
    }
    
    // Handle 500 - server-side error, likely temporary or configuration issue
    if (statusCode === 500) {
      console.warn("FCM token registration failed due to server error (500). Push notifications may not be available.");
      // Only log detailed error in development
      if (process.env.NODE_ENV === "development") {
        console.debug("FCM registration error details:", error?.response?.data || error?.message);
      }
      return;
    }
    
    // Handle other errors gracefully
    // Use warn instead of error since this is non-critical functionality
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to register FCM token:", statusCode || error?.message || error);
    }
    // Don't throw - token registration failure shouldn't block the app
  }
};

// Initialize FCM (call on app startup and after login)
export const initializeFCM = async (): Promise<void> => {
  if (typeof window === "undefined") return;

  const token = Cookies.get("accessToken");
  if (!token) {
    return;
  }

  // Register token after a short delay to ensure auth is fully initialized
  // Use a try-catch to ensure errors don't propagate
  setTimeout(async () => {
    try {
      await registerToken();
    } catch (error) {
      // Errors are already handled in registerToken, but catch here as extra safety
      // This prevents any unhandled promise rejections
    }
  }, 1000);
};

// Clear FCM token (call on logout)
export const clearFCMToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FCM_TOKEN_KEY);
  // Note: Device ID is kept for re-registration on next login
};

// Refresh FCM token (call when token expires)
export const refreshFCMToken = async (): Promise<void> => {
  if (typeof window === "undefined") return;

  // Clear stored token
  localStorage.removeItem(FCM_TOKEN_KEY);

  // Get new token and register
  await registerToken();
};

