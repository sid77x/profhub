import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../../components/ThemeToggle';

const API_URL = 'http://localhost:8000/api';

const StudentRegister: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', reg_no: '', department: '', year: '', cgpa: '', college_name: '',
  });
  const [idCardImage, setIdCardImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate ID card image
    if (!idCardImage) {
      toast.error('Please upload your ID card photo');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/students/register`, { ...formData, year: parseInt(formData.year), cgpa: parseFloat(formData.cgpa), id_card_image: idCardImage });
      toast.success('Registration successful! 🎉');
      const loginResponse = await axios.post(`${API_URL}/students/login`, { email: formData.email, password: formData.password });
      setAuth(loginResponse.data.access_token, loginResponse.data.student_id, 'student');
      navigate('/student/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setIdCardImage(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all sm:text-sm";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl shadow-xl w-full max-w-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shadow-glow">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Student Registration</h1>
          <p className="text-muted-foreground">Join ResearchConnect to find amazing research opportunities</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Registration Number</label>
              <input type="text" name="reg_no" required value={formData.reg_no} onChange={handleChange} className={inputClass} placeholder="2021BCS001" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="your.email@university.edu" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} className={inputClass} placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">College/University</label>
            <input type="text" name="college_name" value={formData.college_name} onChange={handleChange} className={inputClass} placeholder="XYZ University" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Department</label>
              <input type="text" name="department" required value={formData.department} onChange={handleChange} className={inputClass} placeholder="Computer Science" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Year</label>
              <select name="year" required value={formData.year} onChange={handleChange} className={inputClass}>
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">CGPA (0-10)</label>
              <input type="number" name="cgpa" required value={formData.cgpa} onChange={handleChange} className={inputClass} placeholder="7.50" min="0" max="10" step="0.01" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">ID Card Photo 📸 (Required)</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="id-card-input"
              />
              <label htmlFor="id-card-input" className="cursor-pointer block">
                {imagePreview ? (
                  <div className="space-y-3">
                    <img src={imagePreview} alt="Preview" className="w-full max-h-40 object-cover rounded-lg mx-auto" />
                    <p className="text-sm text-secondary opacity-70">Click to change image</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl mb-2">📷</p>
                    <p className="text-sm font-semibold text-foreground">Click to upload ID card photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 5MB • JPG, PNG, GIF</p>
                  </div>
                )}
              </label>
            </div>
            {!idCardImage && <p className="text-xs text-destructive mt-2">ID card photo is required</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-secondary-foreground bg-secondary hover:opacity-90 shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2">
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-secondary-foreground border-t-transparent" /> Creating account...</> : 'Create Account →'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/student/login" className="text-secondary font-semibold hover:opacity-80">Sign in</Link>
          {' · '}
          <Link to="/login" className="text-primary font-semibold hover:text-primary-glow">Professor Login</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentRegister;
