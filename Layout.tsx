import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type Props = {
  children: React.ReactNode;
  noPadding?: boolean;
  title?: string;
  showBack?: boolean;
};

export const Layout: React.FC<Props> = ({ children, noPadding, title, showBack }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      
      {/* Header */}
      {(title || showBack) && (
        <header className="flex items-center p-4 border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
          
          {/* Back Button */}
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {/* Title */}
          {title && (
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
        </header>
      )}

      {/* Main */}
      <main className={`flex-1 ${noPadding ? '' : 'p-6'}`}>
        {children}
      </main>

    </div>
  );
};

export default Layout;
