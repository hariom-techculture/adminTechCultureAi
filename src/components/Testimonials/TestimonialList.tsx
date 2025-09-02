"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Testimonial {
  _id: string;
  name: string;
  title: string;
  message: string;
  image: string;
}

interface TestimonialListProps {
  onEdit: (testimonial: Testimonial) => void;
}

export function TestimonialList({ onEdit }: TestimonialListProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`
      );
      if (!response.ok) throw new Error("Failed to fetch testimonials");
      const data = await response.json();
      setTestimonials(data.testimonials);
      setError(null);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setError("Failed to fetch testimonials. Please try again.")
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete testimonial");

      toast.success("Testimonial deleted successfully");
      await fetchTestimonials(); // Refresh the list
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial. Please try again.")
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
                Name
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                Title
              </th>
              <th className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                Message
              </th>
              <th className="px-4 py-4 font-medium text-dark dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((testimonial) => (
              <tr key={testimonial._id}>
                <td className="dark:border-strokedark flex items-center justify-center border-b border-[#eee] px-4 py-5">
                  {testimonial.image && (
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover"
                    />
                  )}
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5 text-center">
                  {testimonial.name}
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5 text-center">
                  {testimonial.title}
                </td>
                <td className="dark:border-strokedark max-w-md truncate border-b border-[#eee] px-4 py-5 text-center">
                  {testimonial.message}
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onEdit(testimonial)}
                      className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial._id)}
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
