import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:8000/api';

interface Application {
  id: string;
  gig_id: string;
  status: string;
  applied_at: string;
  gig: {
    title: string;
    description: string;
    status: string;
  } | null;
}

const getStudentVisibleStatus = (app: Application): string => {
  if (!app.gig) return 'gig cancelled';
  if (app.gig.status === 'on-hold') return 'gig put on hold';
  if (app.gig.status === 'closed' && app.status === 'pending') return 'gig cancelled';
  return app.status;
};

const StudentDashboard: React.FC = () => {
  const { studentId } = useAuthStore();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!studentId) {
      navigate('/student/login');
      return;
    }
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    fetchData();
  }, [studentId, navigate]);

  const fetchData = async () => {
    const [studentRes, appsRes] = await Promise.allSettled([
      axios.get(`${API_URL}/students/${studentId}`),
      axios.get(`${API_URL}/students/${studentId}/applications`),
    ]);

    if (studentRes.status === 'fulfilled') {
      setStudent(studentRes.value.data);
    } else {
      toast.error('Failed to load profile details');
    }

    if (appsRes.status === 'fulfilled') {
      setApplications(appsRes.value.data);
    } else {
      toast.error('Failed to load applications');
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const firstName = student?.name?.trim()?.split(/\s+/)?.[0] || 'Student';
  const metaBits = [
    student?.department ? student.department : null,
    student?.year ? `Year ${student.year}` : null,
    student?.cgpa !== null && student?.cgpa !== undefined ? `CGPA: ${student.cgpa}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="px-4 py-6 sm:px-0">
        {/* Welcome Section */}
        <div className="rounded-2xl shadow-xl p-8 mb-6 text-primary-foreground relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
                {student?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div>
                <h2 className="text-3xl font-bold">
                  Welcome back, {firstName}!
                </h2>
                {metaBits.length > 0 ? (
                  <p className="text-primary-foreground/90 text-lg flex items-center gap-2 mt-1">
                    {metaBits.map((bit, idx) => (
                      <React.Fragment key={bit}>
                        {idx > 0 && <span>•</span>}
                        <span>{bit}</span>
                      </React.Fragment>
                    ))}
                  </p>
                ) : (
                  <p className="text-primary-foreground/90 text-lg mt-1">Complete your profile to see details here.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-card-foreground">Recent Applications</h3>
            {applications.length > 0 && (
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                {applications.length} Total
              </span>
            )}
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-4">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg text-muted-foreground font-medium">No applications yet. Start browsing gigs!</p>
              <button
                onClick={() => navigate('/student/gigs')}
                className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
              >
                Browse Gigs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/student/gigs/${app.gig_id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/student/gigs/${app.gig_id}`);
                    }
                  }}
                  className="border-2 border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-card cursor-pointer"
                >
                  {(() => {
                    const visibleStatus = getStudentVisibleStatus(app);
                    return (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-card-foreground mb-2">
                        {app.gig?.title || 'Gig Unavailable'}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold ${
                        visibleStatus === 'accepted'
                          ? 'bg-success/10 text-success ring-2 ring-success/20'
                          : visibleStatus === 'rejected' || visibleStatus === 'gig cancelled'
                          ? 'bg-destructive/10 text-destructive ring-2 ring-destructive/20'
                          : visibleStatus === 'gig put on hold'
                          ? 'bg-warning/10 text-warning ring-2 ring-warning/20'
                          : 'bg-warning/10 text-warning ring-2 ring-warning/20'
                      }`}
                    >
                      {visibleStatus.toUpperCase()}
                    </span>
                  </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default StudentDashboard;
