"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Service } from "@/types/service";
import Image from "next/image";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import InputGroup from "@/components/FormElements/InputGroup";

export default function ServicesPage() {
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const servicesPerPage = 9;
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "main",
    features: [] as string[],
    file: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchServices = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services?category=main&page=${page}&limit=${servicesPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      
      setServices(data.services || []);
      setCurrentPage(data.pagination?.currentPage || 1);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalServices(data.pagination?.totalServices || 0);
      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(currentPage);
  }, [currentPage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      formData.features.length === 0
    ) {
      toast.error(
        "Please fill in all required fields and add at least one feature",
      );
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key === "features") {
            data.append(key, JSON.stringify(value));
          } else if (key === "file" && value) {
            if (value instanceof File) {
              data.append("file", value);
            }
          } else {
            data.append(key, String(value));
          }
        });

        const url = editingService
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/services/${editingService._id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/services`;

        const response = await fetch(url, {
          method: editingService ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        });

        if (!response.ok) throw new Error("Failed to save service");
        
        // If creating a new service, go to page 1 to see it
        const pageToFetch = editingService ? currentPage : 1;
        if (!editingService) setCurrentPage(1);
        
        await fetchServices(pageToFetch);
        resetForm();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: editingService ? "Updating service..." : "Creating service...",
      success: editingService ? "Service updated!" : "Service created!",
      error: "Failed to save service",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) throw new Error("Failed to delete service");
        await fetchServices(currentPage);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: "Deleting service...",
      success: "Service deleted!",
      error: "Failed to delete service",
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "main",
      features: [],
      file: null,
    });
    setPreviewUrl(null);
    setEditingService(null);
    setIsFormOpen(false);
    setFeatureInput("");
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      features: service.features,
      file: null,
    });
    setPreviewUrl(service.image || null);
    setIsFormOpen(true);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  return (
    <>
      <Breadcrumb pageName="Services" />

      <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default">
        <div className="p-4 md:p-6 xl:p-9">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Services
            </h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90"
            >
              Add New Service
            </button>
          </div>

          {isFormOpen &&
            isMounted &&
            createPortal(
              <div
                className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4"
                style={{ zIndex: 9999 }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    resetForm();
                  }
                }}
              >
                <div className="dark:bg-boxdark max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
                  <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                    {editingService ? "Edit Service" : "Add New Service"}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <InputGroup
                      label="Title"
                      type="text"
                      placeholder="Enter service title"
                      required
                      value={formData.title}
                      handleChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />

                    <TextAreaGroup
                      label="Description"
                      placeholder="Enter service description"
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />

                    <div className="space-y-2">
                      <label className="mb-3 block text-black dark:text-white">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      >
                        <option value="main">Main</option>
                        <option value="industry">Industry</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="mb-3 block text-black dark:text-white">
                        Features
                      </label>
                      <div className="flex gap-2">
                        <InputGroup
                          label=""
                          type="text"
                          placeholder="Add feature"
                          value={featureInput}
                          handleChange={(e) => setFeatureInput(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={addFeature}
                          className="rounded-lg bg-primary px-4 py-2 text-white"
                        >
                          Add
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-700"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  features: prev.features.filter(
                                    (_, i) => i !== index,
                                  ),
                                }))
                              }
                              className="text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <InputGroup
                      placeholder=""
                      label="Service Image"
                      type="file"
                      accept="image/*"
                      required={!editingService}
                      handleChange={handleFileChange}
                    />

                    {previewUrl && (
                      <div className="relative mt-4 aspect-video">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="rounded-lg object-contain"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90"
                      >
                        {editingService ? "Update" : "Create"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body,
            )}

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="dark:border-strokedark group relative overflow-hidden rounded-lg border border-stroke"
                >
                  {service.image && (
                    <div className="relative aspect-video">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      {service.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-gray-600 dark:text-gray-400">
                      {service.description}
                    </p>
                    <div className="mt-3">
                      <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Features:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {service.features.map((feature, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                        {service.category}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="inline-flex items-center justify-center rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * servicesPerPage) + 1} to {Math.min(currentPage * servicesPerPage, totalServices)} of {totalServices} services
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
