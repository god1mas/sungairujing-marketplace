export type ChangePasswordActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialChangePasswordActionState: ChangePasswordActionState = {
  success: false,
  message: "",
};
