import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGigsStore } from '../../store/gigsStore';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, CheckCircle, Pause, BookOpen, Clock, Users } from 'lucide-react';

const OpenGigs: React.FC = () => {
  const navigate = useNavigate();
  const { gigs, fetchGigs, closeGig, holdGig, loading } = useGigsStore();
  const { professorId } = useAuthStore();
  const [selectedGig, setSelectedGig] = useState<string | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [closeData, setCloseData] = useState({ publication_link: '', publication_venue: '' });
  const [holdReason, setHoldReason] = useState('');

  useEffect(() => { if (professorId) fetchGigs(professorId); }, [professorId, fetchGigs]);

  const openGigs = gigs.filter((g) => g.status === 'open');

  const handleClose = async () => {
    if (selectedGig) { await closeGig(selectedGig, closeData); setShowCloseModal(false); setSelectedGig(null); setCloseData({ publication_link: '', publication_venue: '' }); }
  };
  const handleHold = async () => {
    if (selectedGig && holdReason) { await holdGig(selectedGig, { paused_reason: holdReason }); setShowHoldModal(false); setSelectedGig(null); setHoldReason(''); }
  };

  const inputClass = "w-full px-4 py-3 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus-ring transition-all";

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">Open Gigs 🔓</h1>
          <p className="text-muted-foreground">Manage your active research opportunities</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/professor/gigs/create')}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary-glow transition-all shadow-glow font-bold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create New Gig
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading your gigs...</p>
        </div>
      ) : openGigs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-card rounded-2xl shadow-lg p-16 text-center border border-border">
          <BookOpen className="w-20 h-20 mx-auto text-muted-foreground/30 mb-6" />
          <h3 className="text-2xl font-bold text-foreground mb-3">No open gigs found</h3>
          <p className="text-muted-foreground mb-6">Get started by creating your first research opportunity 🚀</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {openGigs.map((gig, index) => (
              <motion.div key={gig.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-card-foreground flex-1 mr-2">{gig.title}</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-success/15 text-success whitespace-nowrap">
                    <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" /> Active
                  </span>
                </div>

                <p className="text-muted-foreground mb-5 line-clamp-2 text-sm">{gig.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-sm bg-primary/5 hover:bg-primary/10 p-2.5 rounded-xl transition-colors">
                    <div className="bg-primary p-2 rounded-lg"><BookOpen className="w-4 h-4 text-primary-foreground" /></div>
                    <div><p className="text-xs text-muted-foreground font-medium">Area</p><p className="font-bold text-card-foreground text-sm">{gig.area_of_study}</p></div>
                  </div>
                  <div className="flex items-center gap-3 text-sm bg-secondary/5 hover:bg-secondary/10 p-2.5 rounded-xl transition-colors">
                    <div className="bg-secondary p-2 rounded-lg"><Clock className="w-4 h-4 text-secondary-foreground" /></div>
                    <div><p className="text-xs text-muted-foreground font-medium">Timeline</p><p className="font-bold text-card-foreground text-sm">{gig.timeline || 'Flexible'}</p></div>
                  </div>
                  <motion.button whileHover={{ x: 2 }} onClick={() => navigate(`/professor/gigs/${gig.id}/applications`)}
                    className="flex items-center gap-3 text-sm w-full bg-info/5 hover:bg-info/10 p-2.5 rounded-xl transition-colors group">
                    <div className="bg-info p-2 rounded-lg"><Users className="w-4 h-4 text-info-foreground" /></div>
                    <div className="text-left"><p className="text-xs text-muted-foreground font-medium">Applications</p><p className="font-bold text-info group-hover:underline text-sm">View All →</p></div>
                  </motion.button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Edit', icon: Edit2, onClick: () => navigate(`/professor/gigs/edit/${gig.id}`), cls: 'bg-info text-info-foreground' },
                    { label: 'Close', icon: CheckCircle, onClick: () => { setSelectedGig(gig.id); setShowCloseModal(true); }, cls: 'bg-success text-success-foreground' },
                    { label: 'Hold', icon: Pause, onClick: () => { setSelectedGig(gig.id); setShowHoldModal(true); }, cls: 'bg-warning text-warning-foreground' },
                  ].map((btn) => (
                    <motion.button key={btn.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={btn.onClick}
                      className={`${btn.cls} px-3 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1`}>
                      <btn.icon className="w-3.5 h-3.5" /> {btn.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Close Modal */}
      <AnimatePresence>
        {showCloseModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCloseModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl p-8 max-w-lg w-full shadow-xl border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-success/15 p-4 rounded-2xl"><CheckCircle className="w-7 h-7 text-success" /></div>
                <div><h3 className="text-2xl font-bold text-card-foreground">Close Gig ✅</h3><p className="text-muted-foreground text-sm">Provide publication details</p></div>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-bold text-foreground mb-2">Publication Venue</label><input type="text" value={closeData.publication_venue} onChange={(e) => setCloseData({ ...closeData, publication_venue: e.target.value })} className={inputClass} placeholder="e.g., IEEE Conference 2024" /></div>
                <div><label className="block text-sm font-bold text-foreground mb-2">Publication Link</label><input type="url" value={closeData.publication_link} onChange={(e) => setCloseData({ ...closeData, publication_link: e.target.value })} className={inputClass} placeholder="https://..." /></div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => { setShowCloseModal(false); setSelectedGig(null); }} className="flex-1 py-3 border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all">Cancel</button>
                <button onClick={handleClose} className="flex-1 py-3 bg-success text-success-foreground rounded-xl font-bold hover:opacity-90 shadow-lg transition-all">Close Gig</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hold Modal */}
      <AnimatePresence>
        {showHoldModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowHoldModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl p-8 max-w-lg w-full shadow-xl border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-warning/15 p-4 rounded-2xl"><Pause className="w-7 h-7 text-warning" /></div>
                <div><h3 className="text-2xl font-bold text-card-foreground">Put On Hold ⏸️</h3><p className="text-muted-foreground text-sm">Provide a reason for pausing</p></div>
              </div>
              <div><label className="block text-sm font-bold text-foreground mb-2">Reason</label><textarea value={holdReason} onChange={(e) => setHoldReason(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Why is this gig being put on hold?" required /></div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowHoldModal(false); setSelectedGig(null); }} className="flex-1 py-3 border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all">Cancel</button>
                <button onClick={handleHold} disabled={!holdReason} className="flex-1 py-3 bg-warning text-warning-foreground rounded-xl font-bold hover:opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">Put On Hold</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OpenGigs;
