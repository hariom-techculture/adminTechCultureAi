"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

interface Department {
  label: string;
  value: string;
}

const departments: Department[] = [
  { label: "Engineering", value: "engineering" },
  { label: "Design", value: "design" },
  { label: "Marketing", value: "marketing" },
  { label: "Product", value: "product" },
  { label: "Operations", value: "operations" },
  { label: "Sales", value: "sales" },
];

interface TeamMember {
  _id?: string;
  name: string;
  description: string;
  designation: string;
  department: string;
  profilePicture?: string;
  socialLinks: string[];
}

interface TeamFormProps {
  member?: TeamMember | null;
  onClose: () => void;
}

export function TeamForm({ member, onClose }: TeamFormProps) {
  const {token} = useAuth();
  const [formData, setFormData] = useState(() => ({
    name: member?.name || "",
    description: member?.description || "",
    designation: member?.designation || "",
    department: member?.department || "",
    socialLinks: member?.socialLinks || ["", "", ""],
  }));
  const [previewUrl, setPreviewUrl] = useState<string | null>(member?.profilePicture || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: member?.name || "",
      description: member?.description || "",
      designation: member?.designation || "",
      department: member?.department || "",
      socialLinks: member?.socialLinks || ["", "", ""],
    });
    setPreviewUrl(member?.profilePicture || null);
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loadingToast = toast.loading("Saving team member...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("designation", formData.designation);
      formDataToSend.append("department", formData.department);
      formData.socialLinks.forEach((link, index) => {
        if (link) formDataToSend.append("socialLinks[]", link);
      });

      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (fileInput?.files?.[0]) {
        formDataToSend.append("file", fileInput.files[0]);
      }

      const url = member?._id
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${member._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/employees`;

      const method = member?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to save team member");
      }

      const result = await response.json();
      toast.success("Team member saved successfully!", {
        id: loadingToast,
      });
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error((error as Error).message || "Failed to save team member", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Create preview URL for the selected image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Cleanup previous preview URL
      return () => URL.revokeObjectURL(url);
    }
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => i === index ? value : link),
    }));
  };

  return (
    <ShowcaseSection
      title={member ? "Edit Team Member" : "Add Team Member"}
      className="!p-6.5 !mb-10"
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-4 md:col-span-1">
          <InputGroup
            label="Name"
            type="text"
            placeholder="Enter name"
            required
            value={formData.name}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          <InputGroup
            label="Designation"
            type="text"
            placeholder="Enter designation"
            required
            value={formData.designation}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, designation: e.target.value }))
            }
          />

          <div className="space-y-3">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Department
            </label>
            <select
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              value={formData.department}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, department: e.target.value }))
              }
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 md:col-span-1">
          <TextAreaGroup
            label="Description"
            placeholder="Enter team member's bio"
            required
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />

          <div className="space-y-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Social Links
            </label>
            {formData.socialLinks.map((link, index) => (
              <InputGroup
                key={index}
                label={`Social Link ${index + 1}`}
                type="url"
                placeholder={`Enter social media link ${index + 1}`}
                value={link}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialLinkChange(index, e.target.value)
                }
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="mb-4.5">
            <InputGroup
              label="Profile Picture"
              type="file"
              placeholder="Upload image"
              fileStyleVariant="style1"
              required={!member?._id}
              accept="image/*"
              handleChange={handleFileChange}
            />
            
            {previewUrl && (
              <div className="mt-3">
                <div className="relative h-40 w-40 overflow-hidden rounded-lg">
                  <Image 
                    src={previewUrl} 
                    alt="Profile picture preview"
                    fill
                    className="object-cover"
                  />
                </div>
                {member?.profilePicture && (
                  <p className="mt-2 text-sm text-gray-500">
                    Current image will be replaced when you save
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 md:col-span-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex justify-center rounded-lg border border-stroke px-6 py-2.5 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
