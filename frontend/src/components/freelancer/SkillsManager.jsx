import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SkillsManager = ({ skills = [], onUpdate }) => {
  const [skillsList, setSkillsList] = useState(skills);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isEditingSkill, setIsEditingSkill] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'Intermediate',
    yearsOfExperience: 1
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setSkillsList(skills);
  }, [skills]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSkill({
      ...newSkill,
      [name]: name === 'yearsOfExperience' ? parseInt(value) || 0 : value
    });

    // Clear field error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newSkill.name.trim()) {
      newErrors.name = 'Skill name is required';
    }

    if (newSkill.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'Years of experience cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSkill = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Make API call to add skill
      const response = await axios.post('/api/freelancer/skills', newSkill);
      
      // Update local state
      setSkillsList([...skillsList, response.data.skill]);
      
      // Reset form
      setNewSkill({
        name: '',
        level: 'Intermediate',
        yearsOfExperience: 1
      });
      
      setIsAddingSkill(false);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate([...skillsList, response.data.skill]);
      }
      
      toast.success('Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error(error.response?.data?.message || 'Failed to add skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSkill = (index) => {
    const skill = skillsList[index];
    setIsEditingSkill(index);
    setNewSkill({
      name: skill.name,
      level: skill.level,
      yearsOfExperience: skill.yearsOfExperience
    });
  };

  const handleUpdateSkill = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const skillId = skillsList[isEditingSkill]._id;
      
      // Make API call to update skill
      const response = await axios.put(`/api/freelancer/skills/${skillId}`, newSkill);
      
      // Update local state
      const updatedSkills = [...skillsList];
      updatedSkills[isEditingSkill] = response.data.skill;
      setSkillsList(updatedSkills);
      
      // Reset form
      setNewSkill({
        name: '',
        level: 'Intermediate',
        yearsOfExperience: 1
      });
      
      setIsEditingSkill(null);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedSkills);
      }
      
      toast.success('Skill updated successfully!');
    } catch (error) {
      console.error('Error updating skill:', error);
      toast.error(error.response?.data?.message || 'Failed to update skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSkill = async (index) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;

    try {
      const skillId = skillsList[index]._id;

      // Make API call to delete skill
      await axios.delete(`/api/freelancer/skills/${skillId}`);
      
      // Update local state
      const updatedSkills = skillsList.filter((_, i) => i !== index);
      setSkillsList(updatedSkills);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedSkills);
      }
      
      toast.success('Skill deleted successfully!');
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error(error.response?.data?.message || 'Failed to delete skill');
    }
  };

  const handleCancel = () => {
    setIsAddingSkill(false);
    setIsEditingSkill(null);
    setNewSkill({
      name: '',
      level: 'Intermediate',
      yearsOfExperience: 1
    });
    setErrors({});
  };

  // Get color for skill level badge
  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'Advanced':
        return 'bg-purple-100 text-purple-800';
      case 'Expert':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Skills</h3>
        {!isAddingSkill && isEditingSkill === null && (
          <button
            type="button"
            onClick={() => setIsAddingSkill(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Skill
          </button>
        )}
      </div>

      {/* Skills List */}
      {skillsList.length === 0 && !isAddingSkill ? (
        <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No skills added</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your skills to showcase your expertise.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsAddingSkill(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Skill
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {skillsList.map((skill, index) => (
              <li key={index}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                          {skill.level}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'} of experience
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditSkill(index)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(index)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add/Edit Skill Form */}
      {(isAddingSkill || isEditingSkill !== null) && (
        <div className="bg-white shadow sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isAddingSkill ? 'Add Skill' : 'Edit Skill'}
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Skill Name */}
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Skill Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={newSkill.name}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                    placeholder="e.g., JavaScript, React, UI Design"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
              </div>

              {/* Skill Level */}
              <div className="sm:col-span-3">
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                  Skill Level
                </label>
                <div className="mt-1">
                  <select
                    id="level"
                    name="level"
                    value={newSkill.level}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              {/* Years of Experience */}
              <div className="sm:col-span-3">
                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                  Years of Experience
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="yearsOfExperience"
                    id="yearsOfExperience"
                    min="0"
                    max="50"
                    value={newSkill.yearsOfExperience}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.yearsOfExperience ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.yearsOfExperience && (
                    <p className="mt-2 text-sm text-red-600">{errors.yearsOfExperience}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={isAddingSkill ? handleAddSkill : handleUpdateSkill}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isAddingSkill ? 'Adding...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    {isAddingSkill ? 'Add Skill' : 'Update Skill'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsManager;
