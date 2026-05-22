import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/ThemeToggle';

const API_URL = 'http://localhost:8000/api';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/admin/login`, {
        email,
        password
      });

      // Store admin token and info
      localStorage.setItem('admin_token', response.data.access_token);
      localStorage.setItem('admin_id', response.data.admin_id);
      localStorage.setItem('admin_name', response.data.admin_name);
      
      toast.success(`Welcome, ${response.data.admin_name}!`);
      navigate('/profhub/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />

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
            <span className="text-primary-foreground font-bold text-lg">⚙️</span>
          </div>
        </div>
        <h1 className="text-center text-3xl font-extrabold gradient-text mb-2">Admin Panel</h1>
        <p className="text-center text-sm text-muted-foreground">
          System administration and management
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
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all sm:text-sm"
                placeholder="admin@profhub.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-12 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all sm:text-sm"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary-glow shadow-glow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>

            <div className="text-center text-xs text-muted-foreground mt-4">
              <p>Default credentials:</p>
              <p>Email: shivli.admin@profhub.com or siddhant.admin@profhub.com</p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
