"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { Enquiry, EnquiryFilters } from "@/types/enquiry";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { Search, Eye, Trash2, Calendar, Video, ExternalLink, Clock, MapPin, User, Mail, Phone, MessageSquare, Building } from "lucide-react";

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

export default function EnquiryPage() {
  const { token } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<EnquiryFilters>({
    reviewed: "",
    hasDemo: "",
  });
  const [selectedContact, setSelectedContact] = useState<Enquiry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchEnquiries = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/api/enquiries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch Enquiries");
        }

        const data = await response.json();
        setEnquiries(data.enquiries || data || []);
      } catch (error: any) {
        const message = error.message || "Error fetching Enquiries";
        setError(message);
        toast.error(message);
        setEnquiries([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEnquiries();
    }
  }, [apiUrl, token]);

  // Filter Enquiries based on search and filters
  const filteredEnquiries = Array.isArray(enquiries)
    ? enquiries.filter((enquiry) => {
        const matchesSearch =
          enquiry?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
          enquiry?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
          enquiry?.projectName?.toLowerCase()?.includes(searchTerm.toLowerCase());

        const matchesReviewed =
          filters.reviewed === "" ||
          enquiry?.reviewed?.toString() === filters.reviewed;

        const matchesDemo =
          filters.hasDemo === "" ||
          (filters.hasDemo === "true" && (enquiry?.demoDate || enquiry?.googleMeetLink)) ||
          (filters.hasDemo === "false" && !enquiry?.demoDate && !enquiry?.googleMeetLink);

        return matchesSearch && matchesReviewed && matchesDemo;
      })
    : [];

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDemoDateTime = (date: string, time: string) => {
    if (!date || !time) return "Not scheduled";
    
    try {
      let formattedDate;
      let formattedTime;
      
      if (date.includes('T')) {
        // If date is in ISO format, extract the date part
        const dateObj = new Date(date);
        formattedDate = dateObj.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",  
          day: "numeric",
          year: "numeric",
        });
      } else {
        // If date is in YYYY-MM-DD format
        const [year, month, day] = date.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        formattedDate = dateObj.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric", 
          year: "numeric",
        });
      }
      
      // Format time (time should be in HH:MM format)
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':');
        const timeObj = new Date();
        timeObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        formattedTime = timeObj.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit", 
          hour12: true,
        });
      } else {
        formattedTime = time;
      }

      return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
      console.error("Error formatting demo date time:", error, "Date:", date, "Time:", time);
      return "Invalid date/time format";
    }
  };

  const handleReadToggle = async (
    contactId: string,
    currentReviewedStatus: boolean,
  ) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      setEnquiries((prev) =>
        Array.isArray(prev)
          ? prev.map((contact) =>
              contact?._id === contactId
                ? { ...contact, reviewed: !currentReviewedStatus }
                : contact,
            )
          : [],
      );

      const response = await fetch(`${apiUrl}/api/enquiries/${contactId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewed: !currentReviewedStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update contact status");
      }

      toast.dismiss(loadingToast);
      toast.success("Status updated successfully");
    } catch (error: any) {
      console.error("Error updating contact:", error);
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to update status");

      setEnquiries((prev) =>
        Array.isArray(prev)
          ? prev.map((contact) =>
              contact?._id === contactId
                ? { ...contact, reviewed: currentReviewedStatus }
                : contact,
            )
          : [],
      );
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm("Are you sure you want to delete this contact? This will also delete any associated Google Meet events."))
      return;

    const loadingToast = toast.loading("Deleting contact...");
    try {
      const response = await fetch(`${apiUrl}/api/enquiries/${contactId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      setEnquiries((prev) =>
        Array.isArray(prev)
          ? prev.filter((contact) => contact?._id !== contactId)
          : [],
      );

      toast.dismiss(loadingToast);
      toast.success("Contact and Google Meet event deleted successfully");
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to delete contact");
    }
  };

  const viewContactDetails = (enquiry: Enquiry) => {
    setSelectedContact(enquiry);
    setShowDetails(true);
  };

  // Calculate stats
  const totalEnquiries = enquiries.length;
  const readEnquiries = enquiries.filter((e) => e.reviewed).length;
  const unreadEnquiries = enquiries.filter((e) => !e.reviewed).length;
  const demoScheduled = enquiries.filter((e) => e.demoDate || e.googleMeetLink).length;
  const confirmedDemos = enquiries.filter((e) => e.googleMeetLink).length;

  return (
    <>
      <Breadcrumb pageName="Enquiry Management" />

      <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default">
        <div className="p-4 md:p-6 xl:p-9">
          {/* Filters and Search */}
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="flex-1">
              <div className="relative z-20">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="fill-body dark:fill-bodydark " />
                </span>
                <input
                  type="text"
                  placeholder="Search by name, email, or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dark:border-strokedark w-full rounded border border-stroke bg-transparent py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={filters.reviewed}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, reviewed: e.target.value }))
                }
                className="dark:border-strokedark dark:bg-boxdark relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-4.5 py-3 outline-none transition focus:border-primary active:border-primary"
              >
                <option value="">All Status</option>
                <option value="true">Read</option>
                <option value="false">Unread</option>
              </select>

              <select
                value={filters.hasDemo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, hasDemo: e.target.value }))
                }
                className="dark:border-strokedark dark:bg-boxdark relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-4.5 py-3 outline-none transition focus:border-primary active:border-primary"
              >
                <option value="">All Types</option>
                <option value="true">With Demo</option>
                <option value="false">General Enquiry</option>
              </select>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-sm font-bold text-black dark:text-white">
                    {totalEnquiries}
                  </h4>
                  <span className="text-sm font-medium">Total Enquiries</span>
                </div>
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                  <Mail className=" dark:fill-white h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-sm text-meta-3 font-bold">
                    {demoScheduled}
                  </h4>
                  <span className="text-sm font-medium">Demos Scheduled</span>
                </div>
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                  <Calendar className=" dark:fill-white h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-sm text-success font-bold">
                    {confirmedDemos}
                  </h4>
                  <span className="text-sm font-medium">Meet Links Created</span>
                </div>
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                  <Video className=" dark:fill-white h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-sm text-meta-3 font-bold">
                    {readEnquiries}
                  </h4>
                  <span className="text-sm font-medium">Read Messages</span>
                </div>
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                  <Eye className=" dark:fill-white h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-sm text-meta-1 font-bold">
                    {unreadEnquiries}
                  </h4>
                  <span className="text-sm font-medium">Unread Messages</span>
                </div>
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                  <MessageSquare className=" dark:fill-white h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Enquiries Table */}
          <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default sm:px-7.5 xl:pb-1">
            <div className="max-h-[calc(100vh-370px)] overflow-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="dark:bg-meta-4 bg-gray-2 text-left">
                    <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      Contact
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Project
                    </th>
                    <th className="min-w-[180px] px-4 py-4 font-medium text-black dark:text-white">
                      Demo Info
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Location
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Created
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Read
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5 xl:pl-11">
                        <div className="flex flex-col gap-1">
                          <h5 className="font-medium text-black dark:text-white">
                            {enquiry.name}
                            {!enquiry.reviewed && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                New
                              </span>
                            )}
                          </h5>
                          <p className="text-body-color dark:text-bodydark text-sm">
                            {enquiry.email}
                          </p>
                          {enquiry.phone && (
                            <p className="text-body-color dark:text-bodydark text-xs">
                              {enquiry.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5">
                        <p className="text-black dark:text-white font-medium">
                          {enquiry.projectName || "General"}
                        </p>
                      </td>
                      <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5">
                        {enquiry.demoDate && enquiry.demoTime ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3 text-primary" />
                              <span className="text-black dark:text-white">
                                {formatDemoDateTime(enquiry.demoDate, enquiry.demoTime)}
                              </span>
                            </div>
                            {enquiry.googleMeetLink && (
                              <div className="flex items-center gap-1">
                                <Video className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  Meet Link Available
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            No demo scheduled
                          </span>
                        )}
                      </td>
                      <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-black dark:text-white">
                            {enquiry.location || "Unknown"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {enquiry.ip || "No IP"}
                        </p>
                      </td>
                      <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5">
                        <p className="text-sm text-black dark:text-white">
                          {formatDate(enquiry.createdAt)}
                        </p>
                      </td>
                      <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5">
                        <div className="flex items-center">
                          <Switch
                            checked={enquiry.reviewed}
                            onCheckedChange={() =>
                              handleReadToggle(enquiry._id, enquiry.reviewed)
                            }
                            disabled={loading}
                          />
                        </div>
                      </td>
                      <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5">
                        <div className="flex items-center space-x-3.5">
                          <button
                            onClick={() => viewContactDetails(enquiry)}
                            className="hover:text-primary"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {enquiry.googleMeetLink && (
                            <a
                              href={enquiry.googleMeetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-green-600"
                              title="Join Google Meet"
                            >
                              <Video className="h-4 w-4" />
                            </a>
                          )}
                          {/* {enquiry.googleEventLink && (
                            <a
                              href={enquiry.googleEventLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600"
                              title="View Calendar Event"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )} */}
                          <button
                            onClick={() => handleDeleteContact(enquiry._id)}
                            className="hover:text-meta-1"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEnquiries.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No enquiries found matching your criteria.
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Contact Details Modal */}
          {showDetails &&
            selectedContact &&
            isMounted &&
            createPortal(
              <div
                className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50"
                style={{ zIndex: 9999 }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowDetails(false);
                  }
                }}
              >
                <div className="dark:border-strokedark dark:bg-boxdark w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm border border-stroke bg-white p-4 shadow-2xl sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-title-md font-bold text-black dark:text-white">
                      Enquiry Details
                    </h3>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-body-color hover:text-meta-1 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-black dark:text-white flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Name
                          </label>
                          <p className="text-body-color dark:text-bodydark">
                            {selectedContact.name}
                          </p>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-black dark:text-white flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </label>
                          <p className="text-body-color dark:text-bodydark">
                            {selectedContact.email}
                          </p>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-black dark:text-white flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone
                          </label>
                          <p className="text-body-color dark:text-bodydark">
                            {selectedContact.phone || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-black dark:text-white flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Project Name
                          </label>
                          <p className="text-body-color dark:text-bodydark">
                            {selectedContact.projectName || "General"}
                          </p>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-black dark:text-white flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                          </label>
                          <p className="text-body-color dark:text-bodydark">
                            {selectedContact.location || "Unknown"}
                          </p>
                          {selectedContact.ip && (
                            <p className="text-xs text-gray-500">
                              IP: {selectedContact.ip}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Demo Information */}
                    {(selectedContact.demoDate || selectedContact.googleMeetLink) && (
                      <div className="border-t pt-4">
                        <h4 className="text-lg font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Demo Information
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedContact.demoDate && selectedContact.demoTime && (
                            <div>
                              <label className="mb-2 block text-sm font-medium text-black dark:text-white flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Scheduled Date & Time
                              </label>
                              <p className="text-body-color dark:text-bodydark">
                                {formatDemoDateTime(selectedContact.demoDate, selectedContact.demoTime)}
                              </p>
                            </div>
                          )}

                          {selectedContact.googleMeetLink && (
                            <div>
                              <label className="mb-2 block text-sm font-medium text-black dark:text-white flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                Google Meet
                              </label>
                              <a
                                href={selectedContact.googleMeetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 underline break-all"
                              >
                                Join Meeting
                              </a>
                            </div>
                          )}

                          {selectedContact.googleEventLink && (
                            <div>
                              <label className="mb-2 block text-sm font-medium text-black dark:text-white flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Calendar Event
                              </label>
                              <a
                                href={selectedContact.googleEventLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 underline"
                              >
                                View in Google Calendar
                              </a>
                            </div>
                          )}

                          {selectedContact.googleEventId && (
                            <div>
                              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Event ID
                              </label>
                              <p className="text-body-color dark:text-bodydark text-xs font-mono">
                                {selectedContact.googleEventId}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-black dark:text-white flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                        <p className="text-body-color dark:text-bodydark whitespace-pre-wrap">
                          {selectedContact.message || "No message provided"}
                        </p>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Created At
                        </label>
                        <p className="text-body-color dark:text-bodydark">
                          {formatDate(selectedContact.createdAt)}
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Read Status
                        </label>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={selectedContact.reviewed}
                            onCheckedChange={() => {
                              handleReadToggle(
                                selectedContact._id,
                                selectedContact.reviewed,
                              );
                              setSelectedContact((prev) => {
                                if (!prev) return null;
                                return { ...prev, reviewed: !prev.reviewed };
                              });
                            }}
                            disabled={loading}
                          />
                          <span className="text-body-color dark:text-bodydark text-sm">
                            {selectedContact.reviewed ? "Read" : "Unread"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-4">
                    <button
                      onClick={() => setShowDetails(false)}
                      className="dark:border-strokedark flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:text-white"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteContact(selectedContact._id);
                        setShowDetails(false);
                      }}
                      className="bg-meta-1 flex justify-center rounded px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </div>
      </div>
    </>
  );
}
