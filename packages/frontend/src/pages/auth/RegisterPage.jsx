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
    role: "member",
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
      const { confirmPassword, ...registrationData } = result.data;
      await register(registrationData);
      // Auto-login happens in register function, redirect to dashboard
      navigate("/");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            Create Your Account
          </h1>
          
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs sm:text-sm text-red-800">{apiError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              label="First Name"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              placeholder="Enter your first name"
              required
              disabled={isLoading}
            />
            
            <Input
              label="Last Name"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              placeholder="Enter your last name"
              required
              disabled={isLoading}
            />
            
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password (min 6 characters)"
              required
              disabled={isLoading}
            />
            
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
            />
            
            <div className="mb-4">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] sm:min-h-0"
              >
                <option value="member">Member</option>
                <option value="trainer">Trainer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.role}
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Register
            </Button>
          </form>
          
          <div className="mt-4 sm:mt-6 text-center">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
