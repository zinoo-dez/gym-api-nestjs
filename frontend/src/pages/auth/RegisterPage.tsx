import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { PrimaryButton } from "@/components/gym";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { useGymSettings } from "@/hooks/use-gym-settings";

export default function RegisterPage() {
  const { gymName } = useGymSettings();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: "MEMBER", // Default role for registration
      });

      setAuth(response);
      toast.success("Account created successfully!");

      // Redirect to member dashboard after registration
      navigate("/member");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Start your journey"
      subtitle={`Create your account and join the ${gymName} community`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/25 rounded-lg p-4 animate-feedback-shake">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              id="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              floatingLabel="First name"
              placeholder="John"
            />
          </div>
          <div>
            <Input
              id="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              floatingLabel="Last name"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            floatingLabel="Email address"
            placeholder="you@example.com"
          />
        </div>

        {/* Role */}
        <div>
          <Input
            id="role"
            type="text"
            readOnly
            value="Member"
            floatingLabel="Account type"
          />
        </div>

        {/* Phone */}
        <div>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            floatingLabel="Phone number"
            placeholder="(555) 123-4567"
          />
        </div>

        {/* Password */}
        <div>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            floatingLabel="Password"
            placeholder="Min. 8 characters"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            floatingLabel="Confirm password"
            placeholder="Re-enter your password"
          />
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start">
          <input
            id="agree-terms"
            type="checkbox"
            required
            checked={formData.agreeToTerms}
            onChange={(e) =>
              setFormData({ ...formData, agreeToTerms: e.target.checked })
            }
            className="w-4 h-4 mt-0.5 bg-secondary border-border rounded-[4px] text-primary focus:ring-primary focus:ring-offset-background"
          />
          <label
            htmlFor="agree-terms"
            className="ml-2 text-sm text-muted-foreground"
          >
            I agree to the{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Submit Button */}
        <PrimaryButton
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Create Account
        </PrimaryButton>

        {/* Sign In Link */}
        <p className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
