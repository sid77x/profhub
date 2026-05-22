import React, { useState } from 'react';
import { X, Eye } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:8000/api';

interface OnboardProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}

const OnboardProfessorModal: React.FC<OnboardProfessorModalProps> = ({ isOpen, onClose, onSuccess, token }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    qualification: '',
    college_name: '',
    research_areas: '',
    experience_years: '',
    previous_publications: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.department || !formData.qualification) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined
      };
      
      await axios.post(`${API_URL}/admin/professors/onboard`, payload, { headers });
      toast.success('Professor onboarded successfully');
      setFormData({
        name: '',
        email: '',
        password: '',
        department: '',
        qualification: '',
        college_name: '',
        research_areas: '',
        experience_years: '',
        previous_publications: ''
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to onboard professor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Onboard Professor</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
              placeholder="Full name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
              placeholder="email@university.edu"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 bg-muted border border-input rounded-lg text-sm"
                placeholder="Set password"
                disabled={loading}
              />
              <button
                type="button"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department *</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
              placeholder="Computer Science"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Qualification *</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
              placeholder="PhD"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">College Name</label>
            <input
              type="text"
              name="college_name"
              value={formData.college_name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
              placeholder="University name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Research Areas</label>
            <textarea
              name="research_areas"
              value={formData.research_areas}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
              placeholder="AI, Machine Learning"
              rows={2}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Experience (years)</label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
              placeholder="5"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Previous Publications</label>
            <textarea
              name="previous_publications"
              value={formData.previous_publications}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
              placeholder="List publications"
              rows={2}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-glow disabled:opacity-50"
            >
              {loading ? 'Onboarding...' : 'Onboard Professor'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardProfessorModal;
