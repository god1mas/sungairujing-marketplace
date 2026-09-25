export type ReportActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialReportState: ReportActionState = { success: false };
