/**
 * LoginPage Component
 * User login page with form validation and error handling
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { loginSchema } from "../../schemas/auth.js";
import { Input } from "../../components/common/Input.jsx";
import { Button } from "../../components/common/Button.jsx";
import { AnimatedPage } from "../../components/animated/index.js";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    
    // Clear API error when user modifies form
    if (apiError) {
      setApiError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    setApiError("");
    
    // Validate with Zod schema
    const result = loginSchema.safeParse(formData);
    
    if (!result.success) {
      // Convert Zod errors to field errors
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    // Submit to API
    setIsLoading(true);
    
    try {
      await login(result.data);
      // Redirect to dashboard on success
      navigate("/dashboard");
    } catch (error) {
      // Handle API errors
      console.error("Login error:", error);
      
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setApiError("Invalid email or password");
      } else if (error.code === "ECONNABORTED" || !error.response) {
        setApiError("Connection failed. Please check your internet connection.");
      } else {
        setApiError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      {/* Abstract Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">
              Welcome <span className="text-blue-500">Back</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2">Enter your credentials to access your premier portal</p>
          </div>
          
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="assertive">
              <p className="text-xs sm:text-sm text-red-800">{apiError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate aria-label="Login form">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="name@example.com"
              required
              disabled={isLoading}
              autoComplete="email"
              variant="dark"
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
              disabled={isLoading}
              autoComplete="current-password"
              variant="dark"
            />
            
            <Button
              type="submit"
              variant="premium"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full mt-4"
              aria-label="Login to your account"
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              New to Gym Premier?{" "}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
              >
                Join Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
