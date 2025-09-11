import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Category } from '@/types/category';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
  token: string;
}

interface FormData {
  name: string;
  description: string;
  file: File | null;
}

export const CategoryForm = ({ category, onSuccess, onCancel, token }: CategoryFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    file: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        file: null,
      });
      setPreviewUrl(category.image);
    }
  }, [category]);

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
      data.append('description', formData.description);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      toast.success(category ? 'Category updated successfully!' : 'Category created successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
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
        handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFormData(prev => ({
            ...prev,
            name: e.target.value,
          }))
        }
      />

      <TextAreaGroup
        label="Description"
        placeholder="Enter category description"
        required
        value={formData.description}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setFormData(prev => ({
            ...prev,
            description: e.target.value,
          }))
        }
      />

      <InputGroup
        label="Category Image"
        type="file"
        placeholder=""
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
          className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? (category ? 'Updating...' : 'Creating...') : (category ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
};
