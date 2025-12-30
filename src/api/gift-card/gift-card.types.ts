export type IGCPayload = {
  productId: number;
  currency: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  walletPin: string;
};

export type IGetGCFxRate = {
  amount: number;
  currency: string;
};
