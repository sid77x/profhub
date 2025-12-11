import React, { useEffect, useState } from 'react';
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

const StudentDashboard: React.FC = () => {
  const { studentId } = useAuthStore();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      navigate('/student/login');
      return;
    }
    fetchData();
  }, [studentId, navigate]);

  const fetchData = async () => {
    try {
      const [studentRes, appsRes] = await Promise.all([
        axios.get(`${API_URL}/students/${studentId}`),
        axios.get(`${API_URL}/students/${studentId}/applications`),
      ]);
      setStudent(studentRes.data);
      setApplications(appsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {student?.name || 'Student'}!
          </h2>
          <p className="text-gray-600">
            {student?.department} • Year {student?.year}
          </p>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Applications</h3>
          {applications.length === 0 ? (
            <p className="text-gray-600">No applications yet. Start browsing gigs!</p>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {app.gig?.title || 'Gig Unavailable'}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        app.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default StudentDashboard;
