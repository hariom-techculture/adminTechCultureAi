"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { GalleryForm } from '@/components/Gallery/GalleryForm';
import { GalleryItem } from '@/types/gallery';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';

export default function PhotosPage() {
  const { token } = useAuth();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gallery?galleryType=image`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data.gallery);
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gallery/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to delete image');
      toast.success('Image deleted successfully');
      fetchImages();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  return (
    <>
      <Breadcrumb pageName="Photo Gallery" />

      <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default">
        <div className="p-4 md:p-6 xl:p-9">
          {/* Header section */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Photo Gallery
            </h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90"
            >
              Upload New Image
            </button>
          </div>

          {/* Gallery Form */}
          {isFormOpen && isMounted && createPortal(
            <div 
              className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4" 
              style={{ zIndex: 9999 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsFormOpen(false);
                  setEditingItem(null);
                }
              }}
            >
              <div className="dark:bg-boxdark w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
                <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                  {editingItem ? "Edit Image" : "Upload New Image"}
                </h3>
                <GalleryForm
                  type="image"
                  onSuccess={() => {
                    setIsFormOpen(false);
                    setEditingItem(null);
                    fetchImages();
                  }}
                  initialData={editingItem ?? undefined}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingItem(null);
                  }}
                />
              </div>
            </div>,
            document.body
          )}

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image._id}
                  className="group relative overflow-hidden rounded-lg"
                >
                  <div className="bg-gray-100 dark:bg-gray-800 aspect-4/3">
                    <Image
                      src={image.url}
                      alt={image.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-60">
                    <div className="hidden gap-3 group-hover:flex">
                      <button
                        onClick={() => {
                          setEditingItem(image);
                          setIsFormOpen(true);
                        }}
                        className="rounded-full bg-white/90 p-3 text-primary hover:bg-white"
                        title="Edit"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          toast.promise(handleDelete(image._id), {
                            loading: "Deleting...",
                            success: "Image deleted successfully",
                            error: "Failed to delete image",
                          });
                        }}
                        className="rounded-full bg-red-500/90 p-3 text-white hover:bg-red-500"
                        title="Delete"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => window.open(image.url, "_blank")}
                        className="rounded-full bg-blue-500/90 p-3 text-white hover:bg-blue-500"
                        title="Preview"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="dark:bg-boxdark bg-white p-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      {image.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {image.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}