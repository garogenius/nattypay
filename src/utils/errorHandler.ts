/**
 * Utility functions for handling errors globally
 */

/**
 * Checks if an error is related to insufficient balance/funds
 */
export const isInsufficientBalanceError = (error: any): boolean => {
  const errorMessage = error?.response?.data?.message;
  const errorString = Array.isArray(errorMessage)
    ? errorMessage.join(" ").toLowerCase()
    : typeof errorMessage === "string"
    ? errorMessage.toLowerCase()
    : "";

  const insufficientBalanceKeywords = [
    "insufficient",
    "insufficient balance",
    "insufficient funds",
    "not enough balance",
    "not enough funds",
    "low balance",
    "insufficient wallet balance",
    "insufficient account balance",
  ];

  return insufficientBalanceKeywords.some((keyword) =>
    errorString.includes(keyword)
  );
};

/**
 * Extracts amount and balance information from error message if available
 */
export const extractBalanceInfo = (error: any): {
  requiredAmount?: number;
  currentBalance?: number;
} => {
  const errorMessage = error?.response?.data?.message;
  const errorString = Array.isArray(errorMessage)
    ? errorMessage.join(" ")
    : typeof errorMessage === "string"
    ? errorMessage
    : "";

  // Try to extract amounts from error message
  const amountRegex = /₦?([\d,]+\.?\d*)/g;
  const amounts = errorString.match(amountRegex)?.map((amt) =>
    parseFloat(amt.replace(/[₦,]/g, ""))
  );

  return {
    requiredAmount: amounts?.[0],
    currentBalance: amounts?.[1],
  };
};

