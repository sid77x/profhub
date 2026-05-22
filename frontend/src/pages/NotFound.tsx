import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-strong rounded-2xl p-12 text-center border border-primary/10 shadow-lg max-w-lg">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
          <h1 className="text-6xl font-extrabold text-foreground mb-2">404</h1>
          <p className="text-lg text-muted-foreground">We couldn't find the page you're looking for.</p>
        </motion.div>

        <p className="text-muted-foreground mb-6">Try returning home or check the URL and try again.</p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-95"
          >
            Go home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg border border-primary/20 text-primary font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
