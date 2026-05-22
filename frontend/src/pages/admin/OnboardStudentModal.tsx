import React, { useState } from 'react';
import { X, Eye } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:8000/api';

interface OnboardStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}

const OnboardStudentModal: React.FC<OnboardStudentModalProps> = ({ isOpen, onClose, onSuccess, token }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    year: '',
    cgpa: '',
    registration_number: '',
    college_name: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.year || !formData.cgpa || !formData.registration_number || !formData.college_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        ...formData,
        year: parseInt(formData.year),
        cgpa: parseFloat(formData.cgpa)
      };
      
      await axios.post(`${API_URL}/admin/students/onboard`, payload, { headers });
      toast.success('Student onboarded successfully');
      setFormData({
        name: '',
        email: '',
        password: '',
        year: '',
        cgpa: '',
        registration_number: '',
        college_name: ''
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to onboard student');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Onboard Student</h2>
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
              placeholder="student@university.edu"
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
            <label className="block text-sm font-medium mb-1">Registration Number *</label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
              placeholder="CS2021001"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Year *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
                placeholder="2"
                min="1"
                max="4"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CGPA *</label>
              <input
                type="number"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
                placeholder="8.5"
                step="0.1"
                min="0"
                max="10"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">College Name *</label>
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

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Onboarding...' : 'Onboard Student'}
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

export default OnboardStudentModal;
