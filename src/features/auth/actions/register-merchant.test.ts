import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  registerMerchant: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/services/merchant-registration-service", () => ({
  registerMerchant: mocks.registerMerchant,
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { registerMerchantAction } from "./register-merchant";
import { initialRegistrationActionState } from "./register-merchant-state";

const createFormData = () => {
  const formData = new FormData();
  formData.set("ownerName", "Siti Aminah");
  formData.set("merchantName", "Dapur Siti");
  formData.set("whatsappNumber", "081234567890");
  formData.set("password", "rahasia8");
  formData.set("merchantAddress", "Desa Sungairujing");
  formData.set("termsAccepted", "on");
  return formData;
};

describe("registerMerchantAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps the UI initial state available outside the Server Action module", () => {
    expect(initialRegistrationActionState).toEqual({ message: "" });
  });

  it("redirects a successful registration to Login without creating a session", async () => {
    mocks.registerMerchant.mockResolvedValue({
      success: true,
      registration: { userId: "user-id", merchantId: "merchant-id" },
    });

    const actionResult = registerMerchantAction(
      initialRegistrationActionState,
      createFormData(),
    );
    expect(actionResult).toBeInstanceOf(Promise);
    await actionResult;

    expect(mocks.redirect).toHaveBeenCalledWith("/login?registered=1");
  });

  it("returns safe validation errors without redirecting", async () => {
    mocks.registerMerchant.mockResolvedValue({
      success: false,
      message: "Periksa kembali data registrasi.",
      fieldErrors: { ownerName: ["Nama pemilik wajib diisi."] },
    });

    const result = await registerMerchantAction(
      initialRegistrationActionState,
      createFormData(),
    );

    expect(result).toEqual({
      message: "Periksa kembali data registrasi.",
      fieldErrors: { ownerName: ["Nama pemilik wajib diisi."] },
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
