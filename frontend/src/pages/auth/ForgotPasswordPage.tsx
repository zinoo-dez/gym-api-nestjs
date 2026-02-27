import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth.service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
} as const;

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setError(null);
      setMessage(null);
      const response = await authService.forgotPassword(data.email);
      setMessage(response.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to request password reset.");
    }
  };

  return (
    <motion.form initial="hidden" animate="show" variants={container} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <motion.div variants={item} className="space-y-2">
        <h1 className="page-title">Forgot password?</h1>
        <p className="body-text text-muted-foreground">Enter your email and we will send you a reset link.</p>
      </motion.div>

      {message ? (
        <motion.div variants={item} className="rounded-md bg-success/10 p-3 text-sm font-medium text-success">
          {message}
        </motion.div>
      ) : null}
      {error ? (
        <motion.div variants={item} className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {error}
        </motion.div>
      ) : null}

      <motion.div variants={item} className="space-y-2">
        <label htmlFor="email" className="small-text text-muted-foreground">Email</label>
        <input
          id="email"
          type="email"
          placeholder="name@example.com"
          className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm"
          {...register("email")}
        />
        {errors.email ? <p className="small-text text-destructive">{errors.email.message}</p> : null}
      </motion.div>

      <motion.button
        variants={item}
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary-hover hover:bg-primary/90 px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </motion.button>

      <motion.p variants={item} className="text-center">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ArrowLeft className="size-4" /> Back to login
        </Link>
      </motion.p>
    </motion.form>
  );
}
