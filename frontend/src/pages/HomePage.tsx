import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-primary/20 mb-6 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-xl">🔬</span>
          </div>
          <span className="text-2xl font-bold text-foreground">ResearchConnect</span>
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-4 tracking-tight">
          Where Research<br />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Meets Talent
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Connect with professors for research opportunities or find brilliant students for your projects.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-6 relative z-10 w-full max-w-2xl">
        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/login')}
          className="flex-1 glass-strong rounded-2xl p-8 text-left group cursor-pointer border border-primary/20 hover:border-primary/40 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">I'm a Professor</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Post research gigs, review applications, and find the perfect students for your projects.
          </p>
          <span className="text-primary font-semibold text-sm group-hover:translate-x-1 inline-block transition-transform">
            Get started →
          </span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/student/login')}
          className="flex-1 glass-strong rounded-2xl p-8 text-left group cursor-pointer border border-secondary/20 hover:border-secondary/40 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-5 group-hover:bg-secondary/20 transition-colors">
            <GraduationCap className="w-7 h-7 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">I'm a Student</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Browse research opportunities, apply to exciting projects, and kickstart your academic career.
          </p>
          <span className="text-secondary font-semibold text-sm group-hover:translate-x-1 inline-block transition-transform">
            Get started →
          </span>
        </motion.button>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-xs text-muted-foreground/60 relative z-10"
      >
        Built for curious minds 🧠
      </motion.p>
    </div>
  );
};

export default HomePage;
