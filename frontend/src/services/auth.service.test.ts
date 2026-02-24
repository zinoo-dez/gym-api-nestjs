import { describe, expect, it, vi, beforeEach } from "vitest";
import { authService } from "@/services/auth.service";
import api from "@/services/api";

vi.mock("@/services/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls forgot password endpoint", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { data: { message: "If the email exists, a reset link has been sent." } },
    } as any);

    const result = await authService.forgotPassword("member@example.com");

    expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", {
      email: "member@example.com",
    });
    expect(result.message).toContain("reset link");
  });

  it("calls reset password endpoint", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { data: { message: "Password reset successfully" } },
    } as any);

    const result = await authService.resetPassword("token-123", "SecurePass123!");

    expect(api.post).toHaveBeenCalledWith("/auth/reset-password", {
      token: "token-123",
      newPassword: "SecurePass123!",
    });
    expect(result.message).toBe("Password reset successfully");
  });
});
