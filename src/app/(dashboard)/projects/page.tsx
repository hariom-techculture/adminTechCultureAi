"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { Category } from '@/types/category';
import { CategoryCard } from '@/components/CategoryCard';
import { CategoryForm } from '@/components/CategoryForm';
import { ProjectList } from '@/components/ProjectList';

export default function ProjectsPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/category`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.categories || []);
      
      // Fetch project counts for each category
      const counts: Record<string, number> = {};
      for (const category of data.categories || []) {
        try {
          const projectResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/projects/category/${category._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (projectResponse.ok) {
            const projectData = await projectResponse.json();
            counts[category._id] = projectData.projects?.length || 0;
          }
        } catch (error) {
          counts[category._id] = 0;
        }
      }
      setProjectCounts(counts);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    fetchCategories(); // Refresh categories and project counts
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/category/${categoryId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete category');
        }
        await fetchCategories();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Deleting category...',
      success: 'Category deleted!',
      error: (error: any) => error.message || 'Failed to delete category',
    });
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    fetchCategories();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  // If a category is selected, show the projects for that category
  if (selectedCategory) {
    return (
      <>
        <Breadcrumb pageName="Projects" />
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="p-4 md:p-6 xl:p-9">
            <ProjectList
              category={selectedCategory}
              onBack={handleBackToCategories}
              token={token || ''}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Project Categories" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-4 md:p-6 xl:p-9">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Project Categories
            </h2>
            <button
              onClick={handleCreateCategory}
              className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90"
            >
              Add New Category
            </button>
          </div>

          {/* Category Form Modal */}
          {isFormOpen && isMounted && createPortal(
            <div 
              className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4" 
              style={{ zIndex: 9999 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleFormCancel();
                }
              }}
            >
              <div className="dark:bg-boxdark max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
                <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <CategoryForm
                  category={editingCategory}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                  token={token || ''}
                />
              </div>
            </div>,
            document.body
          )}

          {/* Categories Grid */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div key={category._id} className="relative">
                  <CategoryCard
                    category={category}
                    onClick={handleCategoryClick}
                    projectCount={projectCounts[category._id] || 0}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}
                      className="rounded-full bg-white/90 p-1 text-xs text-primary hover:bg-white"
                      title="Edit category"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category._id);
                      }}
                      className="rounded-full bg-white/90 p-1 text-xs text-red-500 hover:bg-white"
                      title="Delete category"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {categories.length === 0 && !loading && (
            <div className="flex h-32 items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                No categories found. Create your first category to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}