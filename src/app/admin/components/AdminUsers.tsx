'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Lock, XCircle, MoreHorizontal, Filter, Download, Search, Check, Archive } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: string;
  createdAt: string;
}

interface AdminUsersProps {
  theme: 'dark' | 'light';
  searchQuery: string;
}

export default function AdminUsers({ theme, searchQuery }: AdminUsersProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, fetch from API
        // const response = await fetch('/api/admin/users');
        // const data = await response.json();
        
        // For demonstration, using mock data with a delay
        setTimeout(() => {
          setUsers([
            { 
              id: 1, 
              name: 'John Doe', 
              email: 'john.doe@example.com', 
              role: 'user', 
              status: 'active', 
              plan: 'Pro',
              createdAt: '2023-10-15'
            },
            { 
              id: 2, 
              name: 'Jane Smith', 
              email: 'jane.smith@example.com', 
              role: 'admin', 
              status: 'active', 
              plan: 'Business',
              createdAt: '2023-09-22'
            },
            { 
              id: 3, 
              name: 'Bob Johnson', 
              email: 'bob.j@example.com', 
              role: 'user', 
              status: 'suspended', 
              plan: 'Free',
              createdAt: '2023-08-10'
            },
            { 
              id: 4, 
              name: 'Alice Williams', 
              email: 'alice.w@example.com', 
              role: 'user', 
              status: 'inactive', 
              plan: 'Pro',
              createdAt: '2023-11-05'
            },
            { 
              id: 5, 
              name: 'Mike Chen', 
              email: 'mike.chen@example.com', 
              role: 'user', 
              status: 'active', 
              plan: 'Business',
              createdAt: '2023-10-30'
            },
            {
              id: 6,
              name: 'Sarah Garcia',
              email: 'sarah.g@example.com',
              role: 'admin',
              status: 'active',
              plan: 'Business',
              createdAt: '2023-07-15'
            },
            {
              id: 7,
              name: 'David Park',
              email: 'david.p@example.com',
              role: 'user',
              status: 'active',
              plan: 'Pro',
              createdAt: '2023-09-12'
            },
            {
              id: 8,
              name: 'Emily Johnson',
              email: 'emily.j@example.com',
              role: 'user',
              status: 'inactive',
              plan: 'Free',
              createdAt: '2023-10-05'
            },
            {
              id: 9,
              name: 'James Wilson',
              email: 'james.w@example.com',
              role: 'user',
              status: 'active',
              plan: 'Pro',
              createdAt: '2023-08-25'
            },
            {
              id: 10,
              name: 'Jennifer Lopez',
              email: 'jennifer.l@example.com',
              role: 'user',
              status: 'active',
              plan: 'Free',
              createdAt: '2023-11-01'
            },
            {
              id: 11,
              name: 'Robert Smith',
              email: 'robert.s@example.com',
              role: 'user',
              status: 'suspended',
              plan: 'Pro',
              createdAt: '2023-07-30'
            },
            {
              id: 12,
              name: 'Maria Rodriguez',
              email: 'maria.r@example.com',
              role: 'user',
              status: 'active',
              plan: 'Business',
              createdAt: '2023-10-18'
            },
          ]);
        setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching users:', error);
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query and active filter
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch =
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesFilter =
      !activeFilter ||
      (activeFilter === 'admin' ? user.role === 'admin' :
       activeFilter === user.status);

    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Toggle user selection
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
  );
  };

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) return;

    // In a real app, call API to perform the action
    console.log(`Performing ${action} on users:`, selectedUsers);

    // For demo purposes, update UI directly
    if (action === 'activate' || action === 'deactivate' || action === 'suspend') {
      const newStatus =
        action === 'activate' ? 'active' :
        action === 'deactivate' ? 'inactive' : 'suspended';

      setUsers(prev =>
        prev.map(user =>
          selectedUsers.includes(user.id)
            ? { ...user, status: newStatus as any }
            : user
        )
      );
    }

    // Clear selection after action
    setSelectedUsers([]);
  };

  return (
    <>
    <div className={`rounded-xl ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border shadow-sm overflow-hidden`}>
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          User Management
        </h2>
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
          theme === 'dark' 
            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
            : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            onClick={() => setShowAddUserModal(true)}
                  >
            <UserPlus className="h-4 w-4" />
            Add User
                        </button>
                      </div>

        <div className="p-6">
          {/* Filters and bulk actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 ${
                  activeFilter === null
                    ? theme === 'dark'
                      ? 'bg-purple-900/30 text-purple-400'
                      : 'bg-purple-100 text-purple-700'
                    : theme === 'dark'
                      ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-400'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveFilter(null)}
              >
                All
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 ${
                  activeFilter === 'active'
                    ? theme === 'dark'
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-green-100 text-green-700'
                    : theme === 'dark'
                      ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-400'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveFilter('active')}
              >
                Active
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 ${
                  activeFilter === 'inactive'
                    ? theme === 'dark'
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                    : theme === 'dark'
                      ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-400'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveFilter('inactive')}
              >
                Inactive
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 ${
                  activeFilter === 'suspended'
                    ? theme === 'dark'
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-red-100 text-red-700'
                    : theme === 'dark'
                      ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-400'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveFilter('suspended')}
              >
                Suspended
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 ${
                  activeFilter === 'admin'
                    ? theme === 'dark'
                      ? 'bg-purple-900/30 text-purple-400'
                      : 'bg-purple-100 text-purple-700'
                    : theme === 'dark'
                      ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-400'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveFilter('admin')}
              >
                Admins
              </button>
            </div>

            <div className="flex gap-2">
              <button
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Filter className="h-4 w-4" />
                Filter
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
              theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-gray-100'
            }`}>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedUsers.length} users selected
              </span>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1.5 text-xs rounded flex items-center gap-1 ${
                    theme === 'dark'
                      ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  onClick={() => handleBulkAction('activate')}
                >
                  <Check className="h-3 w-3" />
                  Activate
                </button>
                <button
                  className={`px-3 py-1.5 text-xs rounded flex items-center gap-1 ${
                    theme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <Archive className="h-3 w-3" />
                  Deactivate
                </button>
                <button
                  className={`px-3 py-1.5 text-xs rounded flex items-center gap-1 ${
                    theme === 'dark'
                      ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                  onClick={() => handleBulkAction('suspend')}
                >
                  <XCircle className="h-3 w-3" />
                  Suspend
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                      <th className="text-left pb-4 font-medium w-8">
                        <input
                          type="checkbox"
                          className="rounded text-purple-600 focus:ring-purple-500"
                          checked={selectedUsers.length > 0 && selectedUsers.length === currentUsers.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(currentUsers.map(user => user.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                        />
                      </th>
                      <th className="text-left pb-4 font-medium">Name</th>
                      <th className="text-left pb-4 font-medium">Email</th>
                      <th className="text-left pb-4 font-medium">Role</th>
                      <th className="text-left pb-4 font-medium">Status</th>
                      <th className="text-left pb-4 font-medium">Plan</th>
                      <th className="text-left pb-4 font-medium">Created</th>
                      <th className="text-right pb-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map(user => (
                      <tr
                        key={user.id}
                        className={`border-t ${
                          theme === 'dark' ? 'border-gray-800 hover:bg-[#1e1e2d]' : 'border-gray-100 hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <td className="py-4 pr-2">
                          <input
                            type="checkbox"
                            className="rounded text-purple-600 focus:ring-purple-500"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </td>
                        <td className="py-4 pr-4">
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="text-gray-500">{user.email}</div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                              : theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active'
                              ? theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                              : user.status === 'inactive'
                                ? theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                                : theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{user.plan}</div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="text-gray-500">{user.createdAt}</div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className={`p-1 rounded ${
                              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                            }`}>
                              <Edit className="h-4 w-4 text-gray-500" />
                            </button>
                            <button className={`p-1 rounded ${
                              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                            }`}>
                              <Lock className="h-4 w-4 text-gray-500" />
                            </button>
                            <button className={`p-1 rounded ${
                              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                            }`}>
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}
                  </div>
                  <div className="flex gap-1">
                    <button
                      className={`px-3 py-1 rounded ${
                        theme === 'dark'
                          ? currentPage === 1 ? 'text-gray-600' : 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-300'
                          : currentPage === 1 ? 'text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        className={`w-8 h-8 rounded-full ${
                          currentPage === i + 1
                            ? theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
                            : theme === 'dark' ? 'hover:bg-[#2a2a3c] text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                        }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className={`px-3 py-1 rounded ${
                        theme === 'dark'
                          ? currentPage === totalPages ? 'text-gray-600' : 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-300'
                          : currentPage === totalPages ? 'text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add User Modal - Would be implemented in a real app */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md rounded-lg shadow-lg ${theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Add New User
                </h3>
                <button
                  className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                  onClick={() => setShowAddUserModal(false)}
                >
                  <XCircle className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              {/* Form fields would go here */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white`}
                  onClick={() => setShowAddUserModal(false)}
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
