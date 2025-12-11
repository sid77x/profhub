import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:8000/api';

interface Gig {
  id: string;
  title: string;
  description: string;
  status: string;
  professor_id: string;
  area_of_study: string;
  technologies?: string;
  timeline?: string;
  year_requirement?: string;
  cgpa_requirement?: string;
  candidate_count?: number;
  funded?: boolean;
}

interface Professor {
  id: string;
  name: string;
  department: string;
  college_name?: string;
}

const BrowseGigs: React.FC = () => {
  const { studentId } = useAuthStore();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [professors, setProfessors] = useState<{[key: string]: Professor}>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!studentId) {
      navigate('/student/login');
      return;
    }
    fetchGigs();
  }, [studentId, navigate]);

  const fetchGigs = async () => {
    try {
      const response = await axios.get(`${API_URL}/gigs?status=open`);
      setGigs(response.data);
      
      // Fetch professor info for each gig
      const professorIds = [...new Set(response.data.map((gig: Gig) => gig.professor_id))];
      const professorData: {[key: string]: Professor} = {};
      
      await Promise.all(
        professorIds.map(async (profId) => {
          try {
            const profResponse = await axios.get(`${API_URL}/professors/${profId}`);
            professorData[profId] = profResponse.data;
          } catch (error) {
            console.error(`Failed to load professor ${profId}`);
          }
        })
      );
      
      setProfessors(professorData);
    } catch (error) {
      toast.error('Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = gigs.filter((gig) =>
    gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gig.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search gigs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Gigs List */}
        {filteredGigs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No gigs found</h3>
            <p className="text-gray-600">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredGigs.map((gig) => (
              <div key={gig.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                {/* Professor Info */}
                {professors[gig.professor_id] && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Posted by</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{professors[gig.professor_id].name}</h4>
                        <p className="text-sm text-gray-600">{professors[gig.professor_id].department}</p>
                        {professors[gig.professor_id].college_name && (
                          <p className="text-xs text-gray-500">{professors[gig.professor_id].college_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{gig.title}</h3>
                  {gig.funded && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      Funded
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{gig.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Area:</span>
                    <span className="text-gray-600 ml-2">{gig.area_of_study}</span>
                  </div>
                  {gig.technologies && (
                    <div>
                      <span className="font-semibold text-gray-700">Tech:</span>
                      <span className="text-gray-600 ml-2">{gig.technologies}</span>
                    </div>
                  )}
                  {gig.timeline && (
                    <div>
                      <span className="font-semibold text-gray-700">Timeline:</span>
                      <span className="text-gray-600 ml-2">{gig.timeline}</span>
                    </div>
                  )}
                  {gig.year_requirement && (
                    <div>
                      <span className="font-semibold text-gray-700">Year:</span>
                      <span className="text-gray-600 ml-2">{gig.year_requirement}</span>
                    </div>
                  )}
                  {gig.cgpa_requirement && (
                    <div>
                      <span className="font-semibold text-gray-700">CGPA:</span>
                      <span className="text-gray-600 ml-2">{gig.cgpa_requirement}</span>
                    </div>
                  )}
                  {gig.candidate_count && (
                    <div>
                      <span className="font-semibold text-gray-700">Positions:</span>
                      <span className="text-gray-600 ml-2">{gig.candidate_count}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Link
                    to={`/student/gigs/${gig.id}`}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default BrowseGigs;
