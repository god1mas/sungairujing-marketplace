export type RegistrationActionState = {
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialRegistrationActionState: RegistrationActionState = {
  message: "",
};
