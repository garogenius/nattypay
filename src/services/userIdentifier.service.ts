/**
 * Service to store and retrieve user identifiers for quick login
 */

const USER_IDENTIFIER_KEY = "nattypay_user_identifier";
const USER_NAME_KEY = "nattypay_user_name";

export interface UserIdentifier {
  type: "email" | "phone";
  value: string;
  masked: string;
}

/**
 * Store user identifier for quick login
 */
export const storeUserIdentifier = (identifier: UserIdentifier, name?: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_IDENTIFIER_KEY, JSON.stringify(identifier));
  if (name) {
    localStorage.setItem(USER_NAME_KEY, name);
  }
};

/**
 * Get stored user identifier
 */
export const getUserIdentifier = (): UserIdentifier | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_IDENTIFIER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

/**
 * Get stored user name
 */
export const getUserName = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_NAME_KEY);
};

/**
 * Mask identifier for display
 */
export const maskIdentifier = (identifier: string, type: "email" | "phone"): string => {
  if (type === "email") {
    const [localPart, domain] = identifier.split("@");
    if (!domain) return identifier;
    const maskedLocal = localPart.length > 2 
      ? `${localPart.substring(0, 2)}${"*".repeat(Math.min(localPart.length - 2, 8))}`
      : localPart;
    return `${maskedLocal}@${domain}`;
  } else {
    // Phone number masking
    if (identifier.length <= 4) return identifier;
    const start = identifier.substring(0, 2);
    const end = identifier.substring(identifier.length - 2);
    const middle = "*".repeat(Math.min(identifier.length - 4, 8));
    return `${start}${middle}${end}`;
  }
};

/**
 * Clear stored user identifier
 */
export const clearUserIdentifier = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_IDENTIFIER_KEY);
  localStorage.removeItem(USER_NAME_KEY);
};






