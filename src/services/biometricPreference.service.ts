/**
 * Biometric Login Preference Service
 * Manages user preference for biometric login (enabled/disabled)
 * Stores preference securely in localStorage with user ID binding
 */

const BIOMETRIC_ENABLED_KEY = "nattypay_biometric_login_enabled";
const BIOMETRIC_USER_ID_KEY = "nattypay_biometric_user_id";

/**
 * Check if biometric login is enabled for the current user
 */
export const isBiometricLoginEnabled = (userId?: string): boolean => {
  if (typeof window === "undefined") return false;
  
  const enabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true";
  const storedUserId = localStorage.getItem(BIOMETRIC_USER_ID_KEY);
  
  // If userId is provided, verify it matches stored user ID
  if (userId && storedUserId !== userId) {
    // User ID mismatch - clear preference (security measure)
    clearBiometricLoginPreference();
    return false;
  }
  
  return enabled;
};

/**
 * Enable biometric login for a user
 */
export const enableBiometricLogin = (userId: string): void => {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(BIOMETRIC_ENABLED_KEY, "true");
  localStorage.setItem(BIOMETRIC_USER_ID_KEY, userId);
};

/**
 * Disable biometric login
 */
export const disableBiometricLogin = (): void => {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
  localStorage.removeItem(BIOMETRIC_USER_ID_KEY);
};

/**
 * Clear biometric login preference (used on logout, password change, etc.)
 */
export const clearBiometricLoginPreference = (): void => {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
  localStorage.removeItem(BIOMETRIC_USER_ID_KEY);
};

/**
 * Get stored user ID for biometric login
 */
export const getBiometricUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(BIOMETRIC_USER_ID_KEY);
};

