"use client";

import { useState } from "react";
import { TeamForm } from "./TeamForm";
import { TeamList } from "./TeamList";

export function Teams() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [listKey, setListKey] = useState(0);

  const handleAddNew = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingMember(null);
    setListKey(prev => prev + 1); // Force list to re-render with new data
  };

  return (
    <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default">
      <div className="p-4 md:p-6 xl:p-9">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-black dark:text-white">
            Our Teams
          </h2>
          <button
            onClick={handleAddNew}
            className="group flex items-center justify-center gap-2.5 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
          >
            <svg
              className="fill-white"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM15 11H11V15H9V11H5V9H9V5H11V9H15V11Z" />
            </svg>
            Add Team Member
          </button>
        </div>

        {isFormOpen && (
          <TeamForm member={editingMember} onClose={handleClose} />
        )}

        <TeamList key={listKey} onEdit={handleEdit} />
      </div>
    </div>
  );
}
