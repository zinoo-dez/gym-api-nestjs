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
          setApiError("Invalid registration data. Please check your inputs.");
        }
      } else if (error.code === "ECONNABORTED" || !error.response) {
        setApiError("Connection failed. Please check your internet connection.");
      } else {
        setApiError("An error occurred during registration. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      {/* Abstract Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[0%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full relative z-10">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">
              Join <span className="text-blue-500">The Elite</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2">Complete your profile to start your premier journey</p>
          </div>
          
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs sm:text-sm text-red-800">{apiError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
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
            
            <div className="grid sm:grid-cols-2 gap-4">
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
                className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider"
              >
                Select Your Role
                {<span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:bg-gray-800 disabled:cursor-not-allowed text-sm sm:text-base transition-all"
              >
                <option value="MEMBER" className="bg-zinc-900">Member</option>
                <option value="TRAINER" className="bg-zinc-900">Trainer</option>
                <option value="ADMIN" className="bg-zinc-900">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600 font-medium" role="alert">
                  {errors.role}
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              variant="premium"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Join The Elite
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Already a member?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
