"use client";
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { Trash2, Send, Mail } from 'lucide-react';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
}

interface SubscriberFilters {
  search: string;
}

export default function SubscribersPage() {
  const { token } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({
    subject: '',
    message: ''
  });
  const [sendingNotification, setSendingNotification] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchSubscribers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/api/subscriber`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch subscribers");
        }

        const data = await response.json();
        setSubscribers(Array.isArray(data) ? data : []);
      } catch (error: any) {
        const message = error.message || "Error fetching subscribers";
        setError(message);
        toast.error(message);
        setSubscribers([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSubscribers();
    }
  }, [apiUrl, token]);

  // Filter subscribers based on search
  const filteredSubscribers = Array.isArray(subscribers)
    ? subscribers.filter((subscriber) =>
        subscriber?.email?.toLowerCase()?.includes(searchTerm.toLowerCase())
      )
    : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!window.confirm("Are you sure you want to delete this subscriber?"))
      return;

    const loadingToast = toast.loading("Deleting subscriber...");
    try {
      const response = await fetch(`${apiUrl}/api/subscriber/${subscriberId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete subscriber");
      }

      // Remove from local state only after successful API call
      setSubscribers((prev) =>
        Array.isArray(prev)
          ? prev.filter((subscriber) => subscriber?._id !== subscriberId)
          : []
      );

      toast.dismiss(loadingToast);
      toast.success("Subscriber deleted successfully");
    } catch (error: any) {
      console.error("Error deleting subscriber:", error);
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to delete subscriber");
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notificationData.subject.trim() || !notificationData.message.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }

    if (subscribers.length === 0) {
      toast.error("No subscribers to send notification to");
      return;
    }

    setSendingNotification(true);
    const loadingToast = toast.loading(`Sending notification to ${subscribers.length} subscribers...`);

    try {
      const response = await fetch(`${apiUrl}/api/subscriber/send-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: notificationData.subject.trim(),
          message: notificationData.message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send notification");
      }

      toast.dismiss(loadingToast);
      toast.success(`Notification sent successfully to ${subscribers.length} subscribers!`);
      
      // Reset form and close modal
      setNotificationData({ subject: '', message: '' });
      setShowNotificationModal(false);
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to send notification");
    } finally {
      setSendingNotification(false);
    }
  };

  const resetNotificationForm = () => {
    setNotificationData({ subject: '', message: '' });
    setShowNotificationModal(false);
  };

  return (
    <>
      <Breadcrumb pageName="Subscriber Management" />
      
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-4 md:p-6 xl:p-9">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Subscribers
            </h2>
            <button
              onClick={() => setShowNotificationModal(true)}
              disabled={subscribers.length === 0}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Send Notification
            </button>
          </div>

          {/* Search */}
          <div className="mb-4.5">
            <div className="relative z-20">
              <input
                type="text"
                placeholder="Search subscribers by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded border border-stroke bg-transparent py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-primary"
              />
              <span className="absolute left-4 top-4">
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Subscriber Stats */}
          {/* <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg
                  className="fill-primary dark:fill-white"
                  width="22"
                  height="16"
                  viewBox="0 0 22 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 0C7.13401 0 4 3.13401 4 7C4 10.866 7.13401 14 11 14C14.866 14 18 10.866 18 7C18 3.13401 14.866 0 11 0Z"
                    fill=""
                  />
                </svg>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {subscribers.length}
                  </h4>
                  <span className="text-sm font-medium">Total Subscribers</span>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg
                  className="fill-primary dark:fill-white"
                  width="20"
                  height="22"
                  viewBox="0 0 20 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.1281 16.4312 11.7531 16.4312Z"
                    fill=""
                  />
                </svg>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {filteredSubscribers.length}
                  </h4>
                  <span className="text-sm font-medium">Filtered Results</span>
                </div>
              </div>
            </div>
          </div> */}

          {/* Subscribers Table */}
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-h-[calc(100vh-370px)] overflow-auto">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : (
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                        Email
                      </th>
                      <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                        Subscribed Date
                      </th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber._id} className="border-b border-[#eee] dark:border-strokedark">
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <h5 className="font-medium text-black dark:text-white">
                            {subscriber.email}
                          </h5>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {formatDate(subscriber.subscribedAt)}
                          </p>
                        </td>
                        <td  className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          
                            <button
                              onClick={() => handleDeleteSubscriber(subscriber._id)}
                              className="hover:text-red-500"
                              title="Delete subscriber"
                            >
                              <Trash2 className='h-5 w-5'/>
                            </button>
                          
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {filteredSubscribers.length === 0 && !loading && (
              <div className="flex h-32 items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? "No subscribers found matching your search." : "No subscribers found."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && isMounted && createPortal(
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4" 
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetNotificationForm();
            }
          }}
        >
          <div className="dark:bg-boxdark max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Notification to Subscribers
              </h3>
              <button
                onClick={resetNotificationForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This notification will be sent to all <strong>{subscribers.length}</strong> subscribers.
              </p>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <InputGroup
                label="Subject"
                type="text"
                placeholder="Enter email subject"
                required
                value={notificationData.subject}
                handleChange={(e) =>
                  setNotificationData((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
              />

              <TextAreaGroup
                label="Message"
                placeholder="Enter your message to subscribers..."
                required
                value={notificationData.message}
                onChange={(e) =>
                  setNotificationData((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetNotificationForm}
                  disabled={sendingNotification}
                  className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingNotification || !notificationData.subject.trim() || !notificationData.message.trim()}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingNotification ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send to {subscribers.length} Subscribers
                    </>
                  )}
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
