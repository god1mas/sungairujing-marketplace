export type ProductActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialProductActionState: ProductActionState = {
  success: false,
};
