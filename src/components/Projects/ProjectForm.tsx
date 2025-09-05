"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ProjectFormProps {
  project?: {
    _id?: string;
    title: string;
    description: string;
    category: string;
    location?: string;
    technologies: string[];
    status: string;
    image?: string;
    portfolioImages?: string[];
  } | null;
  onClose: () => void;
}

export function ProjectForm({ project, onClose }: ProjectFormProps) {
  const [formData, setFormData] = useState(() => ({
    title: project?.title || "",
    description: project?.description || "",
    category: project?.category || "",
    location: project?.location || "",
    technologies: project?.technologies?.join(", ") || "",
    status: project?.status || "ongoing",
    image: null as File | null,
    portfolioImages: [] as File[],
  }));
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(project?.image || null);
  const [portfolioPreviewUrls, setPortfolioPreviewUrls] = useState<string[]>(
    project?.portfolioImages || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when project prop changes
  useEffect(() => {
    setFormData({
      title: project?.title || "",
      description: project?.description || "",
      category: project?.category || "",
      location: project?.location || "",
      technologies: project?.technologies?.join(", ") || "",
      status: project?.status || "ongoing",
      image: null,
      portfolioImages: [],
    });
    setPreviewUrl(project?.image || null);
    setPortfolioPreviewUrls(project?.portfolioImages || []);
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loadingToast = toast.loading("Saving project...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("status", formData.status);
      
      // Handle technologies array
      const techArray = formData.technologies.split(",").map(tech => tech.trim()).filter(tech => tech);
      techArray.forEach(tech => {
        formDataToSend.append("technologies", tech);
      });

      // Handle main image
      if (formData.image) {
        formDataToSend.append("file", formData.image);
      }

      // Handle portfolio images
      formData.portfolioImages.forEach((file) => {
        formDataToSend.append("portfolioImages", file);
      });

      const url = project?._id
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${project._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/projects`;

      const method = project?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      const result = await response.json();
      toast.success("Project saved successfully!", {
        id: loadingToast,
      });
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error((error as Error).message || "Failed to save project", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      return () => URL.revokeObjectURL(url);
    }
  };

  const handlePortfolioImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        portfolioImages: [...prev.portfolioImages, ...files],
      }));

      const newUrls = files.map(file => URL.createObjectURL(file));
      setPortfolioPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removePortfolioImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, i) => i !== index)
    }));
    
    setPortfolioPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke URL if it's a blob URL
      if (prev[index]?.startsWith('blob:')) {
        URL.revokeObjectURL(prev[index]);
      }
      return newUrls;
    });
  };

  return (
    <ShowcaseSection
      title={project ? "Edit Project" : "Add New Project"}
      className="!p-6.5 !mb-10"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4.5">
          <InputGroup
            label="Project Title"
            type="text"
            placeholder="Enter project title"
            required
            value={formData.title}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
          />

          <InputGroup
            label="Category"
            type="text"
            placeholder="e.g., AI/ML, Web Development"
            required
            value={formData.category}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
          />
        </div>

        <TextAreaGroup
          label="Description"
          placeholder="Enter project description"
          required
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="mb-4.5"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4.5">
          <InputGroup
            label="Location (Optional)"
            type="text"
            placeholder="Project location"
            value={formData.location}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
          />

          <div>
            <label className="mb-2 block text-black dark:text-white">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full rounded-lg border border-stroke bg-transparent py-[15px] px-6 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <InputGroup
          label="Technologies"
          type="text"
          placeholder="React, Node.js, AI/ML (comma separated)"
          value={formData.technologies}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, technologies: e.target.value }))
          }
          className="mb-4.5"
        />

        <div className="mb-4.5">
          <InputGroup
            label="Main Project Image"
            type="file"
            placeholder="Upload main image"
            fileStyleVariant="style1"
            required={!project?._id}
            accept="image/*"
            handleChange={handleImageChange}
          />
          
          {previewUrl && (
            <div className="mt-3">
              <div className="relative mb-2 w-32 h-24">
                <Image 
                  src={previewUrl} 
                  alt="Main image preview"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              {project?.image && (
                <p className="text-body-sm text-dark-6">
                  Current image will be replaced when you save
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mb-4.5">
          <label className="mb-2 block text-black dark:text-white">
            Portfolio Images (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePortfolioImagesChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-[15px] px-6 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          />
          
          {portfolioPreviewUrls.length > 0 && (
            <div className="mt-3">
              <p className="text-body-sm text-dark-6 mb-3">
                Portfolio Images ({portfolioPreviewUrls.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {portfolioPreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-20">
                      <Image 
                        src={url} 
                        alt={`Portfolio image ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePortfolioImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {project?.portfolioImages && project.portfolioImages.length > 0 && (
                <p className="text-body-sm text-dark-6 mt-2">
                  Note: Uploading new images will replace existing portfolio images
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
              "Save Project"
            )}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
