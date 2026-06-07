import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfessorStore } from '../../store/professorStore';
import { useAuthStore } from '../../store/authStore';
import NotificationPanel from '../NotificationPanel';
import ChatPanel from '../ChatPanel';
import ThemeToggle from '../ThemeToggle';

const ProfessorLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { professor, fetchProfile } = useProfessorStore();
  const { professorId, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGigsDropdown, setShowGigsDropdown] = useState(false);
  const [mobileGigsOpen, setMobileGigsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (professorId) fetchProfile(professorId);
  }, [professorId, fetchProfile]);

  const navItems = [
    { path: '/professor/dashboard', label: 'Dashboard' },
    { path: '/professor/profile', label: 'Profile' },
    { path: '/professor/chats', label: 'Chats' },
  ];

  const gigItems = [
    { path: '/professor/gigs/open', label: 'Open Gigs' },
    { path: '/professor/gigs/closed', label: 'Closed' },
    { path: '/professor/gigs/hold', label: 'On Hold' },
  ];

  const isGigsActive = location.pathname.startsWith('/professor/gigs/');

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-nav-bg border-b border-nav-border sticky top-0 z-40 backdrop-blur-xl bg-nav-bg/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/professor/dashboard" className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">RC</span>
                </div>
                <h1 className="text-xl font-bold gradient-text hidden sm:block">ResearchConnect</h1>
              </Link>
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="relative">
                  <button
                    onClick={() => setShowGigsDropdown(!showGigsDropdown)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1.5 ${
                      isGigsActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>Gigs</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showGigsDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showGigsDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        className="absolute left-0 mt-2 w-52 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50"
                      >
                        {gigItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setShowGigsDropdown(false)}
                            className={`block px-4 py-2.5 text-sm transition-colors ${
                              location.pathname === item.path
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationPanel />
              <ChatPanel />
              
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {professor?.name || 'Loading...'}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {professor?.department || ''}
                    </p>
                  </div>
                </button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-card-foreground">{professor?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{professor?.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                      location.pathname === item.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                <button
                  onClick={() => setMobileGigsOpen(!mobileGigsOpen)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                    isGigsActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span>Gigs</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileGigsOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {mobileGigsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-2 pl-3 border-l border-border space-y-1">
                        {gigItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileGigsOpen(false);
                            }}
                            className={`block px-3 py-2 rounded-lg text-sm ${
                              location.pathname === item.path
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProfessorLayout;
