"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { JobPost, JOB_TYPES } from '@/types/job';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = ({
  checked,
  onCheckedChange,
  disabled = false,
}: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-primary" : "dark:bg-strokedark bg-stroke"
      } `}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0.5"
        } `}
      />
    </button>
  );
};


export default function JobPostPage() {
  const { token } = useAuth();
  console.log("token in the post form ", token)
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    location: '',
    type: '',
    isActive: 'all',
  });
  const [skillInput, setSkillInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [formData, setFormData] = useState<{
    jobId: string;
    title: string;
    description: string;
    department: string;
    location: string;
    type: typeof JOB_TYPES[number];
    salaryRange: { min: number; max: number };
    experienceRequired: string;
    skills: string[];
    isActive: boolean;
    deadline: string;
  }>({
    jobId: '',
    title: '',
    description: '',
    department: '',
    location: '',
    type: 'Full-time',
    salaryRange: {
      min: 0,
      max: 0,
    },
    experienceRequired: '',
    skills: [],
    isActive: true,
    deadline: '',
  });

  const fetchJobPosts = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.isActive !== 'all') queryParams.append('isActive', String(filters.isActive === 'active'));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/job-posts/filter?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch job posts');
      const data = await response.json();
      setJobPosts(data);
    } catch (error) {
      toast.error('Failed to load job posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobPosts();
  }, [filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobId || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        const url = editingJob
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/job-posts/${editingJob.jobId}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/job-posts`;

        const response = await fetch(url, {
          method: editingJob ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to save job post');
        await fetchJobPosts();
        resetForm();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: editingJob ? 'Updating job post...' : 'Creating job post...',
      success: editingJob ? 'Job post updated!' : 'Job post created!',
      error: 'Failed to save job post',
    });
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job post?')) return;

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/job-posts/${jobId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to delete job post');
        await fetchJobPosts();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Deleting job post...',
      success: 'Job post deleted!',
      error: 'Failed to delete job post',
    });
  };

  const resetForm = () => {
    setFormData({
      jobId: '',
      title: '',
      description: '',
      department: '',
      location: '',
      type: 'Full-time',
      salaryRange: {
        min: 0,
        max: 0,
      },
      experienceRequired: '',
      skills: [],
      isActive: true,
      deadline: '',
    });
    setEditingJob(null);
    setIsFormOpen(false);
    setSkillInput('');
  };

  const handleEdit = (job: JobPost) => {
    setEditingJob(job);
    setFormData({
      jobId: job.jobId,
      title: job.title,
      description: job.description,
      department: job.department || '',
      location: job.location || '',
      type: job.type,
      salaryRange: job.salaryRange || { min: 0, max: 0 },
      experienceRequired: job.experienceRequired || '',
      skills: job.skills,
      isActive: job.isActive,
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
    });
    setIsFormOpen(true);
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  return (
    <>
      <Breadcrumb pageName="Job Posts" />

      <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default">
        <div className="p-4 md:p-6 xl:p-9">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Job Posts Management
            </h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90"
            >
              Post New Job
            </button>
          </div>

          {/* Filters Section */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <InputGroup
              label=""
              type="text"
              placeholder="Filter by department"
              value={filters.department}
              handleChange={(e) =>
                setFilters((prev) => ({ ...prev, department: e.target.value }))
              }
            />
            <InputGroup
              label=""
              type="text"
              placeholder="Filter by location"
              value={filters.location}
              handleChange={(e) =>
                setFilters((prev) => ({ ...prev, location: e.target.value }))
              }
            />
            <select
              className="dark:border-strokedark rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary"
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              <option value="">All Types</option>
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="dark:border-strokedark rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary"
              value={filters.isActive}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, isActive: e.target.value }))
              }
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Job Posts List */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobPosts.map((job) => (
                <div
                  key={job._id}
                  className="dark:border-strokedark dark:bg-boxdark flex h-full flex-col justify-between rounded-lg border border-stroke bg-white p-4"
                >
                  {/* Main Card Content */}
                  <div className="flex-1">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        {job.title}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          job.isActive
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {job.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mb-4 space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {job.department} • {job.location}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {job.type} • {job.experienceRequired}
                      </p>
                      {job.salaryRange && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{job.salaryRange.min.toLocaleString()} - ₹
                          {job.salaryRange.max.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                        {job.description}
                      </p>
                    </div>
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Bottom Section - always at the bottom */}
                  <div className="dark:border-strokedark mt-4 flex items-center justify-between border-t border-stroke pt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Posted:{" "}
                      {new Date(job.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {job.deadline && (
                        <div>
                          Deadline:{" "}
                          {new Date(job.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(job)}
                        className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.jobId)}
                        className="inline-flex items-center justify-center rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job Post Form Modal */}
      {isFormOpen && isMounted && createPortal(
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4" 
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetForm();
            }
          }}
        >
          <div className="dark:bg-boxdark max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              {editingJob ? "Edit Job Post" : "Create New Job Post"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputGroup
                label="Job ID"
                type="text"
                placeholder="Enter unique job ID"
                required
                disabled={!!editingJob}
                value={formData.jobId}
                handleChange={(e) =>
                  setFormData((prev) => ({ ...prev, jobId: e.target.value }))
                }
              />

              <InputGroup
                label="Title"
                type="text"
                placeholder="Enter job title"
                required
                value={formData.title}
                handleChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />

              <TextAreaGroup
                label="Description"
                placeholder="Enter job description"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputGroup
                  label="Department"
                  type="text"
                  placeholder="Enter department"
                  value={formData.department}
                  handleChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                />

                <InputGroup
                  label="Location"
                  type="text"
                  placeholder="Enter location"
                  value={formData.location}
                  handleChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Job Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as (typeof JOB_TYPES)[number],
                      }))
                    }
                    className="dark:border-strokedark w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary"
                  >
                    {JOB_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <InputGroup
                  label="Experience Required"
                  type="text"
                  placeholder="e.g., 2+ years"
                  value={formData.experienceRequired}
                  handleChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experienceRequired: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputGroup
                  label="Minimum Salary"
                  type="number"
                  placeholder="Enter minimum salary"
                  value={formData.salaryRange.min.toString()}
                  handleChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salaryRange: {
                        ...prev.salaryRange,
                        min: Number(e.target.value),
                      },
                    }))
                  }
                />

                <InputGroup
                  label="Maximum Salary"
                  type="number"
                  placeholder="Enter maximum salary"
                  value={formData.salaryRange.max.toString()}
                  handleChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salaryRange: {
                        ...prev.salaryRange,
                        max: Number(e.target.value),
                      },
                    }))
                  }
                />
              </div>

              <InputGroup
                placeholder=""
                label="Application Deadline"
                type="date"
                value={formData.deadline}
                handleChange={(e) =>
                  setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                }
              />

              <div className="space-y-2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Skills Required
                </label>
                <div className="flex gap-2">
                  <InputGroup
                    label=""
                    type="text"
                    placeholder="Add skill"
                    value={skillInput}
                    handleChange={(e) => setSkillInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="rounded-lg bg-primary px-4 py-2 text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-700"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            skills: prev.skills.filter((_, i) => i !== index),
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

              <div className="mb-4 flex items-center gap-2">
                <span className="dark:text-bodydark ml-2 block text-black">
                  {formData.isActive ? "Active" : "InActive"}
                </span>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: checked,
                    }))
                  }
                  disabled={loading}
                />
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
                  {editingJob ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}