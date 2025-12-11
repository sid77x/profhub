import React, { useEffect } from 'react';
import { useGigsStore } from '../../store/gigsStore';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, Pause, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { gigs, fetchGigs } = useGigsStore();
  const { professorId } = useAuthStore();

  useEffect(() => {
    // Fetch gigs for logged-in professor
    if (professorId) {
      fetchGigs(professorId);
    }
  }, [professorId, fetchGigs]);

  const openGigs = gigs.filter((g) => g.status === 'open').length;
  const closedGigs = gigs.filter((g) => g.status === 'closed').length;
  const onHoldGigs = gigs.filter((g) => g.status === 'on-hold').length;

  return (
    <div className="px-4 py-8 sm:px-0 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Overview of your research opportunities
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold opacity-90">Open Projects</h3>
            <Briefcase className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{openGigs}</p>
          <div className="mt-3 flex items-center text-sm opacity-80">
            <TrendingUp className="w-4 h-4 mr-1" />
            Active
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold opacity-90">Closed Projects</h3>
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{closedGigs}</p>
          <div className="mt-3 flex items-center text-sm opacity-80">
            <CheckCircle className="w-4 h-4 mr-1" />
            Completed
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold opacity-90">On Hold</h3>
            <Pause className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{onHoldGigs}</p>
          <div className="mt-3 flex items-center text-sm opacity-80">
            <Pause className="w-4 h-4 mr-1" />
            Paused
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        {gigs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg text-gray-500 font-semibold">No gigs yet</p>
            <p className="text-gray-400 mt-2">Create your first research gig to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {gigs.slice(0, 5).map((gig) => (
              <div key={gig.id} className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent rounded-r-lg pl-4 py-3 hover:shadow-md transition-all duration-200">
                <h3 className="font-bold text-gray-900 text-lg">{gig.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Status: <span className={`font-bold px-2 py-1 rounded-full text-xs ${
                    gig.status === 'open' ? 'bg-blue-100 text-blue-700' :
                    gig.status === 'closed' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{gig.status.toUpperCase()}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
