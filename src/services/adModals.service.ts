/**
 * Ad Modals Service
 * Manages the display logic for promotional ad modals
 * - 5 minute interval between modals
 * - 25 second display duration per modal
 * - Tracks which modals have been shown
 */

const STORAGE_KEY = "nattypay_ad_modals";
const MODAL_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MODAL_DISPLAY_DURATION = 10 * 1000; // 10 seconds in milliseconds

export type AdModalType = "welcome" | "virtual-card" | "savings-investment" | "referral" | "betting-platforms";

interface AdModalState {
  lastShown: number; // timestamp
  shownModals: AdModalType[]; // array of modals that have been shown in this session
  currentModal: AdModalType | null;
}

const getStoredState = (): AdModalState => {
  if (typeof window === "undefined") {
    return {
      lastShown: 0,
      shownModals: [],
      currentModal: null,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }

  return {
    lastShown: 0,
    shownModals: [],
    currentModal: null,
  };
};

const saveState = (state: AdModalState) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
};

/**
 * Get the next modal to display
 * Returns null if no modal should be shown yet
 */
export const getNextAdModal = (): AdModalType | null => {
  const state = getStoredState();
  const now = Date.now();

  // If no modal has been shown, start with welcome
  if (state.shownModals.length === 0) {
    return "welcome";
  }

  // Check if enough time has passed since last modal
  const timeSinceLastModal = now - state.lastShown;
  if (timeSinceLastModal < MODAL_INTERVAL) {
    return null;
  }

  // Determine next modal based on what's been shown
  const allModals: AdModalType[] = ["welcome", "virtual-card", "savings-investment", "referral", "betting-platforms"];
  const nextModalIndex = state.shownModals.length % allModals.length;
  const nextModal = allModals[nextModalIndex];

  // If we've shown all modals, cycle back
  return nextModal;
};

/**
 * Mark a modal as shown
 */
export const markModalAsShown = (modalType: AdModalType) => {
  const state = getStoredState();
  const now = Date.now();

  const newState: AdModalState = {
    lastShown: now,
    shownModals: [...state.shownModals, modalType],
    currentModal: modalType,
  };

  saveState(newState);
};

/**
 * Clear all modal state (useful for testing or reset)
 */
export const clearAdModalState = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore errors
  }
};

/**
 * Reset modal state for new user session
 */
export const resetAdModalState = () => {
  const newState: AdModalState = {
    lastShown: 0,
    shownModals: [],
    currentModal: null,
  };
  saveState(newState);
};

export { MODAL_DISPLAY_DURATION, MODAL_INTERVAL };

