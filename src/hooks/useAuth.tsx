// src/hooks/useAuth.tsx
"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // Install this package: npm install jwt-decode
import {AuthContextType,User} from "@/types/user"

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  signOut: () => {},
  loading: true,
  setUser: () => {},
  setToken: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper function to get cookie value
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Helper function to set cookie
  const setCookie = (name: string, value: string, days: number = 1) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
  };

  // Helper function to delete cookie
  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; max-age=0`;
  };

  const clearAllAuthData = () => {
    deleteCookie("token");
    deleteCookie("user");
    deleteCookie("tokenExpiry");
  };

  const signOut = () => {
    clearAllAuthData();
    setUser(null);
    setToken(null);
    router.push("/auth/sign-in");
  };

  const checkAuthExpiration = () => {
    try {
      const token = getCookie("token");
      const tokenExpiry = getCookie("tokenExpiry");
      const userCookie = getCookie("user");
      
      // If no token in cookies, clear everything
      if (!token) {
        clearAllAuthData();
        return false;
      }

      // Check token expiration
      if (tokenExpiry && parseInt(tokenExpiry) < Date.now()) {
        signOut();
        return false;
      }

      // Check user data
      if (!userCookie) {
        // Token exists but no user data - clear everything
        signOut();
        return false;
      }

      try {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        if (userData.expiry && userData.expiry < Date.now()) {
          signOut();
          return false;
        }
        
        // Update user state if not already set
        if (!userData.user) {
          signOut();
          return false;
        }
      } catch (parseError) {
        // Invalid user data format
        signOut();
        return false;
      }

      return true;
    } catch (error) {
      signOut();
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      const token = getCookie("token");
      const userCookie = getCookie("user");
      const tokenExpiry = getCookie("tokenExpiry");

      // Check if we have both token and user data in cookies
      if (token && userCookie) {
        // Check if token and user data are still valid
        if (checkAuthExpiration()) {
          try {
            const userData = JSON.parse(decodeURIComponent(userCookie));
            if (userData.user) {
              setUser(userData.user);
              setToken(token);
            } else {
              // Invalid user data structure
              clearAllAuthData();
            }
          } catch (error) {
            // Invalid JSON in cookie
            clearAllAuthData();
          }
        }
      } else {
        // If we don't have both token and user data, clear everything
        clearAllAuthData();
      }
      setLoading(false);
    };

    initializeAuth();

    // Check expiration every minute
    const expiryCheckInterval = setInterval(() => {
      if (user && token) {
        checkAuthExpiration();
      }
    }, 60000);

    return () => clearInterval(expiryCheckInterval);
  }, [router]);

  // Show loading state only during initial auth check
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      signOut, 
      loading,
      setUser,
      setToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
