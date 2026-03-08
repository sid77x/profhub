import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../../components/ThemeToggle';

const API_URL = 'http://localhost:8000/api';

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/students/login`, formData);
      setAuth(response.data.access_token, response.data.student_id, 'student');
      toast.success('Welcome back! 🎉');
      navigate('/student/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl shadow-xl w-full max-w-md p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shadow-glow">
              <span className="text-2xl">🎓</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Student Login</h1>
          <p className="text-muted-foreground">Sign in to find your next research adventure 🚀</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all"
              placeholder="your.email@university.edu" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all"
              placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-secondary-foreground bg-secondary hover:opacity-90 shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2">
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-secondary-foreground border-t-transparent" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/student/register" className="text-secondary font-semibold hover:opacity-80">Create one</Link>
          {' · '}
          <Link to="/login" className="text-primary font-semibold hover:text-primary-glow">Professor Login</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLogin;
