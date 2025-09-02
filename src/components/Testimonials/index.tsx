"use client";

import { useState } from "react";
import { TestimonialForm } from "./TestimonialForm";
import { TestimonialList } from "./TestimonialList";

export function Testimonials() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [listKey, setListKey] = useState(0); // To force list re-render

  const handleAddNew = () => {
    setEditingTestimonial(null);
    setIsFormOpen(true);
  };

  const handleEdit = (testimonial: any) => {
    setEditingTestimonial(testimonial);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingTestimonial(null);
    setListKey(prev => prev + 1); // Force list to re-render with new data
  };

  return (
    <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default">
      <div className="p-4 md:p-6 xl:p-9">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-black dark:text-white">
            Testmonials
          </h2>
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
          >
            Add New Testimonial
          </button>
        </div>

        {isFormOpen && (
          <TestimonialForm
            testimonial={editingTestimonial}
            onClose={handleClose}
          />
        )}

        <TestimonialList key={listKey} onEdit={handleEdit} />
      </div>
    </div>
  );
}
