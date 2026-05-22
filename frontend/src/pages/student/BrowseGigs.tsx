import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Search, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:8000/api';

interface Gig { id: string; title: string; description: string; status: string; professor_id: string; area_of_study: string; technologies?: string; timeline?: string; year_requirement?: string; cgpa_requirement?: string; candidate_count?: number; funded?: boolean; }
interface Professor { id: string; name: string; department: string; college_name?: string; }

const BrowseGigs: React.FC = () => {
  const { studentId } = useAuthStore();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [professors, setProfessors] = useState<{[key: string]: Professor}>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { if (!studentId) { navigate('/student/login'); return; } fetchGigs(); }, [studentId, navigate]);

  const fetchGigs = async () => {
    try {
      const response = await axios.get(`${API_URL}/gigs?status=open`);
      setGigs(response.data);
      const professorIds = Array.from(new Set(response.data.map((g: Gig) => g.professor_id))) as string[];
      const professorData: {[key: string]: Professor} = {};
      await Promise.all(professorIds.map(async (profId) => {
        try { const r = await axios.get(`${API_URL}/professors/${profId}`); professorData[profId] = r.data; } catch {}
      }));
      setProfessors(professorData);
    } catch { toast.error('Failed to load gigs'); }
    finally { setLoading(false); }
  };

  const filteredGigs = gigs.filter((g) =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) || g.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary" /></div>;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-extrabold text-foreground mb-4">Browse Gigs</h1>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <input type="text" placeholder="Search gigs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus-ring shadow-sm" />
        </div>
      </motion.div>

      {filteredGigs.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-lg p-12 text-center border border-border">
          <Briefcase className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No gigs found</h3>
          <p className="text-muted-foreground">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredGigs.map((gig, i) => (
            <motion.div key={gig.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl shadow-md p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all">
              {professors[gig.professor_id] && (
                <div className="mb-4 pb-4 border-b border-border">
                  <p className="text-xs text-muted-foreground mb-1">Posted by</p>
                  <h4 className="font-bold text-card-foreground">{professors[gig.professor_id].name}</h4>
                  <p className="text-sm text-muted-foreground">{professors[gig.professor_id].department}</p>
                  {professors[gig.professor_id].college_name && <p className="text-xs text-muted-foreground">{professors[gig.professor_id].college_name}</p>}
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-card-foreground">{gig.title}</h3>
                {gig.funded && <span className="px-3 py-1 bg-success/15 text-success text-sm font-bold rounded-full">Funded</span>}
              </div>
              <p className="text-muted-foreground mb-4 line-clamp-2">{gig.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div><span className="font-semibold text-foreground">Area:</span> <span className="text-muted-foreground">{gig.area_of_study}</span></div>
                {gig.technologies && <div><span className="font-semibold text-foreground">Tech:</span> <span className="text-muted-foreground">{gig.technologies}</span></div>}
                {gig.timeline && <div><span className="font-semibold text-foreground">Timeline:</span> <span className="text-muted-foreground">{gig.timeline}</span></div>}
                {gig.candidate_count && <div><span className="font-semibold text-foreground">Positions:</span> <span className="text-muted-foreground">{gig.candidate_count}</span></div>}
              </div>
              <div className="flex justify-end">
                <Link to={`/student/gigs/${gig.id}`} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary-glow shadow-glow font-semibold transition-all">
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseGigs;
