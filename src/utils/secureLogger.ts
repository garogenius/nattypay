/**
 * Secure Logging Utility
 * Prevents sensitive data from being logged in production
 * Only logs in development mode
 */

type LogLevel = "log" | "warn" | "error" | "info" | "debug";

interface SecureLogger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

/**
 * Check if a value contains sensitive information
 */
const containsSensitiveData = (value: any): boolean => {
  if (typeof value !== "string") return false;
  const sensitivePatterns = [
    /password/i,
    /pin/i,
    /token/i,
    /secret/i,
    /api[_-]?key/i,
    /authorization/i,
    /bearer/i,
    /access[_-]?token/i,
    /refresh[_-]?token/i,
    /private[_-]?key/i,
    /credential/i,
    /walletpin/i,
    /wallet[_-]?pin/i,
  ];
  return sensitivePatterns.some((pattern) => pattern.test(value));
};

/**
 * Sanitize log arguments to remove sensitive data
 */
const sanitizeLogArgs = (args: any[]): any[] => {
  return args.map((arg) => {
    if (typeof arg === "string" && containsSensitiveData(arg)) {
      return "[REDACTED]";
    }
    if (typeof arg === "object" && arg !== null) {
      const sanitized: any = Array.isArray(arg) ? [] : {};
      for (const key in arg) {
        if (containsSensitiveData(key) || containsSensitiveData(arg[key])) {
          sanitized[key] = "[REDACTED]";
        } else if (typeof arg[key] === "object" && arg[key] !== null) {
          sanitized[key] = sanitizeLogArgs([arg[key]])[0];
        } else {
          sanitized[key] = arg[key];
        }
      }
      return sanitized;
    }
    return arg;
  });
};

/**
 * Create a secure logger that only logs in development
 */
const createSecureLogger = (level: LogLevel): (...args: any[]) => void => {
  return (...args: any[]) => {
    // Only log in development
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Sanitize sensitive data
    const sanitizedArgs = sanitizeLogArgs(args);

    // Use appropriate console method
    switch (level) {
      case "log":
        console.log(...sanitizedArgs);
        break;
      case "warn":
        console.warn(...sanitizedArgs);
        break;
      case "error":
        console.error(...sanitizedArgs);
        break;
      case "info":
        console.info(...sanitizedArgs);
        break;
      case "debug":
        console.debug(...sanitizedArgs);
        break;
    }
  };
};

/**
 * Secure logger instance
 * Use this instead of console.log/warn/error
 */
export const secureLogger: SecureLogger = {
  log: createSecureLogger("log"),
  warn: createSecureLogger("warn"),
  error: createSecureLogger("error"),
  info: createSecureLogger("info"),
  debug: createSecureLogger("debug"),
};

/**
 * Log security events (only in development)
 */
export const logSecurityEvent = (event: string, details?: any) => {
  if (process.env.NODE_ENV === "development") {
    secureLogger.info(`[SECURITY EVENT] ${event}`, details ? sanitizeLogArgs([details])[0] : "");
  }
};

/**
 * Log audit trail (for production security monitoring)
 * This can be sent to a secure logging service
 */
export const logAuditTrail = (action: string, userId?: string, metadata?: any) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId: userId || "anonymous",
    metadata: metadata ? sanitizeLogArgs([metadata])[0] : {},
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
    ip: "client-side", // IP should be captured server-side
  };

  // In production, send to secure logging service
  if (process.env.NODE_ENV === "production") {
    // TODO: Send to secure audit logging service
    // Example: sendToAuditService(auditEntry);
  } else {
    secureLogger.info("[AUDIT TRAIL]", auditEntry);
  }
};













