/**
 * RegisterPage Component
 * User registration page with form validation and auto-login
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { registerSchema } from "../../schemas/auth.js";
import { Input } from "../../components/common/Input.jsx";
import { Button } from "../../components/common/Button.jsx";
import { AnimatedPage } from "../../components/animated/index.js";
import { motion } from "framer-motion";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "MEMBER",
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
    const result = registerSchema.safeParse(formData);
    
    if (!result.success) {
      // Convert Zod errors to field errors
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    // Submit to API (exclude confirmPassword from API call)
    setIsLoading(true);
    
    try {
      const { confirmPassword: _confirmPassword, ...registrationData } = result.data;
      await register(registrationData);
      // Auto-login happens in register function, redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      // Handle API errors
      console.error("Registration error:", error);
      
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else if (error.response?.status === 409) {
        setApiError("An account with this email already exists");
      } else if (error.response?.status === 400) {
        // Handle validation errors from backend
        if (error.response.data?.errors) {
          const fieldErrors = {};
          error.response.data.errors.forEach((err) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          setApiError("Invalid submission. Verify all protocols.");
        }
      } else if (error.code === "ECONNABORTED" || !error.response) {
        setApiError("Connection failed. Check your uplink.");
      } else {
        setApiError("Internal system error. Retry later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[700px] h-[700px] bg-[#22c55e]/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[0%] right-[-10%] w-[600px] h-[600px] bg-[#84cc16]/10 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="max-w-[580px] w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-[#171717] border border-white/5 rounded-[3rem] p-8 sm:p-16"
        >
          <div className="mb-12 text-center">
            <Link to="/" className="inline-flex items-center gap-3 mb-10 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#22c55e] to-[#84cc16] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform">
                <span className="text-black font-black text-xl">G</span>
              </div>
              <span className="text-xl font-black uppercase tracking-tighter group-hover:text-[#22c55e] transition-colors">Gym Elite</span>
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4">
              Join <span className="text-[#22c55e]">The Elite</span>
            </h1>
            <p className="text-gray-500 text-sm">Start your transformation journey today</p>
          </div>
          
          {apiError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
            >
              <p className="text-sm text-red-400">{apiError}</p>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="John"
                required
                disabled={isLoading}
                variant="dark"
              />
              
              <Input
                label="Last Name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Doe"
                required
                disabled={isLoading}
                variant="dark"
              />
            </div>
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="john@example.com"
              required
              disabled={isLoading}
              variant="dark"
            />
            
            <div className="grid sm:grid-cols-2 gap-6">
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
                variant="dark"
              />
              
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
                required
                disabled={isLoading}
                variant="dark"
              />
            </div>
            
            <div className="mb-6">
              <label
                htmlFor="role"
                className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
              >
                Account Type
                {<span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 focus:border-[#22c55e]/50 appearance-none disabled:bg-gray-900 disabled:cursor-not-allowed text-sm transition-all"
                >
                  <option value="MEMBER" className="bg-[#0a0a0a] text-white">Member</option>
                  <option value="TRAINER" className="bg-[#0a0a0a] text-white">Trainer</option>
                  <option value="ADMIN" className="bg-[#0a0a0a] text-white">Admin</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.role && (
                <p className="mt-2 text-xs text-red-500" role="alert">
                  {errors.role}
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              variant="premium"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full !py-4 uppercase tracking-wider font-bold text-sm bg-[#22c55e] hover:bg-[#84cc16] text-black"
            >
              Create Account
            </Button>
          </form>
          
          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#22c55e] hover:text-[#84cc16] font-bold transition-colors"
              >
                Sign In
              </Link>
            </p>
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-400 text-xs mt-4 inline-block transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
