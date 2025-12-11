import React, { useEffect, useState } from 'react';
import { useProfessorStore } from '../../store/professorStore';
import { useAuthStore } from '../../store/authStore';

const Profile: React.FC = () => {
  const { professor, fetchProfile, updateProfile, loading } = useProfessorStore();
  const { professorId } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    email: '',
    college_name: '',
    qualification: '',
    research_areas: '',
    experience_years: 0,
    previous_publications: '',
  });

  useEffect(() => {
    if (professorId) fetchProfile(professorId);
  }, [professorId, fetchProfile]);

  useEffect(() => {
    if (professor) {
      setFormData({
        name: professor.name || '',
        department: professor.department || '',
        email: professor.email || '',
        college_name: professor.college_name || '',
        qualification: professor.qualification || '',
        research_areas: professor.research_areas || '',
        experience_years: professor.experience_years || 0,
        previous_publications: professor.previous_publications || '',
      });
    }
  }, [professor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience_years' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (professorId) {
      await updateProfile(professorId, formData);
      setIsEditing(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!professor) return <div className="text-center text-gray-500 mt-8">No profile found</div>;

  const initials = professor.name
    ? professor.name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Professor Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">College/University Name</label>
            <input
              type="text"
              name="college_name"
              value={formData.college_name}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Research Areas</label>
            <textarea
              name="research_areas"
              value={formData.research_areas}
              onChange={handleInputChange}
              rows={4}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Publications</label>
            <textarea
              name="previous_publications"
              value={formData.previous_publications}
              onChange={handleInputChange}
              rows={4}
              placeholder="List your publications (one per line or comma-separated)"
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition"
          >
            Save Changes
          </button>
        </form>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 bg-gray-50 flex items-center">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{professor.name}</h2>
                <p className="text-sm text-gray-500">{professor.college_name || professor.department}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Department</h3>
                  <p className="mt-1 text-base text-gray-900">{professor.department}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Email</h3>
                  <p className="mt-1 text-base text-gray-900 truncate">{professor.email}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">College / University</h3>
                  <p className="mt-1 text-base text-gray-900">{professor.college_name || '—'}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Qualification</h3>
                  <p className="mt-1 text-base text-gray-900">{professor.qualification || '—'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Research Areas</h3>
                  <p className="mt-1 text-base text-gray-900 whitespace-pre-wrap">{professor.research_areas || '—'}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Years of Experience</h3>
                  <p className="mt-1 text-base text-gray-900">{professor.experience_years ?? '—'}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Previous Publications</h3>
                  <p className="mt-1 text-base text-gray-900 whitespace-pre-wrap">{professor.previous_publications || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
