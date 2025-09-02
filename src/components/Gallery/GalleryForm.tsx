"use client";

import { useState, useEffect } from 'react';
import InputGroup from '@/components/FormElements/InputGroup';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { GalleryFormData, GalleryItem } from '@/types/gallery';
import Image from 'next/image';

interface GalleryFormProps {
  type: 'image' | 'video';
  onSuccess: () => void;
  initialData?: GalleryItem;
  onCancel: () => void;
}

export function GalleryForm({ type, onSuccess, initialData, onCancel }: GalleryFormProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialData?.url || null);
  const [formData, setFormData] = useState<GalleryFormData>({
    title: initialData?.title || '',
    category: initialData?.category || '',
    galleryType: type,
    file: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup preview URL on unmount
      if (preview && !preview.includes('cloudinary')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!initialData && !formData.file) {
      toast.error(`Please select a ${type} to upload`);
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('galleryType', type);
        if (formData.file) {
          data.append('file', formData.file);
        }

        const url = initialData 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/gallery/${initialData._id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/gallery`;

        const response = await fetch(url, {
          method: initialData ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        });

        if (!response.ok) throw new Error(`Failed to ${initialData ? 'update' : 'upload'} ${type}`);
        
        resolve(true);
        onSuccess();
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: initialData ? 'Updating...' : 'Uploading...',
      success: `${type} ${initialData ? 'updated' : 'uploaded'} successfully!`,
      error: (err) => err.message || `Failed to ${initialData ? 'update' : 'upload'} ${type}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputGroup
        label="Title"
        type="text"
        placeholder="Enter title"
        required
        value={formData.title}
        handleChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
      />

      <InputGroup
        label="Category"
        type="text"
        placeholder="Enter category"
        required
        value={formData.category}
        handleChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
      />

      <div className="space-y-2">
        <InputGroup
        placeholder=''
          label={`Upload ${type}`}
          type="file"
          accept={type === 'image' ? "image/*" : "video/*"}
          required={!initialData}
          handleChange={handleFileChange}
        />

        {preview && (
          <div className="mt-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {type === 'image' ? (
              <div className="relative aspect-4/3">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <video
                src={preview}
                controls
                className="w-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update' : 'Upload'}
        </button>
      </div>
    </form>
  );
}