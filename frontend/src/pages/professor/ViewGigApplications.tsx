import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useGigsStore } from '../../store/gigsStore';
import { applicationsApi } from '../../api/applications';
import { Application } from '../../types/application';

const ViewGigApplications: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentGig, fetchGig } = useGigsStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => { if (id) { fetchGig(id); loadApplications(); } }, [id, fetchGig]);

  const loadApplications = async () => {
    if (!id) return;
    try { const data = await applicationsApi.getGigApplications(id); setApplications(data); }
    catch { alert('Failed to load applications.'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    setUpdatingStatus(applicationId);
    try {
      setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status: status as Application['status'] } : app));
      await applicationsApi.updateApplicationStatus(applicationId, status);
    } catch (error: any) {
      alert(`Failed: ${error.response?.data?.detail || error.message}`);
      loadApplications();
    } finally { setUpdatingStatus(null); }
  };

  const statusColors: Record<string, string> = {
    accepted: 'bg-success/15 text-success',
    rejected: 'bg-destructive/15 text-destructive',
    pending: 'bg-warning/15 text-warning',
  };

  if (!currentGig) return <div className="flex justify-center items-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <button onClick={() => navigate('/professor/gigs/open')}
          className="text-primary hover:text-primary-glow mb-4 font-semibold flex items-center gap-2 group transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Open Gigs
        </button>
        <h1 className="text-4xl font-extrabold text-foreground mb-3">{currentGig.title}</h1>
        <p className="text-lg text-muted-foreground">{currentGig.description}</p>
      </div>

      <div className="bg-card shadow-lg rounded-2xl p-8 border border-border">
        <h2 className="text-2xl font-bold text-card-foreground mb-6">Applications ({applications.length}) 📋</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary" /></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-xl text-muted-foreground font-semibold">No applications yet</p>
            <p className="text-muted-foreground/70 mt-2">Check back later for student applications 📬</p>
          </div>
        ) : (
          <div className="space-y-5">
            {applications.map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all bg-card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {app.student_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground">{app.student_name}</h3>
                        <p className="text-sm text-muted-foreground">{app.student_email}</p>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${statusColors[app.status] || statusColors.pending} ml-auto`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {app.student_year && <div className="bg-primary/5 rounded-xl p-3"><p className="text-xs text-primary font-semibold mb-1">YEAR</p><p className="text-lg font-bold text-card-foreground">{app.student_year}</p></div>}
                      {app.student_cgpa && <div className="bg-secondary/5 rounded-xl p-3"><p className="text-xs text-secondary font-semibold mb-1">CGPA</p><p className="text-lg font-bold text-card-foreground">{app.student_cgpa}</p></div>}
                    </div>

                    {app.cover_letter && (
                      <div className="mt-4 bg-muted/50 rounded-xl p-4 border-l-4 border-primary">
                        <p className="text-sm font-bold text-card-foreground mb-2">Cover Letter</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{app.cover_letter}</p>
                      </div>
                    )}

                    {app.student_previous_publications && (
                      <div className="mt-4 bg-secondary/5 rounded-xl p-4 border-l-4 border-secondary">
                        <p className="text-sm font-bold text-card-foreground mb-2">Previous Publications / Research Experience</p>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{app.student_previous_publications}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4">
                      <a href={app.resume_link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:bg-primary-glow shadow-glow font-semibold transition-all">
                        <FileText className="w-4 h-4" /> View Resume
                      </a>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> Applied {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {app.status === 'pending' && (
                    <div className="ml-4 flex flex-col gap-3">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusUpdate(app.id, 'accepted')} disabled={updatingStatus === app.id}
                        className="px-5 py-2.5 bg-success text-success-foreground text-sm font-bold rounded-xl shadow-md hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2">
                        {updatingStatus === app.id ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-success-foreground border-t-transparent" /> : <CheckCircle className="w-4 h-4" />} Accept
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusUpdate(app.id, 'rejected')} disabled={updatingStatus === app.id}
                        className="px-5 py-2.5 bg-destructive text-destructive-foreground text-sm font-bold rounded-xl shadow-md hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2">
                        {updatingStatus === app.id ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-destructive-foreground border-t-transparent" /> : <XCircle className="w-4 h-4" />} Reject
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewGigApplications;
