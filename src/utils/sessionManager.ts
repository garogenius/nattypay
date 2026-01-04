/**
 * Session Management Utility
 * Handles session timeout, inactivity detection, and secure session cleanup
 */

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
const INACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

let sessionTimer: NodeJS.Timeout | null = null;
let warningTimer: NodeJS.Timeout | null = null;
let inactivityTimer: NodeJS.Timeout | null = null;
let lastActivityTime = Date.now();
let onSessionTimeout: (() => void) | null = null;
let onSessionWarning: ((remainingMinutes: number) => void) | null = null;

/**
 * Track user activity
 */
export const trackActivity = () => {
  lastActivityTime = Date.now();
};

/**
 * Initialize session management
 */
export const initializeSession = (
  onTimeout: () => void,
  onWarning?: (remainingMinutes: number) => void
) => {
  onSessionTimeout = onTimeout;
  onSessionWarning = onWarning || null;

  // Track various user activities
  if (typeof window !== "undefined") {
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // Check for inactivity periodically
    inactivityTimer = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      if (timeSinceActivity >= SESSION_TIMEOUT) {
        handleSessionTimeout();
      } else if (timeSinceActivity >= SESSION_TIMEOUT - WARNING_TIME && !warningTimer) {
        handleSessionWarning();
      }
    }, INACTIVITY_CHECK_INTERVAL);

    // Start session timer
    resetSessionTimer();
  }
};

/**
 * Reset session timer
 */
export const resetSessionTimer = () => {
  clearSessionTimers();

  // Set main timeout
  sessionTimer = setTimeout(() => {
    handleSessionTimeout();
  }, SESSION_TIMEOUT);

  // Set warning timer
  warningTimer = setTimeout(() => {
    handleSessionWarning();
  }, SESSION_TIMEOUT - WARNING_TIME);

  lastActivityTime = Date.now();
};

/**
 * Handle session warning
 */
const handleSessionWarning = () => {
  const remainingMinutes = Math.ceil(
    (SESSION_TIMEOUT - (Date.now() - lastActivityTime)) / 60000
  );
  if (onSessionWarning) {
    onSessionWarning(remainingMinutes);
  }
};

/**
 * Handle session timeout
 */
const handleSessionTimeout = () => {
  clearSessionTimers();
  if (onSessionTimeout) {
    onSessionTimeout();
  }
};

/**
 * Clear all session timers
 */
const clearSessionTimers = () => {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }
};

/**
 * Clear session and cleanup
 */
export const clearSession = () => {
  clearSessionTimers();
  if (inactivityTimer) {
    clearInterval(inactivityTimer);
    inactivityTimer = null;
  }

  // Remove event listeners
  if (typeof window !== "undefined") {
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      document.removeEventListener(event, trackActivity);
    });
  }

  onSessionTimeout = null;
  onSessionWarning = null;
};

/**
 * Get remaining session time in minutes
 */
export const getRemainingSessionTime = (): number => {
  const timeSinceActivity = Date.now() - lastActivityTime;
  const remaining = SESSION_TIMEOUT - timeSinceActivity;
  return Math.max(0, Math.ceil(remaining / 60000));
};













