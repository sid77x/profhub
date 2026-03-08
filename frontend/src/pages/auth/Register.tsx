import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../../api/auth';
import ThemeToggle from '../../components/ThemeToggle';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    department: '', college_name: '', qualification: '', userType: 'professor',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match!'); return; }
    setLoading(true);
    try {
      await authApi.register({
        name: formData.name, email: formData.email, password: formData.password,
        department: formData.department, college_name: formData.college_name, qualification: formData.qualification,
      });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all sm:text-sm";

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-bold text-lg">RC</span>
          </div>
        </div>
        <h1 className="text-center text-3xl font-extrabold gradient-text mb-2">Join ResearchConnect</h1>
        <h2 className="text-center text-lg font-semibold text-foreground mb-1">Create your professor account 🎓</h2>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="font-semibold text-primary hover:text-primary-glow">Sign in</button>
          {' · '}
          <button onClick={() => navigate('/student/register')} className="font-semibold text-secondary hover:opacity-80">Student Registration</button>
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-strong rounded-2xl p-8 shadow-xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3">
                <span className="text-destructive text-lg">⚠️</span>
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Dr. John Doe" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="john.doe@university.edu" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">College/University</label>
              <input type="text" value={formData.college_name} onChange={(e) => setFormData({ ...formData, college_name: e.target.value })} className={inputClass} placeholder="e.g., MIT, Stanford" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Department</label>
                <input type="text" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className={inputClass} placeholder="Computer Science" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Qualification</label>
                <input type="text" required value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className={inputClass} placeholder="Ph.D." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass} placeholder="Enter password" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
              <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className={inputClass} placeholder="Confirm password" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary-glow shadow-glow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
              {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" /> Creating Account...</> : 'Create Account →'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
