import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGigsStore } from '../../store/gigsStore';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, CheckCircle, Pause, BookOpen, Clock, Users, X } from 'lucide-react';

const OpenGigs: React.FC = () => {
  const navigate = useNavigate();
  const { gigs, fetchGigs, closeGig, holdGig, loading } = useGigsStore();
  const { professorId } = useAuthStore();
  const [selectedGig, setSelectedGig] = useState<number | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [closeData, setCloseData] = useState({ publication_link: '', publication_venue: '' });
  const [holdReason, setHoldReason] = useState('');

  useEffect(() => {
    if (professorId) {
      fetchGigs(professorId);
    }
  }, [professorId, fetchGigs]);

  const openGigs = gigs.filter((g) => g.status === 'open');

  const handleClose = async () => {
    if (selectedGig) {
      await closeGig(selectedGig, closeData);
      setShowCloseModal(false);
      setSelectedGig(null);
      setCloseData({ publication_link: '', publication_venue: '' });
    }
  };

  const handleHold = async () => {
    if (selectedGig && holdReason) {
      await holdGig(selectedGig, { paused_reason: holdReason });
      setShowHoldModal(false);
      setSelectedGig(null);
      setHoldReason('');
    }
  };

  return (
    <div className="px-4 py-8 sm:px-0 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Open Gigs</h1>
          <p className="text-gray-600">Manage your active research opportunities</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/professor/gigs/create')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Gig
        </motion.button>
      </motion.div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col justify-center items-center h-64"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your gigs...</p>
        </motion.div>
      ) : openGigs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-16 text-center border-2 border-gray-100"
        >
          <BookOpen className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-bold text-gray-700 mb-3">No open gigs found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Get started by creating your first research opportunity and connect with talented students</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {openGigs.map((gig, index) => (
              <motion.div
                key={gig.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 mr-2">
                    {gig.title}
                  </h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                    Active
                  </span>
                </div>

                <p className="text-gray-600 mb-5 line-clamp-2 text-sm leading-relaxed">{gig.description}</p>

                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-3 text-sm bg-blue-50/50 hover:bg-blue-50 p-2.5 rounded-xl transition-colors">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Area of Study</p>
                      <p className="font-bold text-gray-900 text-sm">{gig.area_of_study}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm bg-purple-50/50 hover:bg-purple-50 p-2.5 rounded-xl transition-colors">
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Timeline</p>
                      <p className="font-bold text-gray-900 text-sm">{gig.timeline || 'Flexible'}</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ x: 2 }}
                    onClick={() => navigate(`/professor/gigs/${gig.id}/applications`)}
                    className="flex items-center gap-3 text-sm w-full bg-indigo-50/50 hover:bg-indigo-50 p-2.5 rounded-xl transition-colors group"
                  >
                    <div className="bg-indigo-500 p-2 rounded-lg">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-gray-500 font-medium">Applications</p>
                      <p className="font-bold text-indigo-600 group-hover:underline text-sm">View All →</p>
                    </div>
                  </motion.button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(`/professor/gigs/edit/${gig.id}`)}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3 py-2.5 rounded-xl text-xs font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedGig(gig.id);
                      setShowCloseModal(true);
                    }}
                    className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-3 py-2.5 rounded-xl text-xs font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Close
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedGig(gig.id);
                      setShowHoldModal(true);
                    }}
                    className="bg-gradient-to-br from-amber-500 to-amber-600 text-white px-3 py-2.5 rounded-xl text-xs font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Hold
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Close Modal */}
      <AnimatePresence>
        {showCloseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCloseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-emerald-100 p-4 rounded-2xl">
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Close Gig</h3>
                  <p className="text-gray-600 text-sm">Provide publication details</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Publication Venue</label>
                  <input
                    type="text"
                    value={closeData.publication_venue}
                    onChange={(e) => setCloseData({ ...closeData, publication_venue: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                    placeholder="e.g., IEEE Conference 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Publication Link</label>
                  <input
                    type="url"
                    value={closeData.publication_link}
                    onChange={(e) => setCloseData({ ...closeData, publication_link: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowCloseModal(false);
                    setSelectedGig(null);
                  }}
                  className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all"
                >
                  Close Gig
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hold Modal */}
      <AnimatePresence>
        {showHoldModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowHoldModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-amber-100 p-4 rounded-2xl">
                  <Pause className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Put On Hold</h3>
                  <p className="text-gray-600 text-sm">Provide a reason for pausing</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Reason</label>
                <textarea
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all outline-none resize-none"
                  placeholder="Why is this gig being put on hold?"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowHoldModal(false);
                    setSelectedGig(null);
                  }}
                  className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleHold}
                  disabled={!holdReason}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-bold hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Put On Hold
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OpenGigs;
