import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AddUserForm from '../../components/admin/AddUserForm';
import EditUserForm from '../../components/admin/EditUserForm';
import {
  UserGroupIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        // Make real API call to fetch users
        const response = await axios.get('/api/admin/users');
        console.log('Users data:', response.data);

        // Transform the data to match our component's expected format
        const usersData = response.data.users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status || 'active',
          verified: user.isVerified,
          projects: user.projects ? user.projects.length : 0,
          createdAt: user.createdAt
        }));

        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err.response?.data || err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => {
      // Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const nameMatch = user.name.toLowerCase().includes(term);
        const emailMatch = user.email.toLowerCase().includes(term);

        if (!nameMatch && !emailMatch) {
          return false;
        }
      }

      // Role filter
      if (filterRole !== 'all' && user.role !== filterRole) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all' && user.status !== filterStatus) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'projects':
          return b.projects - a.projects;
        default:
          return 0;
      }
    });

  // Handle user selection for bulk actions
  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Handle select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredAndSortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredAndSortedUsers.map(user => user.id));
    }
  };

  // Handle bulk action
  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    // In a real app, this would make an API call
    console.log(`Performing ${bulkAction} on users:`, selectedUsers);

    // Reset selection and action
    setSelectedUsers([]);
    setBulkAction('');
  };

  // Handle adding a new user
  const handleAddUser = (newUser) => {
    setUsers(prevUsers => [
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status || 'active',
        verified: newUser.isVerified,
        projects: 0,
        createdAt: newUser.createdAt
      },
      ...prevUsers
    ]);
  };

  // Handle editing a user
  const handleEditUser = (userId) => {
    setEditingUserId(userId);
    setShowEditUserModal(true);
  };

  // Handle updating a user
  const handleUserUpdated = (updatedUser) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === updatedUser._id
          ? {
              ...user,
              name: updatedUser.name,
              status: updatedUser.status || user.status,
            }
          : user
      )
    );
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`);

      // Remove user from state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      alert('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. Please try again later.');
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'client':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'freelancer':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 shadow-md"></div>
        <span className="mt-4 text-indigo-600 font-medium">Loading users data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-indigo-900 bg-opacity-75 backdrop-blur-sm"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fadeIn">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Add New User
                </h3>
              </div>
              <AddUserForm
                onClose={() => setShowAddUserModal(false)}
                onUserAdded={handleAddUser}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-indigo-900 bg-opacity-75 backdrop-blur-sm"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fadeIn">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <PencilSquareIcon className="h-5 w-5 mr-2" />
                  Edit User
                </h3>
              </div>
              <EditUserForm
                userId={editingUserId}
                onClose={() => {
                  setShowEditUserModal(false);
                  setEditingUserId(null);
                }}
                onUserUpdated={handleUserUpdated}
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-6 bg-gradient-to-r from-indigo-700 to-purple-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl leading-6 font-bold text-white flex items-center">
              <UserGroupIcon className="h-6 w-6 mr-2" />
              Manage Users
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              View and manage all users in the system.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <UserPlusIcon className="h-5 w-5 mr-1.5" />
            Add New User
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Filter and Search
          </h3>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
            {/* Search */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-3">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 flex items-center">
                <MagnifyingGlassIcon className="h-4 w-4 mr-1 text-indigo-600" />
                Search Users
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pr-10 sm:text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Search by name or email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Role Filter */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-3">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1 text-indigo-600" />
                Filter by Role
              </label>
              <select
                id="role"
                name="role"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="mt-1.5 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg transition-all duration-200"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1 text-indigo-600" />
                Filter by Status
              </label>
              <select
                id="status"
                name="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1.5 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg transition-all duration-200"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-3">
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 flex items-center">
                <ArrowsUpDownIcon className="h-4 w-4 mr-1 text-indigo-600" />
                Sort Results
              </label>
              <select
                id="sortBy"
                name="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1.5 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg transition-all duration-200"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="projects">Most Projects</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-white shadow-lg overflow-hidden rounded-xl animate-fadeIn">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <h3 className="text-sm font-semibold text-indigo-800">Bulk Actions</h3>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                <span className="text-sm font-semibold">{selectedUsers.length}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'} selected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                id="bulkAction"
                name="bulkAction"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm transition-all duration-200"
              >
                <option value="">Select Action</option>
                <option value="activate">Activate Users</option>
                <option value="suspend">Suspend Users</option>
                <option value="delete">Delete Users</option>
              </select>
              <button
                type="button"
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Apply Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        {filteredAndSortedUsers.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <UserGroupIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-gray-600 mb-2">No users found matching your filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('all');
                setFilterStatus('all');
              }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        id="select-all"
                        name="select-all"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={selectedUsers.length === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Projects
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAndSortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-indigo-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          id={`select-user-${user.id}`}
                          name={`select-user-${user.id}`}
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                            <span className="text-indigo-700 font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm border ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm border ${getStatusBadgeColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                      {!user.verified && (
                        <span className="ml-1 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm border border-amber-200 bg-amber-100 text-amber-800">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-700 bg-indigo-50 rounded-full w-8 h-8 flex items-center justify-center">
                        {user.projects}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => handleEditUser(user.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <PencilSquareIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
