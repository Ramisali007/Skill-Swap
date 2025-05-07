import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const VerifyFreelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedFreelancers, setSelectedFreelancers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);

      try {
        // Make real API call to fetch freelancers for verification
        const response = await axios.get('/api/admin/freelancers/verification');
        console.log('Freelancers data:', response.data);

        // Transform the data to match our component's expected format
        const freelancersData = response.data.freelancers.map(freelancer => {
          // Calculate experience from work experience if available
          let experienceText = 'Not specified';
          if (freelancer.workExperience && freelancer.workExperience.length > 0) {
            const totalYears = freelancer.workExperience.reduce((total, job) => {
              const from = new Date(job.from);
              const to = job.current ? new Date() : new Date(job.to);
              const years = (to - from) / (1000 * 60 * 60 * 24 * 365);
              return total + years;
            }, 0);
            experienceText = `${Math.round(totalYears)} years`;
          }

          // Extract skill names from the skills array
          const skillNames = freelancer.skills && freelancer.skills.length > 0
            ? freelancer.skills.map(skill => skill.name || skill)
            : [];

          // Get documents from verificationDocuments
          const documents = freelancer.verificationDocuments && freelancer.verificationDocuments.length > 0
            ? freelancer.verificationDocuments.map(doc => ({
                id: doc._id,
                name: doc.documentType || 'Document',
                type: doc.documentType || 'other'
              }))
            : [];

          return {
            id: freelancer._id,
            name: freelancer.user ? freelancer.user.name : 'Unknown',
            email: freelancer.user ? freelancer.user.email : 'unknown@example.com',
            skills: skillNames,
            experience: experienceText,
            hourlyRate: freelancer.hourlyRate || 0,
            verificationStatus: freelancer.verificationStatus || 'pending',
            documents: documents,
            appliedAt: freelancer.createdAt
          };
        });

        setFreelancers(freelancersData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching freelancers:', err.response?.data || err.message);
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  // Filter and sort freelancers
  const filteredAndSortedFreelancers = freelancers
    .filter(freelancer => {
      // Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const nameMatch = freelancer.name.toLowerCase().includes(term);
        const emailMatch = freelancer.email.toLowerCase().includes(term);
        const skillsMatch = freelancer.skills.some(skill => skill.toLowerCase().includes(term));

        if (!nameMatch && !emailMatch && !skillsMatch) {
          return false;
        }
      }

      // Status filter
      if (filterStatus !== 'all' && freelancer.verificationStatus !== filterStatus) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.appliedAt) - new Date(a.appliedAt);
        case 'oldest':
          return new Date(a.appliedAt) - new Date(b.appliedAt);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'rate_high':
          return b.hourlyRate - a.hourlyRate;
        case 'rate_low':
          return a.hourlyRate - b.hourlyRate;
        default:
          return 0;
      }
    });

  // Handle freelancer selection for bulk actions
  const handleSelectFreelancer = (freelancerId) => {
    if (selectedFreelancers.includes(freelancerId)) {
      setSelectedFreelancers(selectedFreelancers.filter(id => id !== freelancerId));
    } else {
      setSelectedFreelancers([...selectedFreelancers, freelancerId]);
    }
  };

  // Handle select all freelancers
  const handleSelectAll = () => {
    if (selectedFreelancers.length === filteredAndSortedFreelancers.length) {
      setSelectedFreelancers([]);
    } else {
      setSelectedFreelancers(filteredAndSortedFreelancers.map(freelancer => freelancer.id));
    }
  };

  // Handle bulk action
  const handleBulkAction = async () => {
    if (!bulkAction || selectedFreelancers.length === 0) return;

    try {
      // Make real API call to perform bulk action on freelancers
      const response = await axios.put('/api/admin/freelancers/bulk-verify', {
        freelancerIds: selectedFreelancers,
        action: bulkAction
      });

      console.log(`Bulk ${bulkAction} response:`, response.data);

      // Update local state to reflect the changes
      setFreelancers(freelancers.map(freelancer => {
        if (selectedFreelancers.includes(freelancer.id)) {
          return {
            ...freelancer,
            verificationStatus: bulkAction === 'approve' ? 'approved' :
                               bulkAction === 'reject' ? 'rejected' : freelancer.verificationStatus
          };
        }
        return freelancer;
      }));

      // Reset selection and action
      setSelectedFreelancers([]);
      setBulkAction('');
    } catch (err) {
      console.error('Error performing bulk action:', err.response?.data || err.message);
    }
  };

  // Handle individual freelancer verification
  const handleVerification = async (freelancerId, action) => {
    try {
      // Make real API call to update freelancer verification status
      const response = await axios.put(`/api/admin/freelancers/${freelancerId}/verify`, {
        action: action
      });

      console.log(`${action} freelancer response:`, response.data);

      // Update local state to reflect the change
      setFreelancers(freelancers.map(freelancer => {
        if (freelancer.id === freelancerId) {
          return {
            ...freelancer,
            verificationStatus: action === 'approve' ? 'approved' :
                               action === 'reject' ? 'rejected' : 'pending'
          };
        }
        return freelancer;
      }));
    } catch (err) {
      console.error('Error updating freelancer verification status:', err.response?.data || err.message);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 shadow-md"></div>
        <span className="mt-4 text-indigo-600 font-medium">Loading freelancer verification data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-6 bg-gradient-to-r from-indigo-700 to-purple-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl leading-6 font-bold text-white flex items-center">
              <ShieldCheckIcon className="h-6 w-6 mr-2" />
              Verify Freelancers
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Review and verify freelancer applications.
            </p>
          </div>
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
          <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
            {/* Search */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-3">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 flex items-center">
                <MagnifyingGlassIcon className="h-4 w-4 mr-1 text-indigo-600" />
                Search Freelancers
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pr-10 sm:text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Search by name, email, or skills"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
                <option value="rate_high">Hourly Rate: High to Low</option>
                <option value="rate_low">Hourly Rate: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedFreelancers.length > 0 && (
        <div className="bg-white shadow-lg overflow-hidden rounded-xl animate-fadeIn">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <h3 className="text-sm font-semibold text-indigo-800">Bulk Actions</h3>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                <span className="text-sm font-semibold">{selectedFreelancers.length}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {selectedFreelancers.length} {selectedFreelancers.length === 1 ? 'freelancer' : 'freelancers'} selected
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
                <option value="approve">Approve Freelancers</option>
                <option value="reject">Reject Freelancers</option>
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

      {/* Freelancers List */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        {filteredAndSortedFreelancers.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <UserGroupIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-gray-600 mb-2">No freelancers found matching your filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
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
                        checked={selectedFreelancers.length === filteredAndSortedFreelancers.length && filteredAndSortedFreelancers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Freelancer
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Skills
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Experience
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Hourly Rate
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Documents
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAndSortedFreelancers.map((freelancer) => (
                  <tr key={freelancer.id} className="hover:bg-indigo-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          id={`select-freelancer-${freelancer.id}`}
                          name={`select-freelancer-${freelancer.id}`}
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          checked={selectedFreelancers.includes(freelancer.id)}
                          onChange={() => handleSelectFreelancer(freelancer.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                            <span className="text-indigo-700 font-semibold">{freelancer.name.charAt(0).toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{freelancer.name}</div>
                          <div className="text-sm text-gray-600">{freelancer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1.5">
                        {freelancer.skills.map((skill, index) => (
                          <span key={index} className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-4 w-4 text-indigo-500 mr-1.5" />
                        <span className="text-sm font-medium text-gray-700">{freelancer.experience}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1.5" />
                        <span className="text-sm font-semibold text-green-700">${freelancer.hourlyRate}/hr</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusBadgeColor(freelancer.verificationStatus)}`}>
                        {freelancer.verificationStatus.charAt(0).toUpperCase() + freelancer.verificationStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1.5">
                        {freelancer.documents.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            className="text-indigo-600 hover:text-indigo-900 text-sm text-left flex items-center"
                          >
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            {doc.name}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/admin/verify-freelancers/${freelancer.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <DocumentTextIcon className="h-3.5 w-3.5 mr-1" />
                          Review Details
                        </Link>

                        {freelancer.verificationStatus === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerification(freelancer.id, 'approve')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerification(freelancer.id, 'reject')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>

                      {freelancer.verificationStatus !== 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleVerification(freelancer.id, 'reset')}
                          className="mt-2 inline-flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          Reset Status
                        </button>
                      )}
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

export default VerifyFreelancers;
