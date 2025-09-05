"use client";

import { UploadIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface TestimonialFormProps {
  testimonial?: {
    _id?: string;
    name: string;
    title: string;
    message: string;
    image?: string;
    backgroundImage?: string;
  } | null;
  onClose: () => void;
}

export function TestimonialForm({ testimonial, onClose }: TestimonialFormProps) {
  const [formData, setFormData] = useState(() => ({
    name: testimonial?.name || "",
    title: testimonial?.title || "",
    message: testimonial?.message || "",
    image: null as File | null,
    backgroundImage: null as File | null,
  }));
  const [previewUrl, setPreviewUrl] = useState<string | null>(testimonial?.image || null);
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(testimonial?.backgroundImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when testimonial prop changes
  useEffect(() => {
    setFormData({
      name: testimonial?.name || "",
      title: testimonial?.title || "",
      message: testimonial?.message || "",
      image: null,
      backgroundImage: null,
    });
    setPreviewUrl(testimonial?.image || null);
    setBackgroundPreviewUrl(testimonial?.backgroundImage || null);
  }, [testimonial]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSubmitting(true);

    const loadingToast = toast.loading("Saving testimonial...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("message", formData.message);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      if (formData.backgroundImage) {
        formDataToSend.append("backgroundImage", formData.backgroundImage);
      }

      const url = testimonial?._id
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/${testimonial._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`;

      const method = testimonial?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to save testimonial");
      }

      const result = await response.json();
      toast.success("Testimonial saved successfully!", {
        id: loadingToast,
      });
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error saving testimonial:", error);
      toast.error((error as Error).message || "Failed to save testimonial", {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview URL for the selected image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Cleanup previous preview URL
      return () => URL.revokeObjectURL(url);
    }
  };

  const handleBackgroundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        backgroundImage: file,
      }));

      // Create preview URL for the selected background image
      const url = URL.createObjectURL(file);
      setBackgroundPreviewUrl(url);

      // Cleanup previous preview URL
      return () => URL.revokeObjectURL(url);
    }
  };

  return (
    <ShowcaseSection
      title={testimonial ? "Edit Testimonial" : "Add New Testimonial"}
      className="!p-6.5 !mb-10"
    >
      <form onSubmit={handleSubmit}>
        <InputGroup
          label="Name"
          type="text"
          placeholder="Enter name"
          className="mb-4.5"
          required
          value={formData.name}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
        />

        <InputGroup
          label="Title"
          type="text"
          placeholder="Enter title"
          className="mb-4.5"
          required
          value={formData.title}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />

        <TextAreaGroup
          label="Message"
          placeholder="Enter testimonial message"
          required
          value={formData.message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev) => ({ ...prev, message: e.target.value }))
          }
          className="mb-4.5"
        />

        <div className="mb-4.5">
          <InputGroup
            label="Image"
            type="file"
            placeholder="Upload image"
            fileStyleVariant="style1"
            required={!testimonial?._id}
            accept="image/*"
            handleChange={handleFileChange}
          />
          
          {previewUrl && (
            <div className="mt-3">
              <div className="relative mb-2 size-20">
                <Image 
                  src={previewUrl} 
                  alt="Selected image preview"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              {testimonial?.image && (
                <p className="text-body-sm text-dark-6">
                  Current image will be replaced when you save
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mb-4.5">
          <InputGroup
            label="Background Image (Optional)"
            type="file"
            placeholder="Upload background image"
            fileStyleVariant="style1"
            required={false}
            accept="image/*"
            handleChange={handleBackgroundFileChange}
          />
          
          {backgroundPreviewUrl && (
            <div className="mt-3">
              <div className="relative mb-2 w-32 h-20">
                <Image 
                  src={backgroundPreviewUrl} 
                  alt="Selected background image preview"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              {testimonial?.backgroundImage && (
                <p className="text-body-sm text-dark-6">
                  Current background image will be replaced when you save
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex justify-center rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:opacity-70"
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
