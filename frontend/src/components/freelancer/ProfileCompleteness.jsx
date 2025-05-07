import React, { useState, useEffect } from 'react';

const ProfileCompleteness = ({ profile }) => {
  const [completeness, setCompleteness] = useState({
    percentage: 0,
    missingFields: [],
    status: 'Incomplete'
  });

  useEffect(() => {
    if (profile) {
      calculateCompleteness(profile);
    }
  }, [profile]);

  const calculateCompleteness = (profile) => {
    // Define required fields and their weights
    const fields = [
      { name: 'name', label: 'Full Name', weight: 10, check: () => profile.name && profile.name.trim() !== '' },
      { name: 'title', label: 'Professional Title', weight: 10, check: () => profile.title && profile.title.trim() !== '' },
      { name: 'bio', label: 'Bio', weight: 15, check: () => profile.bio && profile.bio.trim() !== '' },
      { name: 'skills', label: 'Skills', weight: 15, check: () => profile.skills && profile.skills.length > 0 },
      { name: 'hourlyRate', label: 'Hourly Rate', weight: 5, check: () => profile.hourlyRate && profile.hourlyRate > 0 },
      { name: 'education', label: 'Education', weight: 10, check: () => profile.education && profile.education.length > 0 },
      { name: 'workExperience', label: 'Work Experience', weight: 10, check: () => profile.workExperience && profile.workExperience.length > 0 },
      { name: 'portfolio', label: 'Portfolio Items', weight: 15, check: () => profile.portfolio && profile.portfolio.length > 0 },
      { name: 'languages', label: 'Languages', weight: 5, check: () => profile.languages && profile.languages.length > 0 },
      { name: 'profileImage', label: 'Profile Image', weight: 5, check: () => profile.profileImage && profile.profileImage.trim() !== '' }
    ];

    // Calculate total score
    let totalScore = 0;
    const missing = [];

    fields.forEach(field => {
      if (field.check()) {
        totalScore += field.weight;
      } else {
        missing.push(field.label);
      }
    });

    // Determine status based on percentage
    let status = 'Incomplete';
    if (totalScore >= 85) {
      status = 'Excellent';
    } else if (totalScore >= 70) {
      status = 'Good';
    } else if (totalScore >= 40) {
      status = 'Average';
    }

    setCompleteness({
      percentage: totalScore,
      missingFields: missing,
      status
    });
  };

  // Get color based on percentage
  const getColorClass = () => {
    if (completeness.percentage >= 85) return 'bg-green-500';
    if (completeness.percentage >= 70) return 'bg-blue-500';
    if (completeness.percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get text color based on percentage
  const getTextColorClass = () => {
    if (completeness.percentage >= 85) return 'text-green-700';
    if (completeness.percentage >= 70) return 'text-blue-700';
    if (completeness.percentage >= 40) return 'text-yellow-700';
    return 'text-red-700';
  };

  // Get background color based on percentage
  const getBgColorClass = () => {
    if (completeness.percentage >= 85) return 'bg-green-50 border-green-100';
    if (completeness.percentage >= 70) return 'bg-blue-50 border-blue-100';
    if (completeness.percentage >= 40) return 'bg-yellow-50 border-yellow-100';
    return 'bg-red-50 border-red-100';
  };

  return (
    <div className={`rounded-lg p-6 ${getBgColorClass()} border shadow-sm`}>
      <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Completeness</h3>
      
      <div className="flex items-center mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-4 mr-2">
          <div 
            className={`${getColorClass()} h-4 rounded-full transition-all duration-500 ease-in-out`}
            style={{ width: `${completeness.percentage}%` }}
          ></div>
        </div>
        <span className={`text-sm font-medium ${getTextColorClass()}`}>
          {completeness.percentage}%
        </span>
      </div>
      
      <p className={`text-sm font-medium ${getTextColorClass()} mb-3`}>
        Status: {completeness.status}
      </p>
      
      {completeness.percentage < 100 && (
        <div>
          <p className="text-sm text-gray-700 mb-2">
            Complete these items to improve your profile:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            {completeness.missingFields.map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </ul>
        </div>
      )}
      
      {completeness.percentage === 100 && (
        <div className="flex items-center text-green-700">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Your profile is complete! This will help you attract more clients.</span>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>A complete profile increases your chances of getting hired by up to 70%.</p>
      </div>
    </div>
  );
};

export default ProfileCompleteness;
