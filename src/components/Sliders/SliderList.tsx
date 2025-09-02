"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Slider {
  _id: string;
  title: string;
  subTitle: string;
  description: string;
  category: string;
  image: string;
}

interface SliderListProps {
  onEdit: (slider: Slider) => void;
}

export function SliderList({ onEdit }: SliderListProps) {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSliders = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sliders`
      );
      if (!response.ok) throw new Error("Failed to fetch sliders");
      const data = await response.json();
      setSliders(data.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      setError("Failed to fetch sliders. Please try again.")
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this slider?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete slider");

      toast.success("Slider deleted successfully");
      await fetchSliders(); // Refresh the list
    } catch (error) {
      console.error("Error deleting slider:", error);
      toast.error("Failed to delete slider. Please try again.")
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
                Title
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                Sub Title
              </th>
              <th className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                Description
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
            {sliders.map((slider) => (
              <tr key={slider._id}>
                <td className="dark:border-strokedark flex items-center justify-center border-b border-[#eee] px-4 py-5">
                  {slider.image && (
                    <Image
                      src={slider.image}
                      alt={slider.title}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover"
                    />
                  )}
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5 text-center">
                  {slider.title}
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5 text-center">
                  {slider.subTitle}
                </td>
                <td className="dark:border-strokedark max-w-md truncate border-b border-[#eee] px-4 py-5 text-center">
                  {slider.description}
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5 text-center">
                  {slider.category}
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(slider)}
                      className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slider._id)}
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
