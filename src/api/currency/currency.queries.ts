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
  ICreateCurrencyAccount,
  ICreateCard,
  IFundCard,
  ISetCardLimits,
  IWithdrawCard,
  IConvertCurrency,
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
    // Try data.data.data first (nested array)
    if (Array.isArray(data.data.data)) {
      accounts = data.data.data;
    }
    // Try data.data if it's an array
    else if (Array.isArray(data.data)) {
      accounts = data.data;
    }
    // Try data.data.accounts if it exists
    else if (Array.isArray(data.data.accounts)) {
      accounts = data.data.accounts;
    }
  }

  return { accounts, isPending, isError, refetch };
};

export const useGetCurrencyAccountByCurrency = (currency: string) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["currency-account", currency],
    queryFn: () => getCurrencyAccountByCurrencyRequest(currency),
    enabled: !!currency && currency !== "NGN",
  });

  const account: any = data?.data?.data;

  return { account, isPending, isError };
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

  const cards: IVirtualCard[] = data?.data?.data || [];

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





