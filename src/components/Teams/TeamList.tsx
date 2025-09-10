"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface TeamMember {
  _id: string;
  name: string;
  description: string;
  designation: string;
  department: string;
  profilePicture: string;
  socialLinks: string[];
}

interface TeamListProps {
  onEdit: (member: TeamMember) => void;
}

function getDepartmentLabel(value: string): string {
  const departments = {
    engineering: "Engineering",
    design: "Design",
    marketing: "Marketing",
    product: "Product",
    operations: "Operations",
    sales: "Sales",
  };
  return departments[value as keyof typeof departments] || value;
}

export function TeamList({ onEdit }: TeamListProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees`,
      );
      if (!response.ok) throw new Error("Failed to fetch team members");
      const data = await response.json();
      setMembers(data.employees);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to fetch team members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete team member");

      toast.success("Team member removed successfully");
      await fetchMembers();
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium text-gray-500">Loading team members...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {members.map((member) => (
        <div
          key={member._id}
          className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white p-4 shadow-default"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full">
              {member.profilePicture ? (
                <Image
                  src={member.profilePicture}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                  <svg
                    className="h-12 w-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-medium text-black dark:text-white">
                {member.name}
              </h3>
              <p className="text-sm text-primary">{member.designation}</p>
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {getDepartmentLabel(member.department)}
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {member.description}
          </p>

          {member.socialLinks.length > 0 && (
            <div className="mt-4 flex gap-3">
              {member.socialLinks.map(
                (link, index) =>
                  link && (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary"
                    >
                      {index == 0 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          stroke-linecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-linkedin-icon lucide-linkedin h-5 w-5"
                        >
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                          <rect width="4" height="12" x="2" y="9" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                      )}
                      {index == 1 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 50 50"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          stroke-linecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z"></path>
                        </svg>
                      )}
                      {index == 2 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          stroke-linecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-instagram-icon lucide-instagram h-5 w-5"
                        >
                          <rect
                            width="20"
                            height="20"
                            x="2"
                            y="2"
                            rx="5"
                            ry="5"
                          />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                      )}
                    </a>
                  ),
              )}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onEdit(member)}
              className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(member._id)}
              className="inline-flex items-center justify-center rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
