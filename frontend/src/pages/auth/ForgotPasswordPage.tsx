
import * as React from "react"
import { Link } from "react-router-dom"
import { AuthLayout } from "../../layouts"
import { PrimaryButton, SecondaryButton } from "@/components/gym"
import { Input } from "@/components/ui/input"
import { authService } from "@/services/auth.service"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await authService.forgotPassword({ email })
      setIsSubmitted(true)
      toast.success("Password reset link sent!")
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to send reset link"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`We've sent a password reset link to ${email}`}
      >
        <div className="space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-primary flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-foreground font-medium">Reset link sent!</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SecondaryButton
              onClick={() => setIsSubmitted(false)}
              className="w-full"
            >
              Try a different email
            </SecondaryButton>
            
            <Link to="/auth/login" className="block">
              <PrimaryButton className="w-full">
                Back to Sign In
              </PrimaryButton>
            </Link>
          </div>

          <p className="text-center text-muted-foreground text-sm">
            Didn&apos;t receive the email?{" "}
            <button
              onClick={handleSubmit}
              className="text-primary font-medium hover:underline"
            >
              Click to resend
            </button>
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="No worries, we'll send you reset instructions"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            floatingLabel="Email address"
            placeholder="you@example.com"
          />
        </div>

        {/* Submit Button */}
        <PrimaryButton type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Send Reset Link
        </PrimaryButton>

        {/* Back to Login */}
        <Link
          to="/auth/login"
          className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to sign in
        </Link>
      </form>
    </AuthLayout>
  )
}
