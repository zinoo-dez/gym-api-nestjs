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
      navigate("/");
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
    <AnimatedPage className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            Login to Gym Management
          </h1>
          
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="assertive">
              <p className="text-xs sm:text-sm text-red-800">{apiError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate aria-label="Login form">
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
              autoComplete="email"
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full"
              aria-label="Login to your account"
            >
              Login
            </Button>
          </form>
          
          <div className="mt-4 sm:mt-6 text-center">
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded font-medium text-xs sm:text-sm"
            >
              Don't have an account? Register
            </Link>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
