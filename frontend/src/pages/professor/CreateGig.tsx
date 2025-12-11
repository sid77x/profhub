import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGigsStore } from '../../store/gigsStore';
import { useAuthStore } from '../../store/authStore';

const CreateGig: React.FC = () => {
  const navigate = useNavigate();
  const { createGig, loading } = useGigsStore();
  const { professorId } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    area_of_study: '',
    technologies: '',
    target_type: '',
    paper_type: '',
    timeline: '',
    year_requirement: '',
    cgpa_requirement: '',
    funded: false,
    candidate_count: 1,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorId) {
      console.error('Professor ID not found');
      return;
    }
    await createGig({
      ...formData,
      professor_id: professorId,
    });
    navigate('/professor/gigs/open');
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Gig</h1>
        <p className="mt-2 text-sm text-gray-600">
          Fill in the details for your research project
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-xl p-8 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Enter a descriptive title for your project"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
            placeholder="Provide a detailed description of the research project, objectives, and expected outcomes..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="area_of_study" className="block text-sm font-semibold text-gray-700 mb-2">
              Area of Study *
            </label>
            <input
              type="text"
              id="area_of_study"
              name="area_of_study"
              value={formData.area_of_study}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="e.g., Machine Learning, Bioinformatics"
              required
            />
          </div>

          <div>
            <label htmlFor="technologies" className="block text-sm font-semibold text-gray-700 mb-2">
              Technologies Required
            </label>
            <input
              type="text"
              id="technologies"
              name="technologies"
              value={formData.technologies}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="e.g., Python, TensorFlow, React"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="target_type" className="block text-sm font-semibold text-gray-700 mb-2">
              Target Type
            </label>
            <select
              id="target_type"
              name="target_type"
              value={formData.target_type}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
            >
              <option value="">Select target type...</option>
              <option value="journal">Journal</option>
              <option value="conference">Conference</option>
              <option value="survey">Survey</option>
              <option value="workshop">Workshop</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="paper_type" className="block text-sm font-semibold text-gray-700 mb-2">
              Paper Type
            </label>
            <select
              id="paper_type"
              name="paper_type"
              value={formData.paper_type}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
            >
              <option value="">Select paper type...</option>
              <option value="research">Research</option>
              <option value="review">Review</option>
              <option value="survey">Survey</option>
              <option value="case-study">Case Study</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="timeline" className="block text-sm font-semibold text-gray-700 mb-2">
            Estimated Timeline
          </label>
          <input
            type="text"
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleInputChange}
            className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., 6 months, 1 year"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="year_requirement" className="block text-sm font-semibold text-gray-700 mb-2">
              Year Requirement
            </label>
            <input
              type="text"
              id="year_requirement"
              name="year_requirement"
              value={formData.year_requirement}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="e.g., 3rd year and above"
            />
          </div>

          <div>
            <label htmlFor="cgpa_requirement" className="block text-sm font-semibold text-gray-700 mb-2">
              CGPA Requirement
            </label>
            <input
              type="text"
              id="cgpa_requirement"
              name="cgpa_requirement"
              value={formData.cgpa_requirement}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="e.g., 3.5 and above"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="candidate_count" className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Candidates
            </label>
            <input
              type="number"
              id="candidate_count"
              name="candidate_count"
              value={formData.candidate_count}
              onChange={handleInputChange}
              min="1"
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center pt-8">
            <input
              type="checkbox"
              id="funded"
              name="funded"
              checked={formData.funded}
              onChange={handleInputChange}
              className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="funded" className="ml-3 block text-sm font-medium text-gray-700">
              This project is funded
            </label>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creating...' : 'Create Gig'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/professor/gigs/open')}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGig;
