import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../../components/ThemeToggle';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authApi.login(formData);
      const payload = JSON.parse(atob(response.access_token.split('.')[1]));
      setAuth(response.access_token, payload.id || response.professor_id, 'professor');
      navigate('/professor/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-bold text-lg">RC</span>
          </div>
        </div>
        <h1 className="text-center text-3xl font-extrabold gradient-text mb-2">ResearchConnect</h1>
        <h2 className="text-center text-xl font-bold text-foreground mb-1">Welcome back, Professor!</h2>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')} className="font-semibold text-primary hover:text-primary-glow transition-colors">
            Create one
          </button>
          {' · '}
          <button onClick={() => navigate('/student/login')} className="font-semibold text-secondary hover:opacity-80 transition-colors">
            Student Login
          </button>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="glass-strong rounded-2xl p-8 shadow-xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3"
              >
                <span className="text-destructive text-lg">!</span>
                <p className="text-sm text-destructive font-medium">{error}</p>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
              <input
                id="email" type="email" autoComplete="email" required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all sm:text-sm"
                placeholder="professor@university.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-12 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  aria-label="Press and hold to show password"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="w-4 h-4 rounded border-input text-primary focus:ring-ring" />
                Remember me
              </label>
              <a href="#" className="text-sm font-semibold text-primary hover:text-primary-glow transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary-glow shadow-glow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" /> Signing in...</>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
