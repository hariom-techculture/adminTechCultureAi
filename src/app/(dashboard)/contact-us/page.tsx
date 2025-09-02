"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { Contact, ContactFilters } from "@/types/contact";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { Search, Eye, Trash2 } from "lucide-react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = ({ checked, onCheckedChange, disabled = false }: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-stroke dark:bg-strokedark"
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

export default function ContactPage() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ContactFilters>({
    service: "",
    read: "",
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/api/contacts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch contacts");
        }

        const data = await response.json();
        // Fix: Handle the API response structure properly
        setContacts(data.contacts || data || []);
      } catch (error: any) {
        const message = error.message || "Error fetching contacts";
        setError(message);
        toast.error(message);
        setContacts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchContacts();
    }
  }, [apiUrl, token]);

  // Filter contacts based on search and filters
 const filteredContacts = Array.isArray(contacts)
   ? contacts.filter((contact) => {
       const matchesSearch =
         contact?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
         contact?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
         contact?.company?.toLowerCase()?.includes(searchTerm.toLowerCase());

       const matchesService =
         filters.service === "" || contact?.service === filters.service;
       const matchesRead =
         filters.read === "" || contact?.read?.toString() === filters.read;

       return matchesSearch && matchesService && matchesRead;
     })
   : [];

  // Get unique services for filter
 const uniqueServices = Array.from(
   new Set(
     Array.isArray(contacts)
       ? contacts.map((contact) => contact?.service).filter(Boolean)
       : [],
   ),
 );
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReadToggle = async (
    contactId: string,
    currentReadStatus: boolean,
  ) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      // Update local state immediately for better UX
      setContacts((prev) =>
        Array.isArray(prev)
          ? prev.map((contact) =>
              contact?._id === contactId
                ? { ...contact, read: !currentReadStatus }
                : contact,
            )
          : [],
      );

      // Make the API call
      const response = await fetch(`${apiUrl}/api/contacts/${contactId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ read: !currentReadStatus }),
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

      // Revert the change if API call fails
      setContacts((prev) =>
        Array.isArray(prev)
          ? prev.map((contact) =>
              contact?._id === contactId
                ? { ...contact, read: currentReadStatus }
                : contact,
            )
          : [],
      );
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm("Are you sure you want to delete this contact?"))
      return;

    const loadingToast = toast.loading("Deleting contact...");
    try {
      const response = await fetch(`${apiUrl}/api/contacts/${contactId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      // Remove from local state only after successful API call
      setContacts((prev) =>
        Array.isArray(prev)
          ? prev.filter((contact) => contact?._id !== contactId)
          : [],
      );

      toast.dismiss(loadingToast);
      toast.success("Contact deleted successfully");
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to delete contact");
    }
  };
  const viewContactDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDetails(true);
  };

  return (
    <>
      <Breadcrumb pageName="Contact Management" />
      
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-4 md:p-6 xl:p-9">

      {/* Filters and Search */}
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="flex-1">
              <div className="relative z-20">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary" />
                </span>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded border border-stroke bg-transparent py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={filters.service}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, service: e.target.value }))
                }
                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-4.5 outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-boxdark"
              >
                <option value="">All Services</option>
                {uniqueServices.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>

              <select
                value={filters.read}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, read: e.target.value }))
                }
                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-4.5 outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-boxdark"
              >
                <option value="">All Status</option>
                <option value="true">Read</option>
                <option value="false">Unread</option>
              </select>
            </div>
          </div>

          {/* Contact Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-sm font-bold text-black dark:text-white">
                    {contacts.length}
                  </h4>
                  <span className="text-sm font-medium">Total Contacts</span>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-sm font-bold text-meta-3">
                    {contacts.filter((c) => c.read).length}
                  </h4>
                  <span className="text-sm font-medium">Read Messages</span>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-sm font-bold text-meta-1">
                    {contacts.filter((c) => !c.read).length}
                  </h4>
                  <span className="text-sm font-medium">Unread Messages</span>
                </div>
              </div>
            </div>
          </div>

      {/* Contacts Table */}
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-h-[calc(100vh-370px)] overflow-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Contact
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Service
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Date
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {filteredContacts.map((contact) => (
                <tr key={contact._id}>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark xl:pl-11">
                    <div className="flex flex-col gap-1">
                      <h5 className="font-medium text-black dark:text-white">
                        {contact.name}
                        {!contact.read && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            New
                          </span>
                        )}
                      </h5>
                      <p className="text-sm text-body-color dark:text-bodydark">{contact.email}</p>
                      <div className="text-sm text-body-color dark:text-bodydark sm:hidden">
                        {contact.company && contact.service ? `${contact.company} • ${contact.service}` : contact.company || contact.service || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {contact.service || '-'}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {formatDate(contact.createdAt)}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center">
                      <Switch
                        checked={contact.read}
                        onCheckedChange={() =>
                          handleReadToggle(contact._id, contact.read)
                        }
                        disabled={loading}
                      />
                      <span className="ml-2 text-sm font-medium text-black dark:text-white">
                        {contact.read ? "Read" : "Unread"}
                      </span>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      <button
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowDetails(true);
                        }}
                        className="hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact._id)}
                        className="hover:text-meta-1"
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

        {filteredContacts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No contacts found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {showDetails && selectedContact && isMounted && createPortal(
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50" 
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetails(false);
            }
          }}
        >
          <div className="w-full max-w-xl rounded-sm border border-stroke bg-white p-4 shadow-2xl dark:border-strokedark dark:bg-boxdark sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-title-md font-bold text-black dark:text-white">
                Contact Details
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-body-color hover:text-meta-1"
              >
                ×
              </button>
            </div>

            <div className="space-y-4.5">
              <div>
                <label className="mb-2.5 block text-black dark:text-white">Name</label>
                <p className="text-body-color dark:text-bodydark">
                  {selectedContact.name}
                </p>
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">Email</label>
                <p className="text-body-color dark:text-bodydark">
                  {selectedContact.email}
                </p>
              </div>

              {selectedContact.company && (
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">Company</label>
                  <p className="text-body-color dark:text-bodydark">
                    {selectedContact.company}
                  </p>
                </div>
              )}

              {selectedContact.service && (
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">Service</label>
                  <p className="text-body-color dark:text-bodydark">
                    {selectedContact.service}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2.5 block text-black dark:text-white">Message</label>
                <p className="whitespace-pre-wrap text-body-color dark:text-bodydark">
                  {selectedContact.message}
                </p>
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">Date</label>
                <p className="text-body-color dark:text-bodydark">
                  {formatDate(selectedContact.createdAt)}
                </p>
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">Status</label>
                <div className="flex items-center">
                  <Switch
                    checked={selectedContact.read}
                    onCheckedChange={() => {
                      handleReadToggle(selectedContact._id, selectedContact.read);
                      setSelectedContact((prev) => {
                        if (!prev) return null;
                        return { ...prev, read: !prev.read };
                      });
                    }}
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-body-color dark:text-bodydark">
                    {selectedContact.read ? "Read" : "Unread"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                onClick={() => setShowDetails(false)}
                className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteContact(selectedContact._id);
                  setShowDetails(false);
                }}
                className="flex justify-center rounded bg-meta-1 py-2 px-6 font-medium text-gray hover:bg-opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
        </div>
      </div>
    </>
  );
}
