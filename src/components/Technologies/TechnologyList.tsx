"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface TechnologyItem {
  _id: string;
  name: string;
}

interface Technology {
  _id: string;
  categoryKey: string;
  title: string;
  items: TechnologyItem[];
  createdAt: string;
  updatedAt: string;
}

interface TechnologyListProps {
  onEdit: (technology: Technology) => void;
}

export function TechnologyList({ onEdit }: TechnologyListProps) {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTechnologies = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/technologies`
      );
      if (!response.ok) throw new Error("Failed to fetch technologies");
      const data = await response.json();
      setTechnologies(data.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching technologies:", error);
      setError("Failed to fetch technologies. Please try again.")
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this technology category? This will also delete all items in this category.")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/technologies/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete technology category");

      toast.success("Technology category deleted successfully");
      await fetchTechnologies(); // Refresh the list
    } catch (error) {
      console.error("Error deleting technology category:", error);
      toast.error("Failed to delete technology category. Please try again.")
    }
  };


  const handleDeleteItem = async (technologyId: string, itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this technology item?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/technologies/${technologyId}/items/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete technology item");

      toast.success("Technology item deleted successfully");
      await fetchTechnologies(); // Refresh the list
    } catch (error) {
      console.error("Error deleting technology item:", error);
      toast.error("Failed to delete technology item. Please try again.")
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
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Category Key
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Title
              </th>
              <th className="min-w-[300px] px-4 py-4 font-medium text-dark dark:text-white">
                Technologies
              </th>
              <th className="min-w-[100px] px-4 py-4 font-medium text-dark dark:text-white">
                Items Count
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Created At
              </th>
              <th className="px-4 py-4 font-medium text-dark dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {technologies.map((technology) => (
              <tr key={technology._id}>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 pl-7 py-5 text-black text-start font-semibold">
                  
                    {technology.categoryKey}
                  
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5 text-center">
                  {technology.title}
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {technology.items.length > 0 ? (
                      technology.items.map((item, index) => (
                        <div
                          key={item._id || index}
                          className="dark:bg-meta-4 group flex items-center gap-2 rounded-full bg-gray-1 px-3 py-1 text-sm"
                        >
                          <span className="text-dark dark:text-white">
                            {item.name}
                          </span>
                          <button
                            onClick={() =>
                              handleDeleteItem(technology._id, item._id)
                            }
                            className="text-red-500  transition-opacity hover:text-red-700 group-hover:opacity-100"
                            title="Delete item"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-body-sm italic text-dark-6">
                        No technologies added yet
                      </span>
                    )}
                  </div>
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5 text-center">
                  <span className="bg-success text-success rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium">
                    {technology.items.length}
                  </span>
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5 text-center">
                  {new Date(technology.createdAt).toLocaleDateString()}
                </td>
                <td className="dark:border-strokedark border-b border-[#eee] px-4 py-5">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(technology)}
                      className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(technology._id)}
                      className="inline-flex items-center justify-center rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {technologies.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-dark-6 dark:text-dark-6"
                >
                  No technology categories found. Create your first category to
                  get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
