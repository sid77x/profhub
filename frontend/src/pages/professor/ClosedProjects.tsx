import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGigsStore } from '../../store/gigsStore';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle, ExternalLink } from 'lucide-react';

const ClosedProjects: React.FC = () => {
  const { gigs, fetchGigs, loading } = useGigsStore();
  const { professorId } = useAuthStore();

  useEffect(() => { if (professorId) fetchGigs(professorId); }, [professorId, fetchGigs]);
  const closedGigs = gigs.filter((g) => g.status === 'closed');

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-extrabold text-foreground">Closed Projects ✅</h1>
        <p className="mt-2 text-muted-foreground">Projects that have been completed and published</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary" /></div>
      ) : closedGigs.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl shadow-lg border border-border">
          <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-semibold text-lg">No closed projects yet</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {closedGigs.map((gig, i) => (
            <motion.div key={gig.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card shadow-lg rounded-2xl p-6 border border-border hover:border-success/30 transition-all">
              <div className="border-l-4 border-success pl-4">
                <h2 className="text-xl font-bold text-card-foreground">{gig.title}</h2>
                <p className="mt-2 text-muted-foreground">{gig.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-semibold text-foreground">Area:</span> <span className="text-muted-foreground">{gig.area_of_study}</span></div>
                  <div><span className="font-semibold text-foreground">Type:</span> <span className="text-muted-foreground">{gig.paper_type || 'N/A'}</span></div>
                </div>
                {gig.publication_venue && (
                  <div className="mt-4 p-4 bg-success/10 rounded-xl">
                    <h3 className="font-semibold text-success">📄 Publication Details</h3>
                    <p className="text-sm text-foreground mt-1"><span className="font-medium">Venue:</span> {gig.publication_venue}</p>
                    {gig.publication_link && (
                      <a href={gig.publication_link} target="_blank" rel="noopener noreferrer" className="text-sm text-info hover:underline mt-1 inline-flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> View Publication
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClosedProjects;
