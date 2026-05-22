import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useProfessorStore } from '../../store/professorStore';
import { useAuthStore } from '../../store/authStore';

const Profile: React.FC = () => {
  const { professor, fetchProfile, updateProfile, loading } = useProfessorStore();
  const { professorId } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', department: '', email: '', college_name: '', qualification: '',
    research_areas: '', experience_years: 0, previous_publications: '',
  });

  useEffect(() => { if (professorId) fetchProfile(professorId); }, [professorId, fetchProfile]);
  useEffect(() => {
    if (professor) {
      setFormData({
        name: professor.name || '', department: professor.department || '', email: professor.email || '',
        college_name: professor.college_name || '', qualification: professor.qualification || '',
        research_areas: professor.research_areas || '', experience_years: professor.experience_years || 0,
        previous_publications: professor.previous_publications || '',
      });
    }
  }, [professor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'experience_years' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (professorId) { await updateProfile(professorId, formData); setIsEditing(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-muted-foreground">Loading...</div>;
  if (!professor) return <div className="text-center text-muted-foreground mt-8">No profile found</div>;

  const initials = professor.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '';
  const inputClass = "w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all";

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-foreground">Professor Profile</h1>
        <button onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${isEditing ? 'bg-muted text-foreground hover:bg-muted/80' : 'bg-primary text-primary-foreground hover:bg-primary-glow shadow-glow'}`}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-5 shadow-lg">
          {[
            { label: 'Name', name: 'name', type: 'text' },
            { label: 'Department', name: 'department', type: 'text' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'College/University', name: 'college_name', type: 'text' },
            { label: 'Qualification', name: 'qualification', type: 'text' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-foreground mb-1.5">{field.label}</label>
              <input type={field.type} name={field.name} value={(formData as any)[field.name]} onChange={handleInputChange} className={inputClass} required={['name','department','email'].includes(field.name)} />
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Research Areas</label>
            <textarea name="research_areas" value={formData.research_areas} onChange={handleInputChange} rows={4} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Years of Experience</label>
            <input type="number" name="experience_years" value={formData.experience_years} onChange={handleInputChange} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Previous Publications</label>
            <textarea name="previous_publications" value={formData.previous_publications} onChange={handleInputChange} rows={4} className={inputClass} placeholder="List your publications" />
          </div>

          <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-glow shadow-glow transition-all">
            Save Changes
          </button>
        </motion.form>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 bg-muted/50 flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground text-xl font-bold shadow-glow">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-card-foreground">{professor.name}</h2>
              <p className="text-sm text-muted-foreground">{professor.college_name || professor.department}</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Department', value: professor.department },
              { label: 'Email', value: professor.email },
              { label: 'College / University', value: professor.college_name || '—' },
              { label: 'Qualification', value: professor.qualification || '—' },
              { label: 'Research Areas', value: professor.research_areas || '—' },
              { label: 'Years of Experience', value: professor.experience_years ?? '—' },
              { label: 'Previous Publications', value: professor.previous_publications || '—' },
            ].map((item) => (
              <div key={item.label}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</h3>
                <p className="mt-1 text-foreground whitespace-pre-wrap">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
