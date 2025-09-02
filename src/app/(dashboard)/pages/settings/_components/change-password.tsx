"use client";

import { EmailIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { useAuth } from "@/hooks/useAuth";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      toast.success("Password updated successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        className="mb-5.5"
        type="password"
        name="currentPassword"
        label="Current Password"
        placeholder="Enter your email"
        value={formData.currentPassword}
        handleChange={handleChange}
        icon={<LockKeyhole />}
        iconPosition="left"
        height="sm"
        required
      />

      <InputGroup
        className="mb-5.5"
        type="password"
        name="newPassword"
        label="New Password"
        placeholder="Enter new password"
        value={formData.newPassword}
        handleChange={handleChange}
        icon={<LockKeyhole />}
        iconPosition="left"
        height="sm"
        required
      />

      {/* <div className="mb-5.5">
        <label className="mb-2.5 block font-medium text-black dark:text-white">
          New Password
        </label>
        <input
          type="password"
          name="newPassword"
          placeholder="Enter new password"
          value={formData.newPassword}
          onChange={handleChange}
          className="dark:border-form-strokedark dark:bg-form-input w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:focus:border-primary"
          required
        />
      </div> */}

      <InputGroup
        className="mb-5.5"
        type="password"
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm new password"
        value={formData.confirmPassword}
        handleChange={handleChange}
        icon={<LockKeyhole />}
        iconPosition="left"
        height="sm"
        required
      />

      {/* <div className="mb-5.5">
        <label className="mb-2.5 block font-medium text-black dark:text-white">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="dark:border-form-strokedark dark:bg-form-input w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:focus:border-primary"
          required
        />
      </div> */}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="size-5 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
          ) : (
            "Change Password"
          )}
        </button>
      </div>
    </form>
  );
}
