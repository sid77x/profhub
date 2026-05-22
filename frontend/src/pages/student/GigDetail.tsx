import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { applicationsApi } from '../../api/applications';
import toast from 'react-hot-toast';
import { X, Check } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

const GigDetail: React.FC = () => {
  const { id } = useParams();
  const { studentId } = useAuthStore();
  const navigate = useNavigate();
  const [gig, setGig] = useState<any>(null);
  const [professor, setProfessor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [showIneligibleModal, setShowIneligibleModal] = useState(false);
  const [formData, setFormData] = useState({ student_name: '', student_email: '', student_year: '', student_cgpa: '', student_previous_publications: '', resume_link: '', cover_letter: '' });

  useEffect(() => { if (!studentId) { navigate('/student/login'); return; } loadPageData(); }, [id, studentId]);

  const loadPageData = async () => {
    setLoading(true);
    try { await Promise.all([fetchGig(), fetchStudentData(), checkExistingApplication()]); }
    finally { setLoading(false); }
  };

  const checkExistingApplication = async () => {
    if (!id || !studentId) return;
    try { const result = await applicationsApi.checkApplicationExists(id, studentId); setHasApplied(result.has_applied); setExistingApplication(result.application); } catch {}
  };

  const fetchGig = async () => {
    try { const r = await axios.get(`${API_URL}/gigs/${id}`); setGig(r.data); if (r.data.professor_id) fetchProfessor(r.data.professor_id); }
    catch { toast.error('Failed to load gig'); }
  };

  const fetchProfessor = async (professorId: string) => {
    try { const r = await axios.get(`${API_URL}/professors/${professorId}`); setProfessor(r.data); } catch {}
  };

  const fetchStudentData = async () => {
    try { const r = await axios.get(`${API_URL}/students/${studentId}`); setFormData(prev => ({ ...prev, student_name: r.data.name, student_email: r.data.email, student_year: r.data.year.toString(), student_cgpa: r.data.cgpa?.toString() || '', student_previous_publications: r.data.previous_publications || '', resume_link: r.data.resume_url || '' })); } catch {}
  };

  // Parse CGPA requirement (e.g., "7.5 and above" -> 7.5)
  const parseCgpaRequirement = (requirement: string): number | null => {
    if (!requirement) return null;
    const match = requirement.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  };

  // Check if student is eligible based on CGPA
  const isEligible = (): boolean => {
    if (!gig?.cgpa_requirement || !formData.student_cgpa) return true;
    const requiredCgpa = parseCgpaRequirement(gig.cgpa_requirement);
    const studentCgpa = parseFloat(formData.student_cgpa);
    if (requiredCgpa === null) return true;
    return studentCgpa >= requiredCgpa;
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check CGPA eligibility
    if (!isEligible()) {
      setShowIneligibleModal(true);
      return;
    }
    
    setApplying(true);
    try {
      const response = await axios.post(`${API_URL}/applications`, { gig_id: id, student_id: studentId, ...formData });
      setHasApplied(true); setExistingApplication(response.data);
      toast.success('Application submitted!');
    } catch (error: any) { toast.error(error.response?.data?.detail || 'Failed to submit'); }
    finally { setApplying(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary" /></div>;
  if (!gig) return <div className="text-center text-muted-foreground mt-8">Gig not found</div>;

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all";
  const statusColors: Record<string, string> = { accepted: 'bg-success/15 text-success', rejected: 'bg-destructive/15 text-destructive', pending: 'bg-warning/15 text-warning' };

  return (
    <div>
      {professor && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl shadow-lg p-6 mb-6 text-white" style={{ background: 'var(--gradient-primary)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-80 mb-1">Posted by</p>
              <h2 className="text-2xl font-extrabold mb-2">{professor.name}</h2>
              <div className="flex items-center gap-4 text-sm opacity-80">
                <span>{professor.department}</span>
                {professor.college_name && <span>{professor.college_name}</span>}
                {professor.experience_years && <span>{professor.experience_years} years</span>}
              </div>
            </div>
            <Link to={`/professor-profile/${professor.id}`} className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition font-semibold text-sm">
              View Profile
            </Link>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl shadow-lg p-8 mb-6 border border-border">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-extrabold text-card-foreground">{gig.title}</h1>
            {gig.funded && <span className="px-4 py-2 bg-success/15 text-success font-bold rounded-full">Funded</span>}
        </div>
        <div className="mb-6"><h3 className="font-bold text-foreground mb-2">Description</h3><p className="text-muted-foreground whitespace-pre-line">{gig.description}</p></div>
        <div className="mb-6">
          <h3 className="font-bold text-foreground mb-3">Project Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Area of Study', value: gig.area_of_study },
              gig.technologies && { label: 'Technologies', value: gig.technologies },
              gig.target_type && { label: 'Target Type', value: gig.target_type },
              gig.paper_type && { label: 'Paper Type', value: gig.paper_type },
              gig.timeline && { label: 'Timeline', value: gig.timeline },
              gig.candidate_count && { label: 'Positions', value: gig.candidate_count },
            ].filter(Boolean).map((item: any) => (
              <div key={item.label} className="bg-muted/50 p-4 rounded-xl">
                <p className="text-sm font-semibold text-muted-foreground mb-1">{item.label}</p>
                <p className="text-foreground font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        {(gig.year_requirement || gig.cgpa_requirement) && (
          <div>
            <h3 className="font-bold text-foreground mb-3">Eligibility</h3>
            <div className="grid grid-cols-2 gap-4">
              {gig.year_requirement && <div className="bg-primary/5 p-4 rounded-xl"><p className="text-sm font-semibold text-primary mb-1">Year</p><p className="text-foreground">{gig.year_requirement}</p></div>}
              {gig.cgpa_requirement && (
                <div className={`p-4 rounded-xl ${isEligible() ? 'bg-primary/5' : 'bg-destructive/10 border border-destructive/30'}`}>
                  <p className={`text-sm font-semibold mb-1 ${isEligible() ? 'text-primary' : 'text-destructive'}`}>CGPA</p>
                  <p className="text-foreground">{gig.cgpa_requirement}</p>
                  {!isEligible() && formData.student_cgpa && (
                    <p className="text-xs text-destructive mt-2">Your CGPA: {formData.student_cgpa} (Below requirement)</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl shadow-lg p-8 border border-border">
        {hasApplied ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-success" /></div>
            <h2 className="text-2xl font-extrabold text-card-foreground mb-2">Application Submitted</h2>
            <p className="text-muted-foreground mb-4">You've already applied to this gig</p>
            <span className={`px-4 py-2 text-sm font-bold rounded-full ${statusColors[existingApplication?.status] || statusColors.pending}`}>
              {existingApplication?.status?.toUpperCase()}
            </span>
            <div className="mt-6">
              <Link to="/student/gigs" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary-glow shadow-glow font-bold transition-all">
                 Browse Other Gigs
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-card-foreground mb-6">Apply for this Gig</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-foreground mb-1.5">Name</label><input type="text" value={formData.student_name} onChange={(e) => setFormData({...formData, student_name: e.target.value})} className={inputClass} required /></div>
                <div><label className="block text-sm font-semibold text-foreground mb-1.5">Email</label><input type="email" value={formData.student_email} onChange={(e) => setFormData({...formData, student_email: e.target.value})} className={inputClass} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-foreground mb-1.5">Year</label><input type="text" value={formData.student_year} onChange={(e) => setFormData({...formData, student_year: e.target.value})} className={inputClass} /></div>
                <div><label className="block text-sm font-semibold text-foreground mb-1.5">CGPA</label><input type="text" value={formData.student_cgpa} onChange={(e) => setFormData({...formData, student_cgpa: e.target.value})} className={inputClass} /></div>
              </div>
              <div><label className="block text-sm font-semibold text-foreground mb-1.5">Resume Link</label><input type="url" value={formData.resume_link} onChange={(e) => setFormData({...formData, resume_link: e.target.value})} className={inputClass} placeholder="https://..." required /></div>
              <div><label className="block text-sm font-semibold text-foreground mb-1.5">Cover Letter</label><textarea value={formData.cover_letter} onChange={(e) => setFormData({...formData, cover_letter: e.target.value})} className={`${inputClass} resize-none`} rows={6} placeholder="Why are you interested?" /></div>
              <button type="submit" disabled={applying} className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary-glow shadow-glow font-bold disabled:opacity-50 transition-all">
                 {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </>
        )}
      </motion.div>

      {/* Ineligibility Modal */}
      {showIneligibleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-destructive/15 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-destructive" />
              </div>
              <button
                onClick={() => setShowIneligibleModal(false)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl font-extrabold text-card-foreground mb-3">Not Eligible</h2>
            <p className="text-muted-foreground mb-6">
              Sorry, you don't meet the CGPA requirement for this gig.
            </p>

            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">CGPA Requirement</p>
              <p className="text-lg font-bold text-destructive">{gig?.cgpa_requirement}</p>
              <p className="text-sm text-muted-foreground mt-2">Your CGPA: <span className="font-semibold">{formData.student_cgpa}</span></p>
            </div>

            <button
              onClick={() => setShowIneligibleModal(false)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary-glow shadow-glow font-bold transition-all"
            >
              Explore Other Gigs
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GigDetail;
