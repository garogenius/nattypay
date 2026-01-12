/**
 * Utility functions for error handling
 */

/**
 * Checks if an error is related to insufficient balance/funds
 */
export const isInsufficientBalanceError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error?.response?.data?.message;
  const errorString = Array.isArray(errorMessage)
    ? errorMessage.join(" ").toLowerCase()
    : typeof errorMessage === "string"
      ? errorMessage.toLowerCase()
      : "";

  const errorText = errorString || error?.message?.toLowerCase() || "";

  // Check for various insufficient balance error patterns
  const insufficientBalancePatterns = [
    "insufficient",
    "insufficient balance",
    "insufficient funds",
    "not enough balance",
    "not enough funds",
    "low balance",
    "insufficient wallet balance",
    "insufficient account balance",
    "balance too low",
    "funds insufficient",
  ];

  return insufficientBalancePatterns.some((pattern) =>
    errorText.includes(pattern)
  );
};

/**
 * Extracts amount and balance information from error response
 */
export const extractBalanceInfo = (error: any): {
  requiredAmount?: number;
  currentBalance?: number;
} => {
  const errorData = error?.response?.data;
  const errorMessage = errorData?.message;

  let requiredAmount: number | undefined;
  let currentBalance: number | undefined;

  // Try to extract from error message or data
  if (errorData) {
    // Check if amounts are in the error data
    if (typeof errorData.requiredAmount === "number") {
      requiredAmount = errorData.requiredAmount;
    }
    if (typeof errorData.currentBalance === "number") {
      currentBalance = errorData.currentBalance;
    }
    if (typeof errorData.balance === "number") {
      currentBalance = errorData.balance;
    }
    if (typeof errorData.amount === "number") {
      requiredAmount = errorData.amount;
    }
  }

  // Try to extract from error message text
  const errorString = Array.isArray(errorMessage)
    ? errorMessage.join(" ")
    : typeof errorMessage === "string"
      ? errorMessage
      : "";

  // Try to find amounts in the error message (e.g., "Required: ₦100,000", "Balance: ₦50,000")
  const amountMatches = errorString.match(/[₦$]?\s*([\d,]+\.?\d*)/g);
  if (amountMatches && amountMatches.length >= 1) {
    const amounts = amountMatches.map((match) =>
      parseFloat(match.replace(/[₦$,\s]/g, ""))
    );
    if (amounts.length >= 2) {
      requiredAmount = amounts[0];
      currentBalance = amounts[1];
    } else if (amounts.length === 1 && !requiredAmount) {
      requiredAmount = amounts[0];
    }
  }

  return { requiredAmount, currentBalance };
};

























































