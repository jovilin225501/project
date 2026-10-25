import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto border border-brand-200">
          <Recycle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-slate-900 font-heading">404</h1>
          <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page you are looking for doesn't exist, has been relocated, or is recycled into something new.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>{isAuthenticated ? 'Return to Dashboard' : 'Back to Home'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
