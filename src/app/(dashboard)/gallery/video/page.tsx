"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { GalleryForm } from '@/components/Gallery/GalleryForm';
import { GalleryItem } from '@/types/gallery';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';

export default function VideoPage() {
  const { token } = useAuth();
  const [videos, setVideos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<GalleryItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gallery?galleryType=video`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch videos');
      const data = await response.json();
      setVideos(data.gallery);
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id: string) => {
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
      if (!response.ok) throw new Error('Failed to delete video');
      await fetchVideos();
      return true;
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <Breadcrumb pageName="Video Gallery" />

      <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default">
        <div className="p-4 md:p-6 xl:p-9">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Video Gallery
            </h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90"
            >
              Upload New Video
            </button>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="group relative overflow-hidden rounded-lg"
                >
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={video.thumbnail || video.url}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="h-12 w-12 text-white opacity-80"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-60">
                    <div className="hidden gap-3 group-hover:flex">
                      <button
                        onClick={() => {
                          setEditingItem(video);
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
                          toast.promise(handleDelete(video._id), {
                            loading: "Deleting...",
                            success: "Video deleted successfully",
                            error: "Failed to delete video",
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
                        onClick={() => setPreviewVideo(video)}
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
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="dark:bg-boxdark bg-white p-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      {video.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-gray-600 dark:text-gray-400">
                        {video.category}
                      </p>
                      {video.duration && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {Math.floor(video.duration / 60)}:
                          {String(video.duration % 60).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
                  {editingItem ? "Edit Video" : "Upload New Video"}
                </h3>
                <GalleryForm
                  type="video"
                  onSuccess={() => {
                    setIsFormOpen(false);
                    setEditingItem(null);
                    fetchVideos();
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

          {/* Video Preview Modal */}
          {previewVideo && isMounted && createPortal(
            <div 
              className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-75 p-4" 
              style={{ zIndex: 9999 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setPreviewVideo(null);
                }
              }}
            >
              <div className="dark:bg-boxdark relative w-full max-w-4xl rounded-lg bg-white shadow-2xl">
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="absolute -top-10 right-0 text-white hover:text-gray-300"
                >
                  Close
                </button>
                <video
                  src={previewVideo.url}
                  controls
                  className="w-full rounded-lg"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </>
  );
}