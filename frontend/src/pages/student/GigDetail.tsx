import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { applicationsApi } from '../../api/applications';
import toast from 'react-hot-toast';

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
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    student_year: '',
    student_cgpa: '',
    resume_link: '',
    cover_letter: '',
  });

  useEffect(() => {
    if (!studentId) {
      navigate('/student/login');
      return;
    }
    loadPageData();
  }, [id, studentId]);

  const loadPageData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchGig(),
        fetchStudentData(),
        checkExistingApplication()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    if (!id || !studentId) return;
    try {
      const result = await applicationsApi.checkApplicationExists(id, studentId);
      console.log('Application check result:', result);
      setHasApplied(result.has_applied);
      setExistingApplication(result.application);
    } catch (error) {
      console.error('Failed to check application status:', error);
    }
  };

  const fetchGig = async () => {
    try {
      const response = await axios.get(`${API_URL}/gigs/${id}`);
      setGig(response.data);
      // Fetch professor data
      if (response.data.professor_id) {
        fetchProfessor(response.data.professor_id);
      }
    } catch (error) {
      toast.error('Failed to load gig');
    }
  };

  const fetchProfessor = async (professorId: string) => {
    try {
      const response = await axios.get(`${API_URL}/professors/${professorId}`);
      setProfessor(response.data);
    } catch (error) {
      console.error('Failed to load professor data');
    }
  };

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/${studentId}`);
      setFormData(prev => ({
        ...prev,
        student_name: response.data.name,
        student_email: response.data.email,
        student_year: response.data.year.toString(),
        resume_link: response.data.resume_url || '',
      }));
    } catch (error) {
      console.error('Failed to load student data');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);

    try {
      const response = await axios.post(`${API_URL}/applications`, {
        gig_id: id,
        student_id: studentId,
        ...formData,
      });
      
      // Update local state immediately
      setHasApplied(true);
      setExistingApplication(response.data);
      
      toast.success('Application submitted successfully!');
      // Don't navigate away, let them see the success message
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!gig) {
    return <div className="flex items-center justify-center h-screen">Gig not found</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
        {/* Professor Info */}
        {professor && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-100 mb-1">Posted by</p>
                <h2 className="text-2xl font-bold mb-2">{professor.name}</h2>
                <div className="flex items-center gap-4 text-sm text-indigo-100">
                  <span>📚 {professor.department}</span>
                  {professor.college_name && <span>🏛️ {professor.college_name}</span>}
                  {professor.experience_years && <span>👨‍🏫 {professor.experience_years} years exp.</span>}
                </div>
                {professor.research_areas && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-indigo-100 mb-1">Research Areas:</p>
                    <p className="text-white">{professor.research_areas}</p>
                  </div>
                )}
              </div>
              <Link
                to={`/professor-profile/${professor.id}`}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium text-sm"
              >
                View Profile
              </Link>
            </div>
          </div>
        )}

        {/* Gig Details */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{gig.title}</h1>
            {gig.funded && (
              <span className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-full">
                💰 Funded Position
              </span>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">{gig.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Project Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">Area of Study</p>
                <p className="text-gray-900">{gig.area_of_study}</p>
              </div>
              
              {gig.technologies && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Technologies</p>
                  <p className="text-gray-900">{gig.technologies}</p>
                </div>
              )}
              
              {gig.target_type && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Target Type</p>
                  <p className="text-gray-900">{gig.target_type}</p>
                </div>
              )}
              
              {gig.paper_type && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Paper Type</p>
                  <p className="text-gray-900">{gig.paper_type}</p>
                </div>
              )}
              
              {gig.timeline && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Timeline</p>
                  <p className="text-gray-900">{gig.timeline}</p>
                </div>
              )}
              
              {gig.candidate_count && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Positions Available</p>
                  <p className="text-gray-900">{gig.candidate_count}</p>
                </div>
              )}
            </div>
          </div>

          {(gig.year_requirement || gig.cgpa_requirement) && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Eligibility Requirements</h3>
              <div className="grid grid-cols-2 gap-4">
                {gig.year_requirement && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-blue-700 mb-1">Year Requirement</p>
                    <p className="text-gray-900">{gig.year_requirement}</p>
                  </div>
                )}
                
                {gig.cgpa_requirement && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-blue-700 mb-1">CGPA Requirement</p>
                    <p className="text-gray-900">{gig.cgpa_requirement}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {hasApplied ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Already Submitted</h2>
              <p className="text-gray-600 mb-4">You have already applied to this gig</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Status:</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  existingApplication?.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  existingApplication?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {existingApplication?.status?.toUpperCase()}
                </span>
              </div>
              <div className="mt-6">
                <Link
                  to="/student/gigs"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Browse Other Gigs
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for this Gig</h2>

              <form onSubmit={handleApply} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.student_name}
                  onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.student_email}
                  onChange={(e) => setFormData({...formData, student_email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                <input
                  type="text"
                  value={formData.student_year}
                  onChange={(e) => setFormData({...formData, student_year: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CGPA</label>
                <input
                  type="text"
                  value={formData.student_cgpa}
                  onChange={(e) => setFormData({...formData, student_cgpa: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Resume Link</label>
              <input
                type="url"
                value={formData.resume_link}
                onChange={(e) => setFormData({...formData, resume_link: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter</label>
              <textarea
                value={formData.cover_letter}
                onChange={(e) => setFormData({...formData, cover_letter: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                rows={6}
                placeholder="Why are you interested in this gig?"
              />
            </div>

            <button
              type="submit"
              disabled={applying}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
            </>
          )}
        </div>
    </div>
  );
};

export default GigDetail;
