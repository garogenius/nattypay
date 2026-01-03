/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCurrencyAccountRequest,
  getCurrencyAccountsRequest,
  getCurrencyAccountByCurrencyRequest,
  createCardRequest,
  getCardsRequest,
  getCardByIdRequest,
  fundCardRequest,
  freezeCardRequest,
  unfreezeCardRequest,
  setCardLimitsRequest,
  blockCardRequest,
  closeCardRequest,
  withdrawCardRequest,
  getCardTransactionsRequest,
  convertCurrencyRequest,
  getCurrencyRatesRequest,
  getSupportedCurrenciesRequest,
} from "./currency.apis";
import {
  IFundCard,
  ISetCardLimits,
  IWithdrawCard,
  IVirtualCard,
  ICardTransaction,
  ICurrencyRate,
  ISupportedCurrency,
} from "./currency.types";

// Currency Accounts Hooks
export const useCreateCurrencyAccount = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCurrencyAccountRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currency-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["currency-account"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useGetCurrencyAccounts = () => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["currency-accounts"],
    queryFn: () => getCurrencyAccountsRequest(),
  });

  // Handle different possible response structures
  let accounts: any[] = [];
  if (data?.data) {
    // Try data.data.accounts first (most common structure)
    if (Array.isArray(data.data.accounts)) {
      accounts = data.data.accounts;
    }
    // Try data.data.data (nested array)
    else if (Array.isArray(data.data.data)) {
      accounts = data.data.data;
    }
    // Try data.data if it's an array
    else if (Array.isArray(data.data)) {
      accounts = data.data;
    }
  }

  // Ensure accounts is always an array
  if (!Array.isArray(accounts)) {
    accounts = [];
  }

  // Debug: Log accounts list
  if (process.env.NODE_ENV === 'development') {
    console.log('useGetCurrencyAccounts:', {
      accountsCount: accounts.length,
      accounts: accounts.map(acc => ({
        currency: acc?.currency,
        accountNumber: acc?.accountNumber,
        accountName: acc?.accountName,
      })),
      isPending,
      isError,
    });
  }

  return { accounts, isPending, isError, refetch };
};

export const useGetCurrencyAccountByCurrency = (currency: string) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["currency-account", currency],
    queryFn: () => getCurrencyAccountByCurrencyRequest(currency),
    enabled: !!currency && currency !== "NGN",
    retry: false, // Don't retry on 404 errors
  });

  // Debug: Log raw response structure
  if (process.env.NODE_ENV === 'development' && data) {
    console.log('Raw API Response:', {
      data,
      'data.data': data.data,
      'data.data.account': data.data?.account,
      'data.data.data': data.data?.data,
    });
  }

  // Check if error is a 404 (account not found)
  // Also check if response data contains 404 status code (some APIs return 200 with 404 in data)
  const errorMessage = error?.response?.data?.message;
  const errorMessageStr = Array.isArray(errorMessage) 
    ? errorMessage.join(" ").toLowerCase()
    : typeof errorMessage === "string" 
      ? errorMessage.toLowerCase() 
      : "";
  
  const isNotFoundFromError = isError && (
    error?.response?.status === 404 || 
    error?.response?.data?.statusCode === 404 ||
    (errorMessageStr && errorMessageStr.includes("not found")) ||
    (errorMessageStr && errorMessageStr.includes("no") && errorMessageStr.includes("account"))
  );

  // Debug: Log error details
  if (process.env.NODE_ENV === 'development' && isError) {
    console.log('Currency Account Query Error:', {
      currency,
      error,
      'error.response.status': error?.response?.status,
      'error.response.data': error?.response?.data,
      isNotFoundFromError,
    });
  }

  // Debug: Log data structure
  if (process.env.NODE_ENV === 'development' && data) {
    console.log('Processing Currency Account Data:', {
      currency,
      'data.data': data.data,
      'data.data.statusCode': data.data?.statusCode,
      'data.data.message': data.data?.message,
      'data.data.data': data.data?.data,
      'data.data.data.account': data.data?.data?.account,
    });
  }

  // Handle different possible response structures
  let account: any = null;
  let isNotFoundFromData = false;
  if (data?.data) {
    // Safely convert message to string for comparison
    const dataMessage = data.data.message;
    const dataMessageStr = Array.isArray(dataMessage) 
      ? dataMessage.join(" ").toLowerCase()
      : typeof dataMessage === "string" 
        ? dataMessage.toLowerCase() 
        : "";
    
    // Check if response indicates account not found (even if status is 200)
    if (data.data.statusCode === 404 || 
        (dataMessageStr && dataMessageStr.includes("not found")) || 
        (data.data.data?.account === null && dataMessageStr && dataMessageStr.includes("no")) ||
        (dataMessageStr && dataMessageStr.includes("no") && dataMessageStr.includes("account") && data.data.data?.account === null)) {
      // Account not found - return null
      account = null;
      isNotFoundFromData = true;
    }
    // Try data.data.account first (response structure: { data: { account: {...} } })
    else if (data.data.account && typeof data.data.account === "object" && !Array.isArray(data.data.account)) {
      account = data.data.account;
      // Debug log in development to verify data extraction
      if (process.env.NODE_ENV === 'development') {
        console.log('Extracted account from data.data.account:', {
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          bankName: account.bankName,
          currency: account.currency,
          fullAccount: account,
        });
      }
    }
    // Try data.data.data.account (deeply nested structure: { data: { data: { account: {...} } } })
    else if (data.data.data?.account && typeof data.data.data.account === "object" && !Array.isArray(data.data.data.account)) {
      account = data.data.data.account;
      // Debug log in development to verify data extraction
      if (process.env.NODE_ENV === 'development') {
        console.log('Extracted account from data.data.data.account:', {
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          bankName: account.bankName,
          currency: account.currency,
          fullAccount: account,
        });
      }
    }
    // Try data.data.data (nested structure)
    else if (data.data.data && typeof data.data.data === "object" && !Array.isArray(data.data.data) && data.data.data.currency) {
      account = data.data.data;
      // Debug log in development to verify data extraction
      if (process.env.NODE_ENV === 'development') {
        console.log('Extracted account from data.data.data:', {
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          bankName: account.bankName,
          currency: account.currency,
          fullAccount: account,
        });
      }
    }
    // Try data.data if it's an object (direct account object)
    else if (typeof data.data === "object" && !Array.isArray(data.data) && data.data.currency) {
      account = data.data;
      // Debug log in development to verify data extraction
      if (process.env.NODE_ENV === 'development') {
        console.log('Extracted account from data.data:', {
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          bankName: account.bankName,
          currency: account.currency,
          fullAccount: account,
        });
      }
    }
    
    // Debug: Log if no account was extracted
    if (process.env.NODE_ENV === 'development' && !account && !isNotFoundFromData) {
      console.warn('No account extracted from response:', {
        currency,
        'data.data': data.data,
        'data.data.account': data.data?.account,
        'data.data.data': data.data?.data,
        'data.data.data.account': data.data?.data?.account,
      });
    }
  }

  // Normalize field names to handle both camelCase and snake_case
  // IMPORTANT: Preserve exact API values - only add fallbacks for truly missing fields
  if (account) {
    // Start with the original account object to preserve all existing values
    const normalizedAccount = { ...account };
    
    // Only add fallback values if the primary field is missing (null/undefined)
    // This preserves the exact API response values
    if (normalizedAccount.accountNumber == null && normalizedAccount.account_number == null) {
      normalizedAccount.accountNumber = "-";
    } else if (normalizedAccount.accountNumber == null) {
      normalizedAccount.accountNumber = normalizedAccount.account_number;
    }
    
    if (normalizedAccount.bankName == null && normalizedAccount.bank_name == null) {
      normalizedAccount.bankName = "NattyPay";
    } else if (normalizedAccount.bankName == null) {
      normalizedAccount.bankName = normalizedAccount.bank_name;
    }
    
    if (normalizedAccount.accountName == null && normalizedAccount.account_name == null && normalizedAccount.label == null) {
      normalizedAccount.accountName = "";
    } else if (normalizedAccount.accountName == null) {
      normalizedAccount.accountName = normalizedAccount.account_name ?? normalizedAccount.label ?? "";
    }
    
    // Ensure balance is a number (preserve 0 if that's what API returns)
    if (typeof normalizedAccount.balance !== "number") {
      normalizedAccount.balance = parseFloat(normalizedAccount.balance) || 0;
    }
    
    // Debug log in development to verify normalization
    if (process.env.NODE_ENV === 'development') {
      console.log('Account Normalization:', {
        'Original account object': {
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          bankName: account.bankName,
          balance: account.balance,
          currency: account.currency,
          account_number: account.account_number,
          account_name: account.account_name,
          bank_name: account.bank_name,
          label: account.label,
          allKeys: Object.keys(account),
        },
        'Normalized account': {
          accountNumber: normalizedAccount.accountNumber,
          accountName: normalizedAccount.accountName,
          bankName: normalizedAccount.bankName,
          balance: normalizedAccount.balance,
          currency: normalizedAccount.currency,
          allKeys: Object.keys(normalizedAccount),
        },
        'Values preserved': {
          accountNumberPreserved: normalizedAccount.accountNumber === account.accountNumber || normalizedAccount.accountNumber === account.account_number,
          accountNamePreserved: normalizedAccount.accountName === account.accountName || normalizedAccount.accountName === account.account_name || normalizedAccount.accountName === account.label,
          bankNamePreserved: normalizedAccount.bankName === account.bankName || normalizedAccount.bankName === account.bank_name,
        },
      });
    }
    
    account = normalizedAccount;
  }

  const isNotFound = isNotFoundFromError || isNotFoundFromData;

  // Debug: Log final return value
  if (process.env.NODE_ENV === 'development') {
    console.log('useGetCurrencyAccountByCurrency Return:', {
      currency,
      hasAccount: !!account,
      account: account ? {
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        bankName: account.bankName,
        currency: account.currency,
        balance: account.balance,
      } : null,
      isPending,
      isError: isError && !isNotFound,
      isNotFound,
      isNotFoundFromError,
      isNotFoundFromData,
    });
  }

  return { account, isPending, isError: isError && !isNotFound, isNotFound };
};

// Virtual Cards Hooks
export const useCreateCard = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCardRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currency-cards"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useGetCards = () => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["currency-cards"],
    queryFn: () => getCardsRequest(),
  });

  // Handle different possible response structures
  let cards: IVirtualCard[] = [];
  if (data?.data) {
    // Try data.data.data first (nested array)
    if (Array.isArray(data.data.data)) {
      cards = data.data.data;
    }
    // Try data.data if it's an array
    else if (Array.isArray(data.data)) {
      cards = data.data;
    }
    // Try data.data.cards if it exists
    else if (Array.isArray(data.data.cards)) {
      cards = data.data.cards;
    }
  }

  // Ensure cards is always an array
  if (!Array.isArray(cards)) {
    cards = [];
  }

  return { cards, isPending, isError, refetch };
};

export const useGetCardById = (cardId: string | null) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["currency-card", cardId],
    queryFn: () => getCardByIdRequest(cardId!),
    enabled: !!cardId,
  });

  const card: IVirtualCard | null = data?.data?.data || null;

  return { card, isPending, isError };
};

export const useFundCard = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, formdata }: { cardId: string; formdata: IFundCard }) =>
      fundCardRequest(cardId, formdata),
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currency-cards"] });
      queryClient.invalidateQueries({ queryKey: ["currency-card"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data);
    },
  });
};

export const useFreezeCard = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: freezeCardRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currency-cards"] });
      queryClient.invalidateQueries({ queryKey: ["currency-card"] });
      onSuccess(data);
    },
  });
};

export const useUnfreezeCard = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfreezeCardRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currency-cards"] });
      queryClient.invalidateQueries({ queryKey: ["currency-card"] });
      onSuccess(data);
    },
  });
};

export const useSetCardLimits = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, formdata }: { cardId: string; formdata: ISetCardLimits }) =>
      setCardLimitsRequest(cardId, formdata),
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currency-cards"] });
      queryClient.invalidateQueries({ queryKey: ["currency-card"] });
      onSuccess(data);
    },
  });
};

export const useBlockCard = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockCardRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currency-cards"] });
      queryClient.invalidateQueries({ queryKey: ["currency-card"] });
      onSuccess(data);
    },
  });
};

export const useCloseCard = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeCardRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currency-cards"] });
      queryClient.invalidateQueries({ queryKey: ["currency-card"] });
      onSuccess(data);
    },
  });
};

export const useWithdrawCard = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, formdata }: { cardId: string; formdata: IWithdrawCard }) =>
      withdrawCardRequest(cardId, formdata),
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currency-cards"] });
      queryClient.invalidateQueries({ queryKey: ["currency-card"] });
      queryClient.invalidateQueries({ queryKey: ["currency-card-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data);
    },
  });
};

export const useGetCardTransactions = (
  cardId: string | null,
  params?: { page?: number; limit?: number }
) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["currency-card-transactions", cardId, params],
    queryFn: () => getCardTransactionsRequest(cardId!, params),
    enabled: !!cardId,
  });

  const transactions: ICardTransaction[] = data?.data?.data?.transactions || [];
  const totalCount = data?.data?.data?.totalCount || 0;
  const totalPages = data?.data?.data?.totalPages || 0;

  return { transactions, totalCount, totalPages, isPending, isError };
};

// Currency Conversion Hooks
export const useConvertCurrency = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: convertCurrencyRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data);
    },
  });
};

export const useGetCurrencyRates = (params?: { from?: string; to?: string }) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["currency-rates", params],
    queryFn: () => getCurrencyRatesRequest(params),
    enabled: !!params?.from && !!params?.to && params.from !== params.to,
  });

  // API returns single rate object, not array
  const rateData: ICurrencyRate | null = data?.data?.data || null;

  return { rateData, isPending, isError };
};

export const useGetSupportedCurrencies = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["supported-currencies"],
    queryFn: () => getSupportedCurrenciesRequest(),
  });

  const currencies: ISupportedCurrency[] = data?.data?.data || [];

  return { currencies, isPending, isError };
};





