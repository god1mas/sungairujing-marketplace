import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/merchant-profile/actions", () => ({
  initialMerchantProfileActionState: { success: false },
  replaceMerchantLogoAction: vi.fn(),
  updateMerchantProfileAction: vi.fn(),
}));

import { MerchantProfileForm } from "./merchant-profile-form";

const closed = { closed: true as const };
const profile = {
  name: "Dapur Sungairujing",
  slug: "dapur-sungairujing",
  description: "Masakan lokal",
  address: "Desa Sungairujing",
  publicWhatsappNumber: "6281234567890",
  loginWhatsappNumber: "6281234567890",
  openingHours: {
    senin: closed,
    selasa: closed,
    rabu: closed,
    kamis: closed,
    jumat: closed,
    sabtu: closed,
    minggu: closed,
  },
  operationalStatus: "BUKA" as const,
  verificationStatus: "BELUM_DIVERIFIKASI" as const,
  logoUrl: null,
};

describe("MerchantProfileForm", () => {
  it("keeps factual profile data visible while disabling public mutations", () => {
    render(<MerchantProfileForm profile={profile} readOnly />);
    expect(screen.getByDisplayValue("Dapur Sungairujing")).toBeDisabled();
    expect(screen.getByText("+6281234567890")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Unggah Logo" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Simpan Profil" }),
    ).toBeDisabled();
  });
});
