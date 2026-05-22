import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import ThemeToggle from '../../components/ThemeToggle';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await authApi.requestForgotPasswordOtp(email);
      setStage('otp');
      toast.success('OTP sent to your email');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, new_password: newPassword, confirm_password: confirmPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all sm:text-sm";

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-primary hover:text-primary-glow transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-semibold">Back to Login</span>
        </button>

        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-bold text-lg">RC</span>
          </div>
        </div>
        
        <h1 className="text-center text-3xl font-extrabold gradient-text mb-2">Reset Password</h1>
        <p className="text-center text-sm text-muted-foreground">
          {stage === 'email' && 'Enter your email to receive an OTP'}
          {stage === 'otp' && 'Enter the OTP and your new password'}
          {stage === 'reset' && 'Create your new password'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="glass-strong rounded-2xl p-8 shadow-xl">
          <form className="space-y-5" onSubmit={stage === 'email' ? handleRequestOtp : handleVerifyOtpAndReset}>
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

            {stage === 'email' && (
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="professor@university.edu"
                  disabled={loading}
                />
              </div>
            )}

            {(stage === 'otp' || stage === 'reset') && (
              <>
                <div>
                  <label htmlFor="email-display" className="block text-sm font-semibold text-foreground mb-1.5">
                    Email
                  </label>
                  <input
                    id="email-display"
                    type="email"
                    value={email}
                    disabled
                    className={`${inputClass} opacity-50`}
                  />
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-foreground mb-1.5">
                    OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={inputClass}
                    placeholder="Enter 5-digit OTP"
                    maxLength={5}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-semibold text-foreground mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-12 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all sm:text-sm disabled:opacity-50"
                      placeholder="Enter new password"
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

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-semibold text-foreground mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-12 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all sm:text-sm disabled:opacity-50"
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onMouseDown={() => setShowConfirmPassword(true)}
                      onMouseUp={() => setShowConfirmPassword(false)}
                      onMouseLeave={() => setShowConfirmPassword(false)}
                      onTouchStart={() => setShowConfirmPassword(true)}
                      onTouchEnd={() => setShowConfirmPassword(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary-glow shadow-glow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  {stage === 'email' ? 'Sending OTP...' : 'Resetting Password...'}
                </>
              ) : stage === 'email' ? 'Send OTP' : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
