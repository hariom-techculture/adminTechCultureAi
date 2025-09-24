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
  const [removeBackgroundImage, setRemoveBackgroundImage] = useState(false);

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
    setRemoveBackgroundImage(false);
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
      
      // Send flag to remove background image
      if (removeBackgroundImage) {
        formDataToSend.append("removeBackgroundImage", "true");
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
      setIsSubmitting(false);
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
      setRemoveBackgroundImage(false); // Reset remove flag when new image is selected

      // Cleanup previous preview URL
      return () => URL.revokeObjectURL(url);
    }
  };

  const handleRemoveBackgroundImage = () => {
    setBackgroundPreviewUrl(null);
    setFormData((prev) => ({
      ...prev,
      backgroundImage: null,
    }));
    setRemoveBackgroundImage(true);
    
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]:last-of-type') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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
          <div className="flex items-center justify-between mb-2">
            <InputGroup
              label="Background Image (Optional)"
              type="file"
              placeholder="Upload background image"
              fileStyleVariant="style1"
              required={false}
              accept="image/*"
              handleChange={handleBackgroundFileChange}
            />
          </div>
          
          {backgroundPreviewUrl && !removeBackgroundImage && (
            <div className="mt-3">
              <div className="flex items-start gap-3">
                <div className="relative mb-2 w-32 h-20">
                  <Image 
                    src={backgroundPreviewUrl} 
                    alt="Selected background image preview"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveBackgroundImage}
                  className="flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm font-medium transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>
              {testimonial?.backgroundImage && !formData.backgroundImage && (
                <p className="text-body-sm text-dark-6 mt-2">
                  Current background image will be {removeBackgroundImage ? 'removed' : 'replaced'} when you save
                </p>
              )}
            </div>
          )}
          
          {removeBackgroundImage && (
            <div className="mt-3">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Background image will be removed when you save
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRemoveBackgroundImage(false);
                    setBackgroundPreviewUrl(testimonial?.backgroundImage || null);
                  }}
                  className="ml-auto text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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
