export type PasswordRecoveryDeliveryInput = {
  whatsappNumber: string;
  rawToken: string;
  expiresAt: Date;
};

export interface PasswordRecoveryDelivery {
  sendResetToken(input: PasswordRecoveryDeliveryInput): Promise<void>;
}

export const PASSWORD_RECOVERY_UNAVAILABLE_MESSAGE =
  "Pemulihan password melalui WhatsApp belum tersedia.";
