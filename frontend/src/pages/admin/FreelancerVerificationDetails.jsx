import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  UserIcon,
  IdentificationIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PhotoIcon,
  DocumentIcon,
  DocumentArrowDownIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import DocumentPreview from '../../components/admin/DocumentPreview';

const FreelancerVerificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [verificationLevel, setVerificationLevel] = useState('Basic');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [documentNotes, setDocumentNotes] = useState({});
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  useEffect(() => {
    const fetchFreelancerDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/admin/freelancers/${id}`);
        console.log('Freelancer details:', response.data);

        setFreelancer(response.data.freelancer);
        setVerificationLevel(response.data.freelancer.verificationLevel || 'Basic');
        setVerificationNotes(response.data.freelancer.verificationNotes || '');

        // Initialize document notes
        const notes = {};
        if (response.data.freelancer.verificationDocuments) {
          response.data.freelancer.verificationDocuments.forEach(doc => {
            notes[doc._id] = doc.notes || '';
          });
        }
        setDocumentNotes(notes);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching freelancer details:', err.response?.data || err.message);
        setError('Failed to load freelancer details. Please try again later.');
        setLoading(false);
      }
    };

    fetchFreelancerDetails();
  }, [id]);

  const handleDocumentNoteChange = (docId, note) => {
    setDocumentNotes({
      ...documentNotes,
      [docId]: note
    });
  };

  const handleDocumentPreview = (document) => {
    setSelectedDocument(document);
    setShowDocumentPreview(true);
  };

  const handleVerifyDocument = async (docId, status) => {
    try {
      await axios.put(`/api/admin/freelancers/${id}/documents/${docId}`, {
        status,
        notes: documentNotes[docId] || ''
      });

      // Update local state
      setFreelancer({
        ...freelancer,
        verificationDocuments: freelancer.verificationDocuments.map(doc =>
          doc._id === docId ? { ...doc, status } : doc
        )
      });

      toast.success(`Document ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error updating document status:', err.response?.data || err.message);
      toast.error('Failed to update document status. Please try again.');
    }
  };

  const handleVerifyFreelancer = async (action) => {
    try {
      await axios.put(`/api/admin/freelancers/${id}/verify`, {
        action,
        verificationLevel,
        verificationNotes
      });

      // Update local state
      setFreelancer({
        ...freelancer,
        verificationStatus: action === 'approve' ? 'approved' : 'rejected',
        verificationLevel: action === 'approve' ? verificationLevel : freelancer.verificationLevel
      });

      toast.success(`Freelancer ${action === 'approve' ? 'approved' : 'rejected'} successfully`);

      // Navigate back to the verification list after a short delay
      setTimeout(() => {
        navigate('/admin/verify-freelancers');
      }, 2000);
    } catch (err) {
      console.error('Error updating freelancer verification:', err.response?.data || err.message);
      toast.error('Failed to update freelancer verification. Please try again.');
    }
  };

  const getDocumentTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'id':
      case 'identification':
      case 'driver_license':
      case 'passport':
        return <IdentificationIcon className="h-5 w-5 text-blue-500" />;
      case 'certificate':
      case 'diploma':
      case 'education':
        return <AcademicCapIcon className="h-5 w-5 text-green-500" />;
      case 'resume':
      case 'cv':
        return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
      case 'portfolio':
      case 'work_sample':
        return <BriefcaseIcon className="h-5 w-5 text-amber-500" />;
      case 'image':
      case 'photo':
        return <PhotoIcon className="h-5 w-5 text-pink-500" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDocumentStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircleIcon className="h-3.5 w-3.5 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <ClockIcon className="h-3.5 w-3.5 mr-1" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 shadow-md"></div>
        <span className="mt-4 text-indigo-600 font-medium">Loading freelancer details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-md">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
          <h3 className="text-lg font-medium text-red-800">Error</h3>
        </div>
        <div className="mt-2 text-sm text-red-700">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/verify-freelancers')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-md">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-3" />
          <h3 className="text-lg font-medium text-yellow-800">Freelancer Not Found</h3>
        </div>
        <div className="mt-2 text-sm text-yellow-700">
          <p>The freelancer you are looking for does not exist or has been removed.</p>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/verify-freelancers')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
        <div className="px-6 py-6 bg-gradient-to-r from-indigo-700 to-purple-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl leading-6 font-bold text-white flex items-center">
              <ShieldCheckIcon className="h-6 w-6 mr-2" />
              Freelancer Verification Details
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Review documents and verify freelancer.
            </p>
          </div>
          <Link
            to="/admin/verify-freelancers"
            className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-lg shadow-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Back to List
          </Link>
        </div>
      </div>

      {/* Freelancer Info */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Freelancer Information
          </h2>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                  <span className="text-2xl text-indigo-700 font-semibold">
                    {freelancer.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{freelancer.user?.name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-600">{freelancer.user?.email || 'No email'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-indigo-800 mb-2 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />
                    Hourly Rate
                  </h4>
                  <p className="text-lg font-semibold text-indigo-900">${freelancer.hourlyRate || 0}/hr</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1.5" />
                    Joined
                  </h4>
                  <p className="text-lg font-semibold text-purple-900">
                    {new Date(freelancer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {freelancer.skills && freelancer.skills.length > 0 ? (
                  freelancer.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                    >
                      {skill.name || skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No skills listed</span>
                )}
              </div>

              <h3 className="text-sm font-medium text-gray-700 mb-2 mt-4">Bio</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {freelancer.bio || 'No bio provided'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Verification Status
          </h2>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              freelancer.verificationStatus === 'approved'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : freelancer.verificationStatus === 'rejected'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {freelancer.verificationStatus === 'approved' && <CheckCircleIcon className="h-4 w-4 mr-1.5" />}
              {freelancer.verificationStatus === 'rejected' && <XCircleIcon className="h-4 w-4 mr-1.5" />}
              {freelancer.verificationStatus === 'pending' && <ClockIcon className="h-4 w-4 mr-1.5" />}
              {freelancer.verificationStatus.charAt(0).toUpperCase() + freelancer.verificationStatus.slice(1)}
            </span>

            <span className="ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
              <ShieldCheckIcon className="h-4 w-4 mr-1.5" />
              Level: {freelancer.verificationLevel || 'Basic'}
            </span>
          </div>

          {freelancer.verificationStatus === 'pending' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="verificationLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Level
                </label>
                <select
                  id="verificationLevel"
                  name="verificationLevel"
                  value={verificationLevel}
                  onChange={(e) => setVerificationLevel(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="Basic">Basic</option>
                  <option value="Verified">Verified</option>
                  <option value="Premium">Premium</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {verificationLevel === 'Basic' && 'Limited access to platform features.'}
                  {verificationLevel === 'Verified' && 'Full access to platform features with verified badge.'}
                  {verificationLevel === 'Premium' && 'Priority in search results and premium badge.'}
                </p>
              </div>

              <div>
                <label htmlFor="verificationNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes (Internal)
                </label>
                <textarea
                  id="verificationNotes"
                  name="verificationNotes"
                  rows="3"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add internal notes about this verification..."
                ></textarea>
              </div>
            </div>
          )}

          {freelancer.verificationStatus === 'pending' && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => handleVerifyFreelancer('reject')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <XCircleIcon className="h-4 w-4 mr-1.5" />
                Reject Verification
              </button>
              <button
                type="button"
                onClick={() => handleVerifyFreelancer('approve')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                Approve Verification
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Verification Documents
          </h2>
        </div>
        <div className="px-6 py-5">
          {freelancer.verificationDocuments && freelancer.verificationDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {freelancer.verificationDocuments.map((document) => (
                <div
                  key={document._id}
                  className={`border rounded-lg overflow-hidden shadow-sm ${
                    document.status === 'approved'
                      ? 'border-green-200 bg-green-50'
                      : document.status === 'rejected'
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="px-4 py-4 sm:px-6 flex justify-between items-start">
                    <div className="flex items-center">
                      {getDocumentTypeIcon(document.documentType)}
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {document.documentType || 'Document'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      {getDocumentStatusBadge(document.status)}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() => handleDocumentPreview(document)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                      Preview Document
                    </button>

                    {document.status === 'pending' && (
                      <div className="mt-3">
                        <label htmlFor={`document-notes-${document._id}`} className="block text-xs font-medium text-gray-700 mb-1">
                          Review Notes
                        </label>
                        <textarea
                          id={`document-notes-${document._id}`}
                          rows="2"
                          value={documentNotes[document._id] || ''}
                          onChange={(e) => handleDocumentNoteChange(document._id, e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-xs border-gray-300 rounded-md"
                          placeholder="Add notes about this document..."
                        ></textarea>

                        <div className="mt-3 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => handleVerifyDocument(document._id, 'rejected')}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerifyDocument(document._id, 'approved')}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </button>
                        </div>
                      </div>
                    )}

                    {document.status !== 'pending' && document.notes && (
                      <div className="mt-3">
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Review Notes</h4>
                        <p className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                          {document.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                This freelancer has not uploaded any verification documents yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {showDocumentPreview && selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          onClose={() => setShowDocumentPreview(false)}
        />
      )}
    </div>
  );
};

export default FreelancerVerificationDetails;
