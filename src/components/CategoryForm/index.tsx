import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import InputGroup from '@/components/FormElements/InputGroup';
import Image from 'next/image';
import { Category } from '@/types/category';

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
  token: string;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSuccess,
  onCancel,
  token,
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    file: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(category?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.file) {
        data.append('file', formData.file);
      }

      const url = category
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/projects/category/${category._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/projects/category`;

      const response = await fetch(url, {
        method: category ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) throw new Error('Failed to save category');

      toast.success(category ? 'Category updated!' : 'Category created!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputGroup
        label="Category Name"
        type="text"
        placeholder="Enter category name"
        required
        value={formData.name}
        handleChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            name: e.target.value,
          }))
        }
      />

      <InputGroup
        placeholder=""
        label="Category Image"
        type="file"
        accept="image/*"
        required={!category}
        handleChange={handleFileChange}
      />

      {previewUrl && (
        <div className="relative mt-4 aspect-video">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="rounded-lg object-cover"
          />
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.name.trim()}
          className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Saving...'
            : category
            ? 'Update Category'
            : 'Create Category'}
        </button>
      </div>
    </form>
  );
};
