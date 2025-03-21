import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { MessageSquare } from 'lucide-react';
import { useButtonAnimation } from '../../hooks/useButtonAnimation';

const Navbar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const { animationClass, handleClick } = useButtonAnimation();
  
  // Don't show navbar on login, signup, or settings pages
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/settings') {
    return null;
  }
  
  return (
    <nav className="bg-slate-800/90 backdrop-blur-md border-b border-white/10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className={`flex items-center text-white font-bold text-xl ${animationClass}`}
              onClick={(e) => handleClick(e)}
            >
              <MessageSquare className="h-6 w-6 mr-2" />
              <span>n8n Chat</span>
            </Link>
          </div>
          
          {user && (
            <div className="flex items-center space-x-2">
              <Link
                to="/chat"
                className={`px-3 py-2 rounded-md text-sm font-medium text-white ${
                  location.pathname === '/chat' ? 'bg-amber-600' : 'hover:bg-slate-700'
                } ${animationClass}`}
                onClick={(e) => handleClick(e)}
              >
                Chat
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
