import ForgotPassword from "@/components/Auth/ForgotPassword";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="flex flex-wrap items-center">
        <div className="w-full xl:w-1/2">
          <div className="w-full p-4 sm:p-12.5 xl:p-15">
            <ForgotPassword />
          </div>
        </div>

        <div className="hidden w-full xl:block xl:w-1/2">
          <div className="py-17.5 px-26 text-center">
            <p className="2xl:px-20">
              Enter your email and we&apos;ll send you a one-time password (OTP) to reset your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
