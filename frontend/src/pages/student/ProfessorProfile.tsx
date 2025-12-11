import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, Building2, GraduationCap, BookOpen, Award, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:8000/api';

interface Professor {
  id: string;
  name: string;
  department: string;
  email: string;
  college_name?: string;
  qualification: string;
  research_areas?: string;
  experience_years?: number;
  previous_publications?: string;
}

const ProfessorProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessor();
  }, [id]);

  const fetchProfessor = async () => {
    try {
      const response = await axios.get(`${API_URL}/professors/${id}`);
      setProfessor(response.data);
    } catch (error) {
      toast.error('Failed to load professor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading professor profile...</p>
        </div>
      </div>
    );
  }

  if (!professor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xl">Professor not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
                {professor.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{professor.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-indigo-100">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    <span>{professor.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>{professor.department}</span>
                  </div>
                  {professor.experience_years && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{professor.experience_years} years experience</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-indigo-600" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <a 
                  href={`mailto:${professor.email}`}
                  className="text-lg text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {professor.email}
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4" />
                  Department
                </p>
                <p className="text-lg text-gray-900">{professor.department}</p>
              </div>
              {professor.college_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4" />
                    Institution
                  </p>
                  <p className="text-lg text-gray-900">{professor.college_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Research Areas */}
          {professor.research_areas && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                Research Areas
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {professor.research_areas}
              </p>
            </div>
          )}

          {/* Academic Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              Academic Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-indigo-700 mb-1">Qualification</p>
                <p className="text-gray-900 font-semibold">{professor.qualification}</p>
              </div>
    
            </div>
            
            {/* Previous Publications within Academic Details */}
            {professor.previous_publications && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-900">Previous Publications</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {professor.previous_publications}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorProfile;
