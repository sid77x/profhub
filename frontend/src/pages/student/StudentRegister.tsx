import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../../components/ThemeToggle';
import { manipalColleges, manipalDepartmentsByCollege } from '../../data/manipal';
import { studentAuthApi } from '../../api/studentAuth';

const API_URL = 'http://localhost:8000/api';

const StudentRegister: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [googleProfile, setGoogleProfile] = useState<{ email: string; name: string; google_uid: string; photo_url?: string; id_token?: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', reg_no: '', department: '', year: '', cgpa: '', college_name: '',
  });

  const isGoogleFlow = new URLSearchParams(location.search).get('google') === '1';

  useEffect(() => {
    if (!isGoogleFlow) return;

    const pendingProfileRaw = sessionStorage.getItem('student_google_profile');
    const routeProfile = location.state as { email?: string; name?: string; google_uid?: string; photo_url?: string; id_token?: string } | null;
    if (routeProfile?.google_uid) {
      setGoogleProfile(routeProfile as { email: string; name: string; google_uid: string; photo_url?: string; id_token?: string });
      setFormData((prev) => ({
        ...prev,
        name: routeProfile.name || prev.name,
        email: routeProfile.email || prev.email,
      }));
      return;
    }

    if (!pendingProfileRaw) return;

    try {
      const pendingProfile = JSON.parse(pendingProfileRaw);
      setGoogleProfile(pendingProfile);
      setFormData((prev) => ({
        ...prev,
        name: pendingProfile.name || prev.name,
        email: pendingProfile.email || prev.email,
      }));
    } catch {
      sessionStorage.removeItem('student_google_profile');
    }
  }, [isGoogleFlow, location.state]);

  const selectedCollege = manipalColleges.find((college) => college.value === formData.college_name);
  const departmentOptions = formData.college_name ? (manipalDepartmentsByCollege[formData.college_name] || []) : [];

  const validateStudentEmail = (_email: string): boolean => {
    return true;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError('');

    setLoading(true);
    try {
      await axios.post(`${API_URL}/students/register/request-otp`, {
        ...formData,
        college_name: selectedCollege?.label || formData.college_name,
        year: parseInt(formData.year),
        cgpa: parseFloat(formData.cgpa),
      });
      setOtpSent(true);
      toast.success('OTP sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/students/register/verify-otp`, { email: formData.email, otp });
      const loginResponse = await axios.post(`${API_URL}/students/login`, { email: formData.email, password: formData.password });
      setAuth(loginResponse.data.access_token, loginResponse.data.student_id, 'student');
      navigate('/student/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'OTP verification failed');
    } finally { setLoading(false); }
  };

  const handleGoogleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!googleProfile?.google_uid) {
      toast.error('Google sign-in details were not found. Please sign in again.');
      navigate('/student/login');
      return;
    }

    if (!formData.name || !formData.email || !formData.reg_no || !formData.department || !formData.year || !formData.cgpa || !formData.college_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await studentAuthApi.googleRegister({
        name: formData.name,
        email: formData.email,
        google_uid: googleProfile.google_uid,
        reg_no: formData.reg_no,
        department: formData.department,
        year: parseInt(formData.year),
        cgpa: parseFloat(formData.cgpa),
        college_name: formData.college_name,
        previous_publications: '',
        photo_url: googleProfile.photo_url,
      });

      const accessToken = googleProfile.id_token || 'firebase-google-auth';
      setAuth(accessToken, response.id, 'student');
      sessionStorage.removeItem('student_google_profile');
      toast.success('Profile completed successfully');
      navigate('/student/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCollege = e.target.value;
    const nextDepartments = manipalDepartmentsByCollege[nextCollege] || [];
    const nextDepartment = nextDepartments.length === 1 ? nextDepartments[0] : '';
    setFormData((prev) => ({ ...prev, college_name: nextCollege, department: nextDepartment }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData((prev) => ({ ...prev, email }));
    setEmailError('');
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
              <span className="text-2xl"></span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">{isGoogleFlow ? 'Complete Your Profile' : 'Student Registration'}</h1>
          <p className="text-muted-foreground">
            {isGoogleFlow
              ? 'Fill in your academic details to finish creating your student profile.'
              : 'Join ResearchConnect to find amazing research opportunities'}
          </p>
        </div>

        <form onSubmit={isGoogleFlow ? handleGoogleCompleteRegistration : (otpSent ? handleVerifyOtp : handleSendOtp)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
              <input type="text" name="name" required disabled={otpSent} value={formData.name} onChange={handleChange} className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Registration Number</label>
              <input type="text" name="reg_no" required disabled={otpSent} value={formData.reg_no} onChange={handleChange} className={inputClass} placeholder="2021BCS001" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
            <input type="email" name="email" required disabled={otpSent || isGoogleFlow} value={formData.email} onChange={handleEmailChange} className={inputClass} placeholder="student@example.com" />
            {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
          </div>

          {!isGoogleFlow && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
              <input type="password" name="password" required disabled={otpSent} value={formData.password} onChange={handleChange} className={inputClass} placeholder="••••••••" />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">College/University</label>
            <select
              name="college_name"
              required
              disabled={otpSent}
              value={formData.college_name}
              onChange={handleCollegeChange}
              className={inputClass}
            >
              <option value="">Select College/University</option>
              {manipalColleges.map((college) => (
                <option key={college.value} value={college.value}>{college.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Department</label>
              <select
                name="department"
                required
                disabled={otpSent || !formData.college_name}
                value={formData.department}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">{formData.college_name ? 'Select Department' : 'Select college first'}</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Year</label>
              <select name="year" required disabled={otpSent} value={formData.year} onChange={handleChange} className={inputClass}>
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
              <input type="number" name="cgpa" required disabled={otpSent} value={formData.cgpa} onChange={handleChange} className={inputClass} placeholder="7.50" min="0" max="10" step="0.01" />
            </div>
          </div>

          {!isGoogleFlow && otpSent && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">OTP</label>
              <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className={inputClass} placeholder="Enter 5-digit OTP" />
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-secondary-foreground bg-secondary hover:opacity-90 shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2">
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-2 border-secondary-foreground border-t-transparent" /> {isGoogleFlow ? 'Completing Profile...' : otpSent ? 'Verifying OTP...' : 'Sending OTP...'}</>
            ) : (isGoogleFlow ? 'Complete Registration' : otpSent ? 'Verify OTP' : 'Send OTP')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isGoogleFlow ? (
            <button
              type="button"
              onClick={() => navigate('/student/login')}
              className="text-secondary font-semibold hover:opacity-80"
            >
              Back to Google login
            </button>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/student/login" className="text-secondary font-semibold hover:opacity-80">Sign in</Link>
              {' · '}
              <Link to="/login" className="text-primary font-semibold hover:text-primary-glow">Professor Login</Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentRegister;
