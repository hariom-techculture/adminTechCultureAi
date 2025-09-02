"use client";

import { EmailIcon } from "@/assets/icons";
import { useState } from "react";
import { toast } from "react-hot-toast";
import InputGroup from "../../FormElements/InputGroup";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send OTP");
      }

      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Invalid OTP");
      }

      toast.success("OTP verified successfully");
      // After OTP verification, you can proceed with password reset logic
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
        Reset Your Password
      </h2>

      {!otpSent ? (
        <form onSubmit={handleSubmit}>
          <InputGroup
            type="email"
            label="Email"
            className="mb-4"
            placeholder="Enter your email"
            name="email"
            handleChange={(e) => setEmail(e.target.value)}
            value={email}
            icon={<EmailIcon />}
          />

          <div className="mb-5">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send Reset OTP
              {loading && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <InputGroup
            type="text"
            label="OTP"
            className="mb-4"
            placeholder="Enter OTP"
            name="otp"
            handleChange={(e) => setOtp(e.target.value)}
            value={otp}
          />

          <div className="mb-5">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Verify OTP
              {loading && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
              )}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Remember your password?{" "}
          <a href="/auth/sign-in" className="text-primary hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
