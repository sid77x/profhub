import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useProfessorStore } from '../../store/professorStore';
import { useAuthStore } from '../../store/authStore';

const ProfessorLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { professor, fetchProfile } = useProfessorStore();
  const { professorId, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch the logged-in professor's profile
    if (professorId) {
      fetchProfile(professorId);
    }
  }, [professorId, fetchProfile]);

  const navItems = [
    { path: '/professor/dashboard', label: 'Dashboard' },
    { path: '/professor/profile', label: 'Profile' },
    { path: '/professor/gigs/open', label: 'Open Gigs' },
    { path: '/professor/gigs/closed', label: 'Closed Projects' },
    { path: '/professor/gigs/hold', label: 'On Hold' },
  ];

  const handleSignOut = () => {
    // Clear auth state (this also clears localStorage via persist middleware)
    logout();
    // Navigate to login
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">ProfHub</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {professor?.name || 'Loading...'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {professor?.department || ''}
                    </p>
                  </div>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{professor?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{professor?.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProfessorLayout;
