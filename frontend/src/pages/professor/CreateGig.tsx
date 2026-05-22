import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGigsStore } from '../../store/gigsStore';
import { useAuthStore } from '../../store/authStore';

const CreateGig: React.FC = () => {
  const navigate = useNavigate();
  const { createGig, loading } = useGigsStore();
  const { professorId } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '', description: '', area_of_study: '', technologies: '', target_type: '',
    paper_type: '', timeline: '', year_requirement: '', cgpa_requirement: '',
    funded: false, candidate_count: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorId) return;
    await createGig({ ...formData, professor_id: professorId });
    navigate('/professor/gigs/open');
  };

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all";
  const labelClass = "block text-sm font-semibold text-foreground mb-1.5";

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-extrabold text-foreground">Create New Gig</h1>
        <p className="mt-2 text-muted-foreground">Fill in the details for your research project</p>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-lg">
        <div>
            <label className={labelClass}>Project Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} className={inputClass} placeholder="Enter a descriptive title" required />
        </div>

        <div>
          <label className={labelClass}>Description *</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className={`${inputClass} resize-none`} placeholder="Provide a detailed description..." required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Area of Study *</label>
            <input type="text" name="area_of_study" value={formData.area_of_study} onChange={handleInputChange} className={inputClass} placeholder="e.g., Machine Learning" required />
          </div>
          <div>
            <label className={labelClass}>Technologies Required</label>
            <input type="text" name="technologies" value={formData.technologies} onChange={handleInputChange} className={inputClass} placeholder="e.g., Python, TensorFlow" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Target Type</label>
            <select name="target_type" value={formData.target_type} onChange={handleInputChange} className={inputClass}>
              <option value="">Select target type...</option>
              <option value="journal">Journal</option>
              <option value="conference">Conference</option>
              <option value="survey">Survey</option>
              <option value="workshop">Workshop</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Paper Type</label>
            <select name="paper_type" value={formData.paper_type} onChange={handleInputChange} className={inputClass}>
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
          <label className={labelClass}>Estimated Timeline</label>
          <input type="text" name="timeline" value={formData.timeline} onChange={handleInputChange} className={inputClass} placeholder="e.g., 6 months" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Year Requirement</label>
            <input type="text" name="year_requirement" value={formData.year_requirement} onChange={handleInputChange} className={inputClass} placeholder="e.g., 3rd year and above" />
          </div>
          <div>
            <label className={labelClass}>CGPA Requirement (0-10 scale)</label>
            <input type="text" name="cgpa_requirement" value={formData.cgpa_requirement} onChange={handleInputChange} className={inputClass} placeholder="e.g., 7.5 and above" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Number of Candidates</label>
            <input type="number" name="candidate_count" value={formData.candidate_count} onChange={handleInputChange} min="1" className={inputClass} />
          </div>
          <div className="flex items-center pt-8">
            <input type="checkbox" id="funded" name="funded" checked={formData.funded} onChange={handleInputChange} className="h-5 w-5 text-primary focus:ring-ring border-input rounded" />
            <label htmlFor="funded" className="ml-3 text-sm font-medium text-foreground">This project is funded</label>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-glow shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {loading ? 'Creating...' : 'Create Gig'}
          </button>
          <button type="button" onClick={() => navigate('/professor/gigs/open')}
            className="flex-1 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 border border-border transition-all">
            Cancel
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default CreateGig;
