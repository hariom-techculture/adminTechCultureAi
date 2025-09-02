"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { JobApplication, APPLICATION_STATUS } from '@/types/jobApplication';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';


export default function JobApplicationPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [filters, setFilters] = useState({
    jobId: '',
    status: '',
  });
  const [notes, setNotes] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchApplications = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.jobId) queryParams.append('jobId', filters.jobId);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/job-applications/filters?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data.jobApplications);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const updateApplicationStatus = async (id: string, status: typeof APPLICATION_STATUS[number]) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/job-applications/${id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status, notes }),
          }
        );
        if (!response.ok) throw new Error('Failed to update status');
        await fetchApplications();
        setSelectedApplication(null);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Updating application status...',
      success: 'Status updated successfully!',
      error: 'Failed to update status',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/job-applications/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to delete application');
        await fetchApplications();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Deleting application...',
      success: 'Application deleted successfully!',
      error: 'Failed to delete application',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Applied: 'bg-primary/10 text-primary',
      Reviewed: 'bg-info/10 text-info',
      Interviewed: 'bg-warning/10 text-warning',
      Offered: 'bg-success/10 text-success',
      Rejected: 'bg-danger/10 text-danger',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <>
      <Breadcrumb pageName="Job Applications" />

      <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default">
        <div className="p-4 md:p-6 xl:p-9">
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-black dark:text-white">
                Job Applications
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-2 ${viewMode === "grid" ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-2 ${viewMode === "list" ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputGroup
                label=""
                type="text"
                placeholder="Filter by Job ID"
                value={filters.jobId}
                handleChange={(e) =>
                  setFilters((prev) => ({ ...prev, jobId: e.target.value }))
                }
              />
              <select
                className="dark:border-strokedark rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="">All Status</option>
                {APPLICATION_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className="dark:border-strokedark dark:bg-boxdark flex h-full flex-col justify-between rounded-lg border border-stroke bg-white p-4"
                >
                  {/* Main Card Content */}
                  <div className="flex-1">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                          {application.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {application.email}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${getStatusColor(application.status)}`}
                      >
                        {application.status}
                      </span>
                    </div>
                    <div className="mb-4 space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Job ID: {application.jobId}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Phone: {application.phone}
                      </p>
                      {application.portfolioUrl && (
                        <a
                          href={application.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                  {/* Button Section - Always at the bottom */}
                  <div className="mb-4 flex items-center gap-2">
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-md border border-green-500 px-4 py-2 text-sm font-medium text-green-500 hover:bg-green-500 hover:text-white"
                    >
                      View Resume
                    </a>
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => handleDelete(application._id)}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Applied:{" "}
                    {new Date(application.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Job ID</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Applied Date</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application._id}
                      className="border-b dark:border-gray-700"
                    >
                      <td className="px-4 py-2">
                        <div>
                          <div className="font-semibold">
                            {application.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {application.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">{application.jobId}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${getStatusColor(application.status)}`}
                        >
                          {application.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{application.createdAt}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md border border-green-500 px-4 py-2 text-sm font-medium text-green-500 hover:bg-green-500 hover:text-white"
                          >
                            Resume
                          </a>
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(application._id)}
                            className="inline-flex items-center justify-center rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedApplication && isMounted && createPortal(
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4" 
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedApplication(null);
              setNotes("");
            }
          }}
        >
          <div className="dark:bg-boxdark w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Update Application Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Status
                </label>
                <select
                  value={selectedApplication.status}
                  onChange={(e) =>
                    updateApplicationStatus(
                      selectedApplication._id,
                      e.target.value as (typeof APPLICATION_STATUS)[number],
                    )
                  }
                  className="dark:border-strokedark w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary"
                >
                  {APPLICATION_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedApplication(null);
                    setNotes("");
                  }}
                  className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}