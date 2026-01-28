import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useStudentStore } from '../../store/studentStore';
import { useAuthStore } from '../../store/authStore';
import NotificationPanel from '../NotificationPanel';

const StudentLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { student, fetchStudent } = useStudentStore();
  const { studentId, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudent(studentId);
    }
  }, [studentId, fetchStudent]);

  const navItems = [
    { path: '/student/dashboard', label: 'Dashboard' },
    { path: '/student/gigs', label: 'Browse Gigs' },
    { path: '/student/profile', label: 'My Profile' },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/student/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">ResearchConnect</h1>
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
            <div className="flex items-center gap-4">
              <NotificationPanel />
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {student?.name || 'Loading...'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {student?.department || ''}
                    </p>
                  </div>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{student?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{student?.email}</p>
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

export default StudentLayout;
