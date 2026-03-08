import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGigsStore } from '../../store/gigsStore';

const EditGig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentGig, fetchGig, updateGig, loading } = useGigsStore();

  const [formData, setFormData] = useState({
    title: '', description: '', area_of_study: '', technologies: '', target_type: '',
    paper_type: '', timeline: '', year_requirement: '', cgpa_requirement: '',
    funded: false, candidate_count: 1,
  });

  useEffect(() => { if (id) fetchGig(id); }, [id, fetchGig]);
  useEffect(() => {
    if (currentGig) {
      setFormData({
        title: currentGig.title, description: currentGig.description, area_of_study: currentGig.area_of_study,
        technologies: currentGig.technologies || '', target_type: currentGig.target_type || '',
        paper_type: currentGig.paper_type || '', timeline: currentGig.timeline || '',
        year_requirement: currentGig.year_requirement || '', cgpa_requirement: currentGig.cgpa_requirement || '',
        funded: currentGig.funded, candidate_count: currentGig.candidate_count || 1,
      });
    }
  }, [currentGig]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) { await updateGig(id, formData); navigate('/professor/gigs/open'); }
  };

  if (loading && !currentGig) return <div className="flex justify-center items-center h-64 text-muted-foreground">Loading...</div>;

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all";
  const labelClass = "block text-sm font-semibold text-foreground mb-1.5";

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-extrabold text-foreground">Edit Gig ✏️</h1>
        <p className="mt-2 text-muted-foreground">Update the details for your research project</p>
      </motion.div>

      <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-lg">
        <div><label className={labelClass}>Project Title *</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} className={inputClass} required /></div>
        <div><label className={labelClass}>Description *</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className={`${inputClass} resize-none`} required /></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className={labelClass}>Area of Study *</label><input type="text" name="area_of_study" value={formData.area_of_study} onChange={handleInputChange} className={inputClass} required /></div>
          <div><label className={labelClass}>Technologies</label><input type="text" name="technologies" value={formData.technologies} onChange={handleInputChange} className={inputClass} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className={labelClass}>Target Type</label>
            <select name="target_type" value={formData.target_type} onChange={handleInputChange} className={inputClass}>
              <option value="">Select...</option><option value="journal">Journal</option><option value="conference">Conference</option><option value="survey">Survey</option><option value="workshop">Workshop</option><option value="other">Other</option>
            </select>
          </div>
          <div><label className={labelClass}>Paper Type</label>
            <select name="paper_type" value={formData.paper_type} onChange={handleInputChange} className={inputClass}>
              <option value="">Select...</option><option value="research">Research</option><option value="review">Review</option><option value="survey">Survey</option><option value="case-study">Case Study</option><option value="other">Other</option>
            </select>
          </div>
        </div>

        <div><label className={labelClass}>Timeline</label><input type="text" name="timeline" value={formData.timeline} onChange={handleInputChange} className={inputClass} /></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className={labelClass}>Year Requirement</label><input type="text" name="year_requirement" value={formData.year_requirement} onChange={handleInputChange} className={inputClass} /></div>
          <div><label className={labelClass}>CGPA Requirement</label><input type="text" name="cgpa_requirement" value={formData.cgpa_requirement} onChange={handleInputChange} className={inputClass} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className={labelClass}>Candidates</label><input type="number" name="candidate_count" value={formData.candidate_count} onChange={handleInputChange} min="1" className={inputClass} /></div>
          <div className="flex items-center pt-8">
            <input type="checkbox" id="funded" name="funded" checked={formData.funded} onChange={handleInputChange} className="h-5 w-5 text-primary focus:ring-ring border-input rounded" />
            <label htmlFor="funded" className="ml-3 text-sm font-medium text-foreground">💰 Funded project</label>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-glow shadow-glow disabled:opacity-50 transition-all">
            {loading ? 'Updating...' : 'Update Gig ✨'}
          </button>
          <button type="button" onClick={() => navigate('/professor/gigs/open')} className="flex-1 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 border border-border transition-all">Cancel</button>
        </div>
      </motion.form>
    </div>
  );
};

export default EditGig;
