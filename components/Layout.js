import Head from 'next/head';
import Header from './Header';
import SupportButton from './SupportButton';
import { useState, useEffect } from 'react';

export default function Layout({ children, title, user, theme, toggleTheme, handleLogout, showBackButton, isHeaderSticky = false, highlightThemeButton = false }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      console.log('Checking admin status for:', user.uid);
      fetch(`/api/check-admin?uid=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          console.log('Admin check result:', data);
          setIsAdmin(data.isAdmin);
        })
        .catch(err => console.error('Error checking admin status:', err));
    }
  }, [user]);

  return (
    <div className={`page-wrapper ${theme === 'light' ? 'light-theme' : ''}`}>
      <Head>
        <title>{title} | BPlen Hub</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      
      <Header 
        user={user} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        handleLogout={handleLogout} 
        highlightThemeButton={highlightThemeButton}
        isAdmin={isAdmin}
      />
      {children}
      <SupportButton />
    </div>
  );
}
