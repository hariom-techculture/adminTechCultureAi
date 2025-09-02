"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Search, Eye, PencilIcon, Trash2, UserPlus } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  profilePicture?: string;
  createdAt: string;
}

export default function UserPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateEdit, setShowCreateEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/users/all-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error: any) {
      toast.error(error.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${apiUrl}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      toast.success("User created successfully");
      setShowCreateEdit(false);
      setFormData({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Error creating user");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await fetch(`${apiUrl}/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      toast.success("User updated successfully");
      setShowCreateEdit(false);
      setFormData({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Error updating user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast.success("User deleted successfully");
      setUsers(users.filter(user => user._id !== userId));
      if (selectedUser?._id === userId) {
        setShowDetails(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Error deleting user");
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't set password for editing
      role: user.role,
    });
    setIsEditing(true);
    setShowCreateEdit(true);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Breadcrumb pageName="User Management" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-4 md:p-6 xl:p-9">
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="flex-1">
              <div className="relative z-20">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary" />
                </span>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded border border-stroke bg-transparent py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            <div>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedUser(null);
                  setFormData({ name: "", email: "", password: "", role: "user" });
                  setShowCreateEdit(true);
                }}
                className="flex items-center gap-2 rounded bg-primary py-2 px-4.5 font-medium text-white hover:bg-opacity-80"
              >
                <UserPlus className="h-4 w-4" />
                Add New User
              </button>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-h-[calc(100vh-370px)] overflow-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                      User
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Role
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Status
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Joined
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center">
                        <div className="flex justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-body-color dark:text-bodydark">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark xl:pl-11">
                          <div className="flex flex-col gap-1">
                            <h5 className="font-medium text-black dark:text-white">
                              {user.name}
                            </h5>
                            <p className="text-sm text-body-color dark:text-bodydark">{user.email}</p>
                          </div>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <span className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                            user.role === "admin" 
                              ? "bg-meta-3/10 text-meta-3" 
                              : "bg-primary/10 text-primary"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <span className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                            user.isVerified 
                              ? "bg-meta-3/10 text-meta-3" 
                              : "bg-meta-1/10 text-meta-1"
                          }`}>
                            {user.isVerified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {formatDate(user.createdAt)}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <div className="flex items-center space-x-3.5">
                            <button
                              className="hover:text-primary"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="hover:text-success"
                              onClick={() => handleEdit(user)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              className="hover:text-meta-1"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-xl rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-title-md font-bold text-black dark:text-white">
                User Details
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
                  {selectedUser.name}
                </p>
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">Email</label>
                <p className="text-body-color dark:text-bodydark">
                  {selectedUser.email}
                </p>
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">Role</label>
                <p className="text-body-color dark:text-bodydark">
                  {selectedUser.role}
                </p>
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">Status</label>
                <p className="text-body-color dark:text-bodydark">
                  {selectedUser.isVerified ? "Verified" : "Pending Verification"}
                </p>
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">Joined Date</label>
                <p className="text-body-color dark:text-bodydark">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>

              {selectedUser.profilePicture && (
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">Profile Picture</label>
                  <img
                    src={selectedUser.profilePicture}
                    alt={selectedUser.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                onClick={() => setShowDetails(false)}
                className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      {showCreateEdit && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-xl rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-title-md font-bold text-black dark:text-white">
                {isEditing ? "Edit User" : "Create New User"}
              </h3>
              <button
                onClick={() => setShowCreateEdit(false)}
                className="text-body-color hover:text-meta-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={isEditing ? handleUpdateUser : handleCreateUser}>
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Name <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Email <span className="text-meta-1">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>

              {!isEditing && (
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Password <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    required
                  />
                </div>
              )}

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Role <span className="text-meta-1">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateEdit(false)}
                  className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
