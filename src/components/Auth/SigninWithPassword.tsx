"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { useAuth } from "@/hooks/useAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SigninWithPassword() {
  const router = useRouter();
  const { setUser: updateAuthUser, setToken: updateAuthToken } = useAuth();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to sign in");
      }

      // Store user data and token in cookies only (1 day expiry)
      const userData = result.user;
      const token = result.token;
      const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Always 1 day

      const cookieData = {
        user: userData,
        expiry: expirationDate.getTime()
      };

      // Set cookies with 1 day expiry
      const cookieExpiry = 1; // 1 day
      const maxAge = 60 * 60 * 24 * cookieExpiry; // 1 day in seconds
      
      document.cookie = `token=${token}; path=/; max-age=${maxAge}`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(cookieData))}; path=/; max-age=${maxAge}`;
      document.cookie = `tokenExpiry=${expirationDate.getTime()}; path=/; max-age=${maxAge}`;

      // Update auth context
      updateAuthUser(userData);
      updateAuthToken(token);

      toast.success("Signed in successfully");
      
      // Check if there's a callback URL
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get("callbackUrl");
      
      router.push(callbackUrl || "/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        type="email"
        label="Email"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="Password"
        className="mb-5 [&_input]:py-[15px]"
        placeholder="Enter your password"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <div className="mb-6 flex items-center justify-end gap-2 py-2 font-medium">
        <Link
          href="/auth/forgot-password"
          className="hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Forgot Password?
        </Link>
      </div>

      <div className="mb-4.5">
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
        >
          Sign In
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
    </form>
  );
}
