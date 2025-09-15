import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Project } from '@/types/project';
import { Category } from '@/types/category';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';

interface ProjectListProps {
  category: Category;
  onBack: () => void;
  token: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({ 
  category, 
  onBack, 
  token 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    technologies: [] as string[],
    status: 'ongoing' as 'ongoing' | 'completed',
    file: null as File | null,
    portfolioImages: [] as File[],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [portfolioPreviewUrls, setPortfolioPreviewUrls] = useState<string[]>([]);
  const [existingPortfolioUrls, setExistingPortfolioUrls] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/category/${category._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [category._id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePortfolioImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        portfolioImages: [...prev.portfolioImages, ...files],
      }));

      const newUrls = files.map(file => URL.createObjectURL(file));
      setPortfolioPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removePortfolioImage = (index: number) => {
    const urlToRemove = portfolioPreviewUrls[index];
    
    // Check if this is an existing image or a new file
    const existingIndex = existingPortfolioUrls.indexOf(urlToRemove);
    if (existingIndex !== -1) {
      // Remove from existing images
      setExistingPortfolioUrls(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      // Find and remove from new file uploads
      const newFileIndex = portfolioPreviewUrls.slice(existingPortfolioUrls.length).indexOf(urlToRemove);
      if (newFileIndex !== -1) {
        setFormData(prev => ({
          ...prev,
          portfolioImages: prev.portfolioImages.filter((_, i) => i !== newFileIndex)
        }));
      }
    }
    
    // Remove from preview URLs
    setPortfolioPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke URL if it's a blob URL
      if (urlToRemove?.startsWith('blob:')) {
        URL.revokeObjectURL(urlToRemove);
      }
      return newUrls;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = new Promise(async (resolve, reject) => {
      try {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('categoryId', category._id);
        data.append('location', formData.location);
        data.append('status', formData.status);
        data.append('technologies', JSON.stringify(formData.technologies));
        if (formData.file) {
          data.append('file', formData.file);
        }
        
        // Append portfolio images
        formData.portfolioImages.forEach((file) => {
          data.append('portfolioImages', file);
        });
        
        // Send existing portfolio images to preserve them when editing
        if (editingProject && existingPortfolioUrls.length > 0) {
          data.append('existingPortfolioImages', JSON.stringify(existingPortfolioUrls));
        }

        const url = editingProject
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${editingProject._id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/projects`;

        const response = await fetch(url, {
          method: editingProject ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        });

        if (!response.ok) throw new Error('Failed to save project');
        await fetchProjects();
        resetForm();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: editingProject ? 'Updating project...' : 'Creating project...',
      success: editingProject ? 'Project updated!' : 'Project created!',
      error: 'Failed to save project',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to delete project');
        await fetchProjects();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Deleting project...',
      success: 'Project deleted!',
      error: 'Failed to delete project',
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      technologies: [],
      status: 'ongoing',
      file: null,
      portfolioImages: [],
    });
    setPreviewUrl(null);
    setPortfolioPreviewUrls([]);
    setExistingPortfolioUrls([]);
    setEditingProject(null);
    setIsFormOpen(false);
    setTechInput('');
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      location: project.location || '',
      technologies: project.technologies,
      status: project.status,
      file: null,
      portfolioImages: [],
    });
    setPreviewUrl(project.image);
    const existingImages = project.portfolioImages || [];
    setExistingPortfolioUrls(existingImages);
    setPortfolioPreviewUrls(existingImages);
    setIsFormOpen(true);
  };

  const addTechnology = () => {
    if (techInput.trim()) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput('');
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
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
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Categories
          </button>
        </div>
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">
            {category.name} Projects
          </h2>
          <button
            onClick={() => setIsFormOpen(true)}
            className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90"
          >
            Add New Project
          </button>
        </div>
      </div>

      {/* Project Form Modal */}
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
            <div className="dark:bg-boxdark max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
              <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputGroup
                  label="Title"
                  type="text"
                  placeholder="Enter project title"
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
                  placeholder="Enter project description"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />

                <InputGroup
                  label="Location"
                  type="text"
                  placeholder="Enter project location"
                  value={formData.location}
                  handleChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />

                <div className="space-y-2">
                  <label className="mb-3 block text-black dark:text-white">
                    Technologies
                  </label>
                  <div className="flex gap-2">
                    <InputGroup
                      label=""
                      type="text"
                      placeholder="Add technology"
                      value={techInput}
                      handleChange={(e) => setTechInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addTechnology}
                      className="rounded-lg bg-primary px-4 py-2 text-white"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-700"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              technologies: prev.technologies.filter(
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

                <div className="space-y-2">
                  <label className="mb-3 block text-black dark:text-white">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as "ongoing" | "completed",
                      }))
                    }
                    className="dark:border-strokedark w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <InputGroup
                  placeholder=""
                  label="Project Image"
                  type="file"
                  accept="image/*"
                  required={!editingProject}
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

                <div className="space-y-4">
                  <label className="mb-3 block text-black dark:text-white">
                    Portfolio Images (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePortfolioImagesChange}
                    className="dark:border-strokedark w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary"
                  />

                  {portfolioPreviewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {portfolioPreviewUrls.map((url, index) => (
                        <div key={index} className="relative aspect-video">
                          <Image
                            src={url}
                            alt={`Portfolio ${index + 1}`}
                            fill
                            className="rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePortfolioImage(index)}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                    {editingProject ? "Update" : "Create"} Project
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Projects List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="dark:border-strokedark group relative overflow-hidden rounded-lg border border-stroke"
            >
              <div className="relative aspect-video">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-black dark:text-white">
                  {project.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-gray-600 dark:text-gray-400">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      project.status === "completed"
                        ? "bg-blue-400 text-white bg-opacity-10"
                        : "bg-yellow-400 text-white bg-opacity-10"
                    }`}
                  >
                    {project.status}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
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

      {projects.length === 0 && !loading && (
        <div className="flex h-32 items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            No projects found in this category. Create your first project!
          </p>
        </div>
      )}
    </>
  );
};
