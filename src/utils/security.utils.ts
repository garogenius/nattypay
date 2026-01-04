/**
 * Security utility functions for authentication and input validation
 */

/**
 * Rate limiting for login attempts
 */
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes window

interface LoginAttempt {
  timestamp: number;
  identifier: string;
}

class RateLimiter {
  private attempts: Map<string, LoginAttempt[]> = new Map();

  /**
   * Check if login attempts should be rate limited
   * @param identifier - Email or phone number
   * @returns Object with allowed status and remaining attempts
   */
  checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; lockoutTime?: number } {
    const now = Date.now();
    const key = identifier.toLowerCase().trim();
    const attempts = this.attempts.get(key) || [];

    // Remove attempts outside the time window
    const recentAttempts = attempts.filter(
      (attempt) => now - attempt.timestamp < ATTEMPT_WINDOW
    );

    // Check if locked out
    if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
      const oldestAttempt = recentAttempts[0];
      const lockoutEndTime = oldestAttempt.timestamp + LOCKOUT_DURATION;
      
      if (now < lockoutEndTime) {
        const remainingTime = Math.ceil((lockoutEndTime - now) / 1000 / 60); // minutes
        return {
          allowed: false,
          remainingAttempts: 0,
          lockoutTime: remainingTime,
        };
      } else {
        // Lockout expired, reset attempts
        this.attempts.delete(key);
        return {
          allowed: true,
          remainingAttempts: MAX_LOGIN_ATTEMPTS,
        };
      }
    }

    // Update attempts
    this.attempts.set(key, recentAttempts);

    return {
      allowed: true,
      remainingAttempts: MAX_LOGIN_ATTEMPTS - recentAttempts.length,
    };
  }

  /**
   * Record a failed login attempt
   */
  recordFailedAttempt(identifier: string): void {
    const key = identifier.toLowerCase().trim();
    const attempts = this.attempts.get(key) || [];
    attempts.push({ timestamp: Date.now(), identifier: key });
    this.attempts.set(key, attempts);
  }

  /**
   * Clear attempts for successful login
   */
  clearAttempts(identifier: string): void {
    const key = identifier.toLowerCase().trim();
    this.attempts.delete(key);
  }

  /**
   * Get remaining attempts for an identifier
   */
  getRemainingAttempts(identifier: string): number {
    const result = this.checkRateLimit(identifier);
    return result.remainingAttempts;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers like onclick=
    .trim();
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Check for common weak passwords
  const commonPasswords = [
    "password",
    "12345678",
    "password123",
    "admin123",
    "qwerty123",
  ];
  if (commonPasswords.some((weak) => password.toLowerCase().includes(weak))) {
    errors.push("Password is too common. Please choose a stronger password");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Clear sensitive data from memory (best effort)
 */
export function clearSensitiveData(data: string): void {
  if (typeof data === "string") {
    // Overwrite with random data (best effort)
    const random = Math.random().toString();
    data = random;
  }
}

/**
 * Mask sensitive information for display
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) return email;
  const masked = local.substring(0, 2) + "*".repeat(Math.min(local.length - 2, 4)) + "@" + domain;
  return masked;
}

export function maskPhone(phone: string): string {
  if (!phone) return phone;
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 4) return phone;
  return phone.slice(0, -4).replace(/\d/g, "*") + phone.slice(-4);
}

/**
 * Generate a secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate PIN format and strength
 * SECURITY: PINs should be 4 digits, numeric only
 */
export function validatePIN(pin: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!pin) {
    errors.push("PIN is required");
    return { isValid: false, errors };
  }

  if (pin.length !== 4) {
    errors.push("PIN must be exactly 4 digits");
  }

  if (!/^\d+$/.test(pin)) {
    errors.push("PIN must contain only numbers");
  }

  // Check for weak PINs (all same digit, sequential, etc.)
  if (/^(\d)\1{3}$/.test(pin)) {
    errors.push("PIN cannot be all the same digit");
  }

  if (/0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210/.test(pin)) {
    errors.push("PIN cannot be sequential");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Clear PIN from memory (best effort)
 * SECURITY: Overwrite PIN value to prevent memory dumps
 */
export function clearPIN(pin: string): void {
  if (typeof pin === "string") {
    // Overwrite with random data (best effort - JavaScript strings are immutable)
    // This is a best-effort attempt to clear sensitive data
    pin = "0000";
  }
}

/**
 * Check if running in secure context (HTTPS)
 */
export function isSecureContext(): boolean {
  if (typeof window === "undefined") return true; // Server-side, assume secure
  return window.isSecureContext || window.location.protocol === "https:";
}

/**
 * Enforce HTTPS in production
 */
export function enforceHTTPS(): void {
  if (typeof window === "undefined") return;
  
  if (process.env.NODE_ENV === "production" && !isSecureContext()) {
    // Redirect to HTTPS
    const httpsUrl = window.location.href.replace(/^http:/, "https:");
    window.location.replace(httpsUrl);
  }
}

/**
 * Validate and sanitize account number
 */
export function validateAccountNumber(accountNumber: string, currency: string = "NGN"): {
  isValid: boolean;
  error?: string;
} {
  if (!accountNumber) {
    return { isValid: false, error: "Account number is required" };
  }

  // Remove non-numeric characters
  const cleaned = accountNumber.replace(/\D/g, "");

  // Validate length based on currency
  if (currency === "NGN") {
    if (cleaned.length !== 10) {
      return { isValid: false, error: "Account number must be 10 digits" };
    }
  }

  return { isValid: true };
}

/**
 * Sanitize amount input
 */
export function sanitizeAmount(amount: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = amount.replace(/[^\d.]/g, "");
  
  // Parse to number
  const parsed = parseFloat(cleaned);
  
  // Return 0 if invalid
  return isNaN(parsed) ? 0 : parsed;
}



