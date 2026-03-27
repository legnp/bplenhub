import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37a.996.996 0 00-1.41 0l-1.06 1.06a.996.996 0 101.41 1.41l1.06-1.06a.996.996 0 000-1.41zm-12.37 12.37a.996.996 0 00-1.41 0l-1.06 1.06a.996.996 0 101.41 1.41l1.06-1.06a.996.996 0 000-1.41z" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"></line>
    <line x1="4" y1="6" x2="20" y2="6"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export default function Header({ user, theme, toggleTheme, handleLogout, highlightThemeButton = false, isAdmin = false }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isAdminPage = router.pathname === '/admin';

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <>
      <style jsx global>{`
        .dashboard-header.bplen-glass-dark {
          overflow: visible !important;
        }
        .dashboard-header.bplen-glass-dark::before,
        .dashboard-header.bplen-glass-dark::after {
          border-radius: inherit !important;
        }
      `}</style>
      <header className="dashboard-header bplen-glass-dark" style={{ position: 'relative', zIndex: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src="/logo-hub.svg" alt="Logo BPlen Hub" style={{ height: '38px', width: 'auto', display: 'block' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.displayName}</span>
        
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              console.log('Menu button clicked. Current state:', isMenuOpen);
              setIsMenuOpen((prev) => !prev);
            }}
            className={`secondary-btn ${highlightThemeButton && !isMenuOpen ? 'btn-highlight' : ''}`}
            style={{ 
              padding: '0', 
              borderRadius: '8px', 
              width: '36px', 
              height: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
            title="Menu"
          >
            <MenuIcon />
          </button>

          {isMenuOpen && (
            <div 
              className="bplen-glass-dark"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: '0',
                minWidth: '200px',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 100,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)'
              }}
            >
              {isAdmin && !isAdminPage && (
                <button 
                  onClick={() => { router.push('/admin'); setIsMenuOpen(false); }} 
                  className="secondary-btn dropdown-item" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    justifyContent: 'flex-start',
                    width: '100%',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'var(--text-main)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span style={{ fontSize: '14px' }}>Área Admin</span>
                </button>
              )}

              {isAdminPage && (
                <button 
                  onClick={() => { router.push('/dashboard'); setIsMenuOpen(false); }} 
                  className="secondary-btn dropdown-item" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    justifyContent: 'flex-start',
                    width: '100%',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'var(--text-main)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span style={{ fontSize: '14px' }}>Dashboard</span>
                </button>
              )}

              <button 
                onClick={() => { router.push('/onboarding'); setIsMenuOpen(false); }} 
                className="secondary-btn dropdown-item" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  justifyContent: 'flex-start',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-main)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span style={{ fontSize: '14px' }}>Onboarding</span>
              </button>

              <button 
                onClick={() => { router.push('/orientacao_em_grupo'); setIsMenuOpen(false); }} 
                className="secondary-btn dropdown-item" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  justifyContent: 'flex-start',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-main)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                </svg>
                <span style={{ fontSize: '14px' }}>Orientação em Grupo</span>
              </button>

              {(isAdmin || isAdminPage) && <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 8px' }} />}

              <button 
                onClick={() => { toggleTheme(); setIsMenuOpen(false); }} 
                className="secondary-btn dropdown-item" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  justifyContent: 'flex-start',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-main)'
                }}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                <span style={{ fontSize: '14px' }}>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
              </button>
              
              <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 8px' }} />
              
              <button 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                className="secondary-btn dropdown-item" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  justifyContent: 'flex-start',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#ff4d4f',
                  textAlign: 'left',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <LogoutIcon />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
