import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, BookOpen, Calendar, Building2, FileText, Save, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useStudentStore } from '../../store/studentStore';

const StudentProfile: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useAuthStore();
  const { student, fetchStudent, updateStudent } = useStudentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', reg_no: '', department: '', year: '', cgpa: '', college_name: '', bio: '', previous_publications: '', skills: [] as string[], resume_url: '', id_card_image: '' });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => { if (studentId) fetchStudent(studentId); }, [studentId, fetchStudent]);
  useEffect(() => {
    if (student) setFormData({ name: student.name || '', email: student.email || '', reg_no: student.reg_no || '', department: student.department || '', year: String(student.year || ''), cgpa: String(student.cgpa || ''), college_name: student.college_name || '', bio: student.bio || '', previous_publications: student.previous_publications || '', skills: student.skills || [], resume_url: student.resume_url || '', id_card_image: student.id_card_image || '' });
  }, [student]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAddSkill = () => { if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) { setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] }); setSkillInput(''); } };
  const handleRemoveSkill = (s: string) => setFormData({ ...formData, skills: formData.skills.filter(sk => sk !== s) });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, id_card_image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    setLoading(true);
    try {
      const updateData: any = {};
      if (formData.name !== student?.name) updateData.name = formData.name;
      if (formData.department !== student?.department) updateData.department = formData.department;
      if (String(formData.year) !== String(student?.year)) updateData.year = formData.year;
      if (String(formData.cgpa) !== String(student?.cgpa)) updateData.cgpa = parseFloat(formData.cgpa);
      if (formData.college_name !== student?.college_name) updateData.college_name = formData.college_name;
      if (formData.bio !== student?.bio) updateData.bio = formData.bio;
      if (formData.previous_publications !== student?.previous_publications) updateData.previous_publications = formData.previous_publications;
      if (JSON.stringify(formData.skills) !== JSON.stringify(student?.skills)) updateData.skills = formData.skills;
      if (formData.resume_url !== student?.resume_url) updateData.resume_url = formData.resume_url;
      if (formData.id_card_image !== student?.id_card_image) updateData.id_card_image = formData.id_card_image;
      if (!Object.keys(updateData).length) { toast.error('No changes'); setIsEditing(false); return; }
      await updateStudent(studentId, updateData);
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch (error: any) { toast.error(error.response?.data?.detail || 'Failed to update'); }
    finally { setLoading(false); }
  };

  if (!student) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary" /></div>;

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <button onClick={() => { if (isEditing) { setIsEditing(false); if (student) setFormData({ name: student.name||'', email: student.email||'', reg_no: student.reg_no||'', department: student.department||'', year: String(student.year||''), cgpa: String(student.cgpa||''), college_name: student.college_name||'', bio: student.bio||'', previous_publications: student.previous_publications||'', skills: student.skills||[], resume_url: student.resume_url||'', id_card_image: student.id_card_image||'' }); } else setIsEditing(true); }}
          className={`px-6 py-2 rounded-xl font-semibold text-sm transition-all ${isEditing ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground hover:bg-primary-glow shadow-glow'}`}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
        <div className="p-8 text-white" style={{ background: 'var(--gradient-primary)' }}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold">
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold mb-1">{student.name}</h1>
              <p className="opacity-80">{student.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {[
              { label: 'Full Name', name: 'name', icon: User, editable: true, required: true },
              { label: 'Email', name: 'email', icon: Mail, editable: false },
              { label: 'Reg Number', name: 'reg_no', icon: FileText, editable: false },
              { label: 'Department', name: 'department', icon: BookOpen, editable: true, required: true },
              { label: 'Year', name: 'year', icon: Calendar, editable: true, required: true },
              { label: 'CGPA', name: 'cgpa', icon: BookOpen, editable: true, required: true },
              { label: 'College', name: 'college_name', icon: Building2, editable: true, required: true },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  <field.icon className="w-4 h-4 inline mr-1.5" />{field.label}
                </label>
                <input type={field.name === 'cgpa' ? 'number' : 'text'} name={field.name} value={(formData as any)[field.name]} onChange={handleInputChange}
                  disabled={!isEditing || !field.editable} className={inputClass} required={field.required} {...(field.name === 'cgpa' ? { min: '0', max: '10', step: '0.01' } : {})} title={field.name === 'cgpa' ? 'CGPA scale: 0-10' : ''} />
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-1.5">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={!isEditing} rows={4} className={inputClass} placeholder="Tell us about yourself..." />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-1.5">Previous Publications / Research Experience</label>
            <textarea
              name="previous_publications"
              value={formData.previous_publications}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={5}
              className={inputClass}
              placeholder="Add your publications, research internships, labs, or any research-based work experience..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-1.5">Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2">
                  {skill}
                  {isEditing && <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-primary hover:text-destructive">×</button>}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} placeholder="Add a skill" className={`flex-1 ${inputClass}`} />
                <button type="button" onClick={handleAddSkill} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary-glow font-semibold transition-all">Add</button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-1.5">Resume URL</label>
            <input type="url" name="resume_url" value={formData.resume_url} onChange={handleInputChange} disabled={!isEditing} className={inputClass} placeholder="https://drive.google.com/..." />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-1.5">ID Card Photo</label>
            {formData.id_card_image ? (
              <div className="space-y-3">
                <div className="border-2 border-border rounded-xl overflow-hidden bg-muted">
                  <img src={formData.id_card_image} alt="ID Card" className="w-full max-h-64 object-cover" />
                </div>
                {isEditing && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="id-card-edit-input"
                    />
                    <label htmlFor="id-card-edit-input" className="block w-full py-2 px-4 bg-muted border border-border text-center rounded-xl hover:bg-muted/80 cursor-pointer font-semibold text-sm transition-colors">
                      Change Photo
                    </label>
                  </div>
                )}
              </div>
            ) : (
              isEditing && (
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="id-card-upload-input"
                  />
                  <label htmlFor="id-card-upload-input" className="cursor-pointer block">
                    {/* image placeholder removed */}
                    <p className="text-sm font-semibold text-foreground">Click to upload ID card photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 5MB • JPG, PNG, GIF</p>
                  </label>
                </div>
              )
            )}
          </div>

          {isEditing && (
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary-glow shadow-glow font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default StudentProfile;
