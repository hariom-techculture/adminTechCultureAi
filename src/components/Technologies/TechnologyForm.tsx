"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface TechnologyItem {
  _id?: string;
  name: string;
}

interface TechnologyFormProps {
  technology?: {
    _id?: string;
    categoryKey: string;
    title: string;
    items: TechnologyItem[];
  } | null;
  onClose: () => void;
}

export function TechnologyForm({ technology, onClose }: TechnologyFormProps) {
  const [formData, setFormData] = useState(() => ({
    categoryKey: technology?.categoryKey || "",
    title: technology?.title || "",
    items: technology?.items || [],
  }));
  const [newItemName, setNewItemName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false); // Always start with dropdown
  const [customCategoryKey, setCustomCategoryKey] = useState("");

  // Reset form when technology prop changes
  useEffect(() => {
    setFormData({
      categoryKey: technology?.categoryKey || "",
      title: technology?.title || "",
      items: technology?.items || [],
    });
    setNewItemName("");
    // Always show dropdown by default unless editing a category not in the list
    if (technology?.categoryKey && !existingCategories.includes(technology.categoryKey)) {
      setShowCustomCategory(true);
      setCustomCategoryKey(technology.categoryKey);
    } else {
      setShowCustomCategory(false);
      setCustomCategoryKey("");
    }
  }, [technology, existingCategories]);

  // Fetch existing categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/technologies`);
        if (response.ok) {
          const data = await response.json();
          const categories = data.data.map((tech: any) => tech.categoryKey);
          setExistingCategories(categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loadingToast = toast.loading("Saving technology category...");

    try {
      const url = technology?._id
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/technologies/${technology._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/technologies`;

      const method = technology?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryKey: showCustomCategory ? customCategoryKey : formData.categoryKey,
          title: formData.title,
          items: formData.items,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save technology category");
      }

      const result = await response.json();
      toast.success("Technology category saved successfully!", {
        id: loadingToast,
      });
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error saving technology category:", error);
      toast.error((error as Error).message || "Failed to save technology category", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast.error("Please enter a technology item name");
      return;
    }

    // Check if item already exists
    const itemExists = formData.items.some((item) => item.name.toLowerCase() === newItemName.toLowerCase());
    if (itemExists) {
      toast.error("This technology item already exists");
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: newItemName.trim() }]
    }));
    setNewItemName("");
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleEditItem = (index: number, newName: string) => {
    if (!newName.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, name: newName.trim() } : item
      )
    }));
  };

  return (
    <ShowcaseSection
      title={technology ? "Edit Technology Category" : "Add New Technology Category"}
      className="!p-6.5 !mb-10"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4.5">
          <label className="mb-2.5 block text-black dark:text-white">
            Category Key
          </label>
          
          {!showCustomCategory ? (
            <div className="space-y-3">
              <select
                value={formData.categoryKey}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setShowCustomCategory(true);
                    setFormData(prev => ({ ...prev, categoryKey: "" }));
                  } else {
                    setFormData(prev => ({ ...prev, categoryKey: e.target.value }));
                  }
                }}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              >
                <option value="">Select existing category or create new</option>
                {existingCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="custom">+ Add New Category</option>
              </select>
              
              <p className="text-sm text-body-color dark:text-body-color-dark">
                Select an existing category or choose "Add New Category" to create a custom one
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter unique category key (e.g., frontend, backend)"
                  value={customCategoryKey}
                  onChange={(e) => setCustomCategoryKey(e.target.value)}
                  className="flex-1 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategoryKey("");
                    setFormData(prev => ({ ...prev, categoryKey: "" }));
                  }}
                  className="rounded border border-stroke px-4 py-3 text-dark hover:bg-gray-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-sm text-body-color dark:text-body-color-dark">
                Enter a unique key for the new technology category
              </p>
            </div>
          )}
        </div>

        <InputGroup
          label="Title"
          type="text"
          placeholder="Enter category title (e.g., Frontend Technologies)"
          className="mb-4.5"
          required
          value={formData.title}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />

        <div className="mb-4.5">
          <label className="mb-2.5 block text-black dark:text-white">
            Technology Items
          </label>
          
          {/* Add new item */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Enter technology name (e.g., React, Node.js)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem())}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-gray-2 hover:bg-opacity-90"
            >
              Add
            </button>
          </div>

          {/* Display items */}
          <div className="space-y-2">
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2 rounded-lg border border-stroke p-3 dark:border-strokedark">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleEditItem(index, e.target.value)}
                  className="flex-1 bg-transparent text-black outline-none dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-500 hover:text-red-700 px-2 py-1"
                >
                  ✕
                </button>
              </div>
            ))}
            
            {formData.items.length === 0 && (
              <p className="text-body-sm text-dark-6 italic">
                No technology items added yet. Add some items above.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex justify-center rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
