export type VerificationActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialVerificationActionState: VerificationActionState = {
  success: false,
};
