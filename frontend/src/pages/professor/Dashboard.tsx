import React, { useEffect } from 'react';
import { useGigsStore } from '../../store/gigsStore';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, Pause, TrendingUp, BookOpen } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { gigs, fetchGigs } = useGigsStore();
  const { professorId } = useAuthStore();

  useEffect(() => {
    if (professorId) fetchGigs(professorId);
  }, [professorId, fetchGigs]);

  const openGigs = gigs.filter((g) => g.status === 'open').length;
  const closedGigs = gigs.filter((g) => g.status === 'closed').length;
  const onHoldGigs = gigs.filter((g) => g.status === 'on-hold').length;

  const cards = [
    { label: 'Open Projects', count: openGigs, icon: Briefcase, emoji: '🔓', gradient: 'from-primary to-primary-glow', sub: 'Active' },
    { label: 'Closed Projects', count: closedGigs, icon: CheckCircle, emoji: '✅', gradient: 'from-success to-success/80', sub: 'Completed' },
    { label: 'On Hold', count: onHoldGigs, icon: Pause, emoji: '⏸️', gradient: 'from-warning to-warning/80', sub: 'Paused' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your research opportunities 📊</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-10">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold opacity-90">{card.label}</h3>
              <span className="text-2xl">{card.emoji}</span>
            </div>
            <p className="text-4xl font-extrabold">{card.count}</p>
            <div className="mt-3 flex items-center text-sm opacity-80">
              <TrendingUp className="w-4 h-4 mr-1" />
              {card.sub}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl p-8 shadow-lg border border-border"
      >
        <h2 className="text-2xl font-bold text-card-foreground mb-6">Recent Activity</h2>
        {gigs.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg text-muted-foreground font-semibold">No gigs yet</p>
            <p className="text-muted-foreground/70 mt-2">Create your first research gig to get started! 🚀</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gigs.slice(0, 5).map((gig) => (
              <motion.div
                key={gig.id}
                whileHover={{ x: 4 }}
                className="border-l-4 border-primary bg-muted/50 hover:bg-muted rounded-r-xl pl-4 py-3 pr-4 transition-all duration-200 cursor-default"
              >
                <h3 className="font-bold text-card-foreground text-lg">{gig.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Status:{' '}
                  <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                    gig.status === 'open' ? 'bg-primary/15 text-primary' :
                    gig.status === 'closed' ? 'bg-success/15 text-success' :
                    'bg-warning/15 text-warning'
                  }`}>{gig.status.toUpperCase()}</span>
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
