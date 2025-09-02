"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CustomerReview {
  _id: string;
  company: string;
  title: string;
  category: string;
  image: string;
}

interface CustomerReviewListProps {
  onEdit: (customerReview: CustomerReview) => void;
}

export function CustomerReviewList({ onEdit }: CustomerReviewListProps) {
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCustomerReviews = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers`
      );
      if (!response.ok) throw new Error("Failed to fetch customer reviews");
      const data = await response.json();
      setCustomerReviews(data.customers);
      setError(null);
    } catch (error) {
      console.error("Error fetching customer reviews:", error);
      setError("Failed to fetch customer reviews. Please try again.")
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete customer review");

      toast.success("Customer review deleted successfully");
      await fetchCustomerReviews(); // Refresh the list
    } catch (error) {
      console.error("Error deleting customer review:", error);
      toast.error("Failed to delete customer review. Please try again.")
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default">
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="dark:bg-meta-4 bg-gray-2">
              <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                Image
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Company
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                Title
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                Category
              </th>
              <th className="px-4 py-4 font-medium text-dark dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {customerReviews.map((customerReview) => (
              <tr key={customerReview._id}>
                <td className="dark:border-strokedark flex items-center justify-center border-b border-[#eee] px-4 py-5">
                  {customerReview.image && (
                    <Image
                      src={customerReview.image}
                      alt={customerReview.company}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover"
                    />
                  )}
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5 text-center">
                  {customerReview.company}
                </td>
                <td className="dark:border-strokedark py-5 text-center border-b border-[#eee] px-4">
                  {customerReview.title}
                </td>
                <td className="dark:border-strokedark py-5 text-center border-b border-[#eee] px-4">
                  {customerReview.category}
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(customerReview)}
                      className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customerReview._id)}
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
    </div>
  );
}
