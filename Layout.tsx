import React from 'react';

type Props = {
  children: React.ReactNode;
  noPadding?: boolean;
};

export const Layout: React.FC<Props> = ({ children, noPadding }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      {/* header/nav */}
      <main className={`flex-1 ${noPadding ? '' : 'p-6'}`}>
        {children}
      </main>
      {/* footer */}
    </div>
  );
};

export default Layout;
