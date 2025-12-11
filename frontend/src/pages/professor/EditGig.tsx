import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGigsStore } from '../../store/gigsStore';

const EditGig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentGig, fetchGig, updateGig, loading } = useGigsStore();

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

  useEffect(() => {
    if (id) {
      fetchGig(id);
    }
  }, [id, fetchGig]);

  useEffect(() => {
    if (currentGig) {
      setFormData({
        title: currentGig.title,
        description: currentGig.description,
        area_of_study: currentGig.area_of_study,
        technologies: currentGig.technologies || '',
        target_type: currentGig.target_type || '',
        paper_type: currentGig.paper_type || '',
        timeline: currentGig.timeline || '',
        year_requirement: currentGig.year_requirement || '',
        cgpa_requirement: currentGig.cgpa_requirement || '',
        funded: currentGig.funded,
        candidate_count: currentGig.candidate_count || 1,
      });
    }
  }, [currentGig]);

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
    if (id) {
      await updateGig(parseInt(id), formData);
      navigate('/professor/gigs/open');
    }
  };

  if (loading && !currentGig) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Gig</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update the details for your research project
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Project Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="area_of_study" className="block text-sm font-medium text-gray-700">
              Area of Study *
            </label>
            <input
              type="text"
              id="area_of_study"
              name="area_of_study"
              value={formData.area_of_study}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="technologies" className="block text-sm font-medium text-gray-700">
              Technologies Required
            </label>
            <input
              type="text"
              id="technologies"
              name="technologies"
              value={formData.technologies}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="target_type" className="block text-sm font-medium text-gray-700">
              Target Type
            </label>
            <select
              id="target_type"
              name="target_type"
              value={formData.target_type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select...</option>
              <option value="journal">Journal</option>
              <option value="conference">Conference</option>
              <option value="survey">Survey</option>
              <option value="workshop">Workshop</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="paper_type" className="block text-sm font-medium text-gray-700">
              Paper Type
            </label>
            <select
              id="paper_type"
              name="paper_type"
              value={formData.paper_type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select...</option>
              <option value="research">Research</option>
              <option value="review">Review</option>
              <option value="survey">Survey</option>
              <option value="case-study">Case Study</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">
            Estimated Timeline
          </label>
          <input
            type="text"
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="year_requirement" className="block text-sm font-medium text-gray-700">
              Year Requirement
            </label>
            <input
              type="text"
              id="year_requirement"
              name="year_requirement"
              value={formData.year_requirement}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="cgpa_requirement" className="block text-sm font-medium text-gray-700">
              CGPA Requirement
            </label>
            <input
              type="text"
              id="cgpa_requirement"
              name="cgpa_requirement"
              value={formData.cgpa_requirement}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="candidate_count" className="block text-sm font-medium text-gray-700">
              Number of Candidates
            </label>
            <input
              type="number"
              id="candidate_count"
              name="candidate_count"
              value={formData.candidate_count}
              onChange={handleInputChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="funded"
              name="funded"
              checked={formData.funded}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="funded" className="ml-2 block text-sm text-gray-900">
              This project is funded
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Gig'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/professor/gigs/open')}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGig;
