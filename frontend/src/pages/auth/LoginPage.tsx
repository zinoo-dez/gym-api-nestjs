import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Apple, Chrome, Eye, EyeOff, Facebook } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
} as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const from = location.state?.from?.pathname || "/app";

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      const response = await authService.login(data);
      setAuth(response.user, response.accessToken);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to login. Please check your credentials.");
    }
  };

  return (
    <motion.form initial="hidden" animate="show" variants={container} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <motion.div variants={item} className="space-y-2">
        <h1 className="page-title">Welcome back!</h1>
        <p className="body-text text-muted-foreground">Sign in to continue managing your gym workflow.</p>
      </motion.div>

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

      <motion.div variants={item} className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="small-text text-muted-foreground">Password</label>
          <Link to="/forgot-password" className="text-sm font-medium hover:text-primary transition-colors">Forgot Password?</Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="w-full border border-input bg-background rounded-md px-3 py-2 pr-10 text-sm"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {errors.password ? <p className="small-text text-destructive">{errors.password.message}</p> : null}
      </motion.div>

      <motion.button
        variants={item}
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary-hover hover:bg-primary/90 px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Log In"}
      </motion.button>

      <motion.div variants={item} className="relative py-2 text-center">
        <div className="absolute left-0 right-0 top-1/2 border-b border-input" />
        <span className="relative bg-background px-3 small-text text-muted-foreground">or continue with</span>
      </motion.div>

      <motion.div variants={item} className="flex items-center justify-center gap-4">
        {[Chrome, Apple, Facebook].map((Icon, idx) => (
          <button
            key={idx}
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-input bg-background text-muted-foreground hover:text-primary hover:border-primary transition-colors"
          >
            <Icon className="size-5" />
          </button>
        ))}
      </motion.div>

      <motion.p variants={item} className="text-center body-text text-muted-foreground">
        Not a member?{" "}
        <Link to="/register" className="text-sm font-medium hover:text-primary transition-colors">Register now</Link>
      </motion.p>
    </motion.form>
  );
}
