import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, Mail, Building2, GraduationCap, BookOpen, Award, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/ThemeToggle';

const API_URL = 'http://localhost:8000/api';

interface Professor { id: string; name: string; department: string; email: string; college_name?: string; qualification: string; research_areas?: string; experience_years?: number; previous_publications?: string; }

const ProfessorProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfessor(); }, [id]);
  const fetchProfessor = async () => {
    try { const r = await axios.get(`${API_URL}/professors/${id}`); setProfessor(r.data); }
    catch { toast.error('Failed to load professor profile'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary" /></div>;
  if (!professor) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center"><p className="text-muted-foreground text-xl mb-4">Professor not found</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary-glow font-semibold">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl shadow-xl overflow-hidden mb-6 text-white" style={{ background: 'var(--gradient-primary)' }}>
          <div className="p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl font-bold">
                {professor.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-extrabold mb-2">{professor.name}</h1>
                <div className="flex flex-wrap items-center gap-4 opacity-80">
                  <div className="flex items-center gap-2"><GraduationCap className="w-5 h-5" />{professor.qualification}</div>
                  <div className="flex items-center gap-2"><BookOpen className="w-5 h-5" />{professor.department}</div>
                  {professor.experience_years && <div className="flex items-center gap-2"><Clock className="w-5 h-5" />{professor.experience_years} years</div>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl shadow-lg p-6 border border-border">
            <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-2"><Mail className="w-6 h-6 text-primary" /> Contact</h2>
            <div className="space-y-3">
              <div><p className="text-sm font-medium text-muted-foreground">Email</p><a href={`mailto:${professor.email}`} className="text-lg text-primary hover:text-primary-glow font-medium">{professor.email}</a></div>
              <div><p className="text-sm font-medium text-muted-foreground">Department</p><p className="text-lg text-foreground">{professor.department}</p></div>
              {professor.college_name && <div><p className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Building2 className="w-4 h-4" /> Institution</p><p className="text-lg text-foreground">{professor.college_name}</p></div>}
            </div>
          </motion.div>

          {professor.research_areas && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl shadow-lg p-6 border border-border">
              <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" /> Research Areas</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{professor.research_areas}</p>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl shadow-lg p-6 border border-border">
            <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-2"><GraduationCap className="w-6 h-6 text-primary" /> Academic Details</h2>
            <div className="bg-primary/5 p-4 rounded-xl mb-4"><p className="text-sm font-semibold text-primary mb-1">Qualification</p><p className="text-foreground font-semibold">{professor.qualification}</p></div>
            {professor.previous_publications && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3"><Award className="w-5 h-5 text-primary" /><h3 className="text-lg font-bold text-card-foreground">Publications</h3></div>
                <div className="bg-muted/50 p-4 rounded-xl"><p className="text-muted-foreground leading-relaxed whitespace-pre-line">{professor.previous_publications}</p></div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorProfile;
