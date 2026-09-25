export type MerchantProfileActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialMerchantProfileActionState: MerchantProfileActionState = {
  success: false,
};
