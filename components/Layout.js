import Head from 'next/head';
import Header from './Header';

export default function Layout({ children, title, user, theme, toggleTheme, handleLogout, showBackButton, isHeaderSticky = false }) {
  return (
    <div className="page-wrapper">
      <Head>
        <title>{title ? `BPlen Hub - ${title}` : 'BPlen Hub'}</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      
      {isHeaderSticky ? (
        <div style={{ position: 'sticky', top: '0', zIndex: 1100, background: '#050505', paddingTop: '20px' }}>
          <Header 
            user={user} 
            theme={theme} 
            toggleTheme={toggleTheme} 
            handleLogout={handleLogout} 
            showBackButton={showBackButton}
          />
          {children}
        </div>
      ) : (
        <>
          <Header 
            user={user} 
            theme={theme} 
            toggleTheme={toggleTheme} 
            handleLogout={handleLogout} 
            showBackButton={showBackButton}
          />
          {children}
        </>
      )}
    </div>
  );
}
