import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGigsStore } from '../../store/gigsStore';
import { useAuthStore } from '../../store/authStore';
import { Pause, Play } from 'lucide-react';

const OnHoldProjects: React.FC = () => {
  const { gigs, fetchGigs, activateGig, loading } = useGigsStore();
  const { professorId } = useAuthStore();

  useEffect(() => { if (professorId) fetchGigs(professorId); }, [professorId, fetchGigs]);
  const onHoldGigs = gigs.filter((g) => g.status === 'on-hold');

  const handleActivate = async (gigId: string) => {
    if (confirm('Are you sure you want to activate this gig?')) await activateGig(gigId);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-extrabold text-foreground">On Hold Projects ⏸️</h1>
        <p className="mt-2 text-muted-foreground">Projects that are temporarily paused</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary" /></div>
      ) : onHoldGigs.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl shadow-lg border border-border">
          <Pause className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-semibold text-lg">No projects on hold</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {onHoldGigs.map((gig, i) => (
            <motion.div key={gig.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card shadow-lg rounded-2xl p-6 border border-border hover:border-warning/30 transition-all">
              <div className="border-l-4 border-warning pl-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-card-foreground">{gig.title}</h2>
                    <p className="mt-2 text-muted-foreground">{gig.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-semibold text-foreground">Area:</span> <span className="text-muted-foreground">{gig.area_of_study}</span></div>
                      <div><span className="font-semibold text-foreground">Type:</span> <span className="text-muted-foreground">{gig.paper_type || 'N/A'}</span></div>
                    </div>
                    {gig.paused_reason && (
                      <div className="mt-4 p-4 bg-warning/10 rounded-xl">
                        <h3 className="font-semibold text-warning">⚠️ Reason for Hold</h3>
                        <p className="text-sm text-foreground mt-1">{gig.paused_reason}</p>
                      </div>
                    )}
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleActivate(gig.id)}
                    className="ml-4 px-5 py-2.5 bg-success text-success-foreground rounded-xl font-bold hover:opacity-90 shadow-md flex items-center gap-2">
                    <Play className="w-4 h-4" /> Activate
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnHoldProjects;
