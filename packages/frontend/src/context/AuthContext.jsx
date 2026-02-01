/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */

import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth.js";
import { STORAGE_KEYS } from "../utils/constants.js";

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} role
 * @property {string} firstName
 * @property {string} lastName
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User|null} user - Current authenticated user
 * @property {boolean} loading - Whether authentication state is being loaded
 * @property {Function} login - Login function
 * @property {Function} logout - Logout function
 * @property {Function} register - Register function
 */

const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth methods
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Validate token and fetch user data on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      
      if (token && storedUser) {
        try {
          // Parse stored user data
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          // Invalid stored data
          console.error("Failed to parse stored user data:", error);
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login with credentials
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   */
  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    
    // Store token and user data (backend returns accessToken)
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    
    setUser(response.user);
    
    return response;
  };

  /**
   * Register a new user account
   * @param {Object} userData - Registration data
   */
  const register = async (userData) => {
    const response = await authApi.register(userData);
    
    // Auto-login after successful registration (backend returns accessToken)
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    
    setUser(response.user);
    
    return response;
  };

  /**
   * Logout current user
   */
  const logout = () => {
    // Clear authentication data
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context
 * @returns {AuthContextValue} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
