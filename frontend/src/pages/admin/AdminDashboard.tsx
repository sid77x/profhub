import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, BookOpen, FileText, BarChart3, Trash2, Search, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import OnboardProfessorModal from './OnboardProfessorModal';
import OnboardStudentModal from './OnboardStudentModal';

const API_URL = 'http://localhost:8000/api';

interface Stats {
  total_professors: number;
  total_students: number;
  total_gigs: number;
  total_applications: number;
  open_gigs: number;
  closed_gigs: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
}

interface Professor {
  id: string;
  name: string;
  email: string;
  department: string;
  gigs_posted: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  registration_number: string;
  cgpa: number;
  applications_submitted: number;
}

interface Gig {
  id: string;
  title: string;
  professor_name: string;
  status: string;
  applications_count: number;
}

interface Application {
  id: string;
  student_name: string;
  gig_title: string;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'professors' | 'students' | 'gigs' | 'applications'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnboardProfModal, setShowOnboardProfModal] = useState(false);
  const [showOnboardStudentModal, setShowOnboardStudentModal] = useState(false);

  const adminName = localStorage.getItem('admin_name');
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/profhub');
      return;
    }
    loadData();
  }, [token, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, profsRes, studsRes, gigsRes, appsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers }),
        axios.get(`${API_URL}/admin/professors`, { headers }),
        axios.get(`${API_URL}/admin/students`, { headers }),
        axios.get(`${API_URL}/admin/gigs`, { headers }),
        axios.get(`${API_URL}/admin/applications`, { headers })
      ]);

      setStats(statsRes.data);
      setProfessors(profsRes.data);
      setStudents(studsRes.data);
      setGigs(gigsRes.data);
      setApplications(appsRes.data);
    } catch (error: any) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfessor = async (profId: string) => {
    if (!window.confirm('Are you sure? This will delete all their gigs and applications.')) return;
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/admin/professors/${profId}`, { headers });
      toast.success('Professor deboarded');
      loadData();
    } catch (error) {
      toast.error('Failed to delete professor');
    }
  };

  const handleDeleteStudent = async (studId: string) => {
    if (!window.confirm('Are you sure? This will delete their applications.')) return;
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/admin/students/${studId}`, { headers });
      toast.success('Student deboarded');
      loadData();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_id');
    localStorage.removeItem('admin_name');
    navigate('/profhub');
  };

  const filteredProfessors = professors.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGigs = gigs.filter(g =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {adminName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { id: 'professors' as const, label: 'Professors', icon: Users },
            { id: 'students' as const, label: 'Students', icon: Users },
            { id: 'gigs' as const, label: 'Gigs', icon: BookOpen },
            { id: 'applications' as const, label: 'Applications', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Total Professors', value: stats.total_professors, icon: '👨‍🏫' },
                { label: 'Total Students', value: stats.total_students, icon: '👨‍🎓' },
                { label: 'Total Gigs', value: stats.total_gigs, icon: '📚' },
                { label: 'Open Gigs', value: stats.open_gigs, icon: '🔓' },
                { label: 'Closed Gigs', value: stats.closed_gigs, icon: '🔒' },
                { label: 'Total Applications', value: stats.total_applications, icon: '📄' },
                { label: 'Pending Applications', value: stats.pending_applications, icon: '⏳' },
                { label: 'Approved Applications', value: stats.approved_applications, icon: '✅' },
                { label: 'Rejected Applications', value: stats.rejected_applications, icon: '❌' }
              ].map((stat, i) => (
                <div key={i} className="bg-card rounded-lg p-6 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <span className="text-4xl">{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Professors Tab */}
        {activeTab === 'professors' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search professors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-input rounded-lg"
                />
              </div>
              <button
                onClick={() => setShowOnboardProfModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-glow transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Onboard Professor
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Department</th>
                    <th className="text-left py-3 px-4 font-semibold">Gigs</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfessors.map(prof => (
                    <tr key={prof.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">{prof.name}</td>
                      <td className="py-3 px-4">{prof.email}</td>
                      <td className="py-3 px-4">{prof.department}</td>
                      <td className="py-3 px-4">{prof.gigs_posted}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteProfessor(prof.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Deboard
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-input rounded-lg"
                />
              </div>
              <button
                onClick={() => setShowOnboardStudentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Onboard Student
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Reg No</th>
                    <th className="text-left py-3 px-4 font-semibold">CGPA</th>
                    <th className="text-left py-3 px-4 font-semibold">Applications</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(stud => (
                    <tr key={stud.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">{stud.name}</td>
                      <td className="py-3 px-4">{stud.email}</td>
                      <td className="py-3 px-4">{stud.registration_number}</td>
                      <td className="py-3 px-4">{stud.cgpa.toFixed(2)}</td>
                      <td className="py-3 px-4">{stud.applications_submitted}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteStudent(stud.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Deboard
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Gigs Tab */}
        {activeTab === 'gigs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-4">
              {filteredGigs.map(gig => (
                <div key={gig.id} className="bg-card rounded-lg p-4 border border-border flex items-start justify-between hover:border-primary/50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold">{gig.title}</h3>
                    <p className="text-sm text-muted-foreground">Professor: {gig.professor_name}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary">{gig.status}</span>
                      <span className="text-muted-foreground">{gig.applications_count} applications</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Student</th>
                    <th className="text-left py-3 px-4 font-semibold">Gig Title</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">{app.student_name}</td>
                      <td className="py-3 px-4">{app.gig_title}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          app.status === 'approved' ? 'bg-green-100 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Modals */}
        <OnboardProfessorModal
          isOpen={showOnboardProfModal}
          onClose={() => setShowOnboardProfModal(false)}
          onSuccess={loadData}
          token={token}
        />
        <OnboardStudentModal
          isOpen={showOnboardStudentModal}
          onClose={() => setShowOnboardStudentModal(false)}
          onSuccess={loadData}
          token={token}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
