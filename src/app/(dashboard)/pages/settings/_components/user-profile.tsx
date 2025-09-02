"use client";

import { EmailIcon, UploadIcon, UserIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/user";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";

export function UserProfileForm() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.profilePicture || null
  );
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      if (selectedFile) {
        formDataToSend.append("file", selectedFile);
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      // Update the user context with new data
      if (setUser) {
        setUser({
          ...user!,
          ...data.user,
        } as User);
      }

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center gap-3">
        {previewUrl ? (
          <Image
            src={previewUrl}
            width={55}
            height={55}
            alt="User"
            className="size-14 rounded-full object-cover"
          />
        ) : (
          <div className="size-14 rounded-full bg-gray-200 dark:bg-gray-700" />
        )}
      </div>

      <InputGroup
        className="mb-5.5 "
        type="text"
        name="name"
        label="Full Name"
        placeholder="Enter your name"
        value={formData.name}
        handleChange={handleChange}
        icon={<UserIcon />}
        iconPosition="left"
        height="sm"
        required
      />

      <InputGroup
        className="mb-5.5"
        type="email"
        name="email"
        label="Email Address"
        placeholder="Enter your email"
        value={formData.email}
        handleChange={handleChange}
        icon={<EmailIcon />}
        iconPosition="left"
        height="sm"
        required
      />

      <div className="relative mb-5.5 block w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary">
        <input
          type="file"
          name="profilePhoto"
          id="profilePhoto"
          accept="image/png, image/jpg, image/jpeg"
          hidden
          onChange={handleFileChange}
        />

        <label
          htmlFor="profilePhoto"
          className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
        >
          <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
            <UploadIcon />
          </div>

          <p className="mt-2.5 text-body-sm font-medium">
            <span className="text-primary">Click to upload</span> or drag and
            drop
          </p>

          <p className="mt-1 text-body-xs">
            SVG, PNG, JPG or GIF (max, 800 X 800px)
          </p>
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
          onClick={() => {
            setFormData({ name: user?.name || "", email: user?.email || "" });
            setSelectedFile(null);
            setPreviewUrl(user?.profilePicture || null);
          }}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="size-5 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </form>
  );
}
