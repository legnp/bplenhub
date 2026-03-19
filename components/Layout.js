import Head from 'next/head';
import Header from './Header';

export default function Layout({ children, title, user, theme, toggleTheme, handleLogout, showBackButton, isHeaderSticky = false, highlightThemeButton = false }) {
  return (
    <div className="page-wrapper">
      <Head>
        <title>{title ? `BPlen Hub - ${title}` : 'BPlen Hub'}</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      
      <Header 
        user={user} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        handleLogout={handleLogout} 
        showBackButton={showBackButton}
        highlightThemeButton={highlightThemeButton}
      />
      {children}
    </div>
  );
}
