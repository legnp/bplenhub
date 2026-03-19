import { useRouter } from 'next/router';

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

export default function Header({ user, theme, toggleTheme, handleLogout, highlightThemeButton = false }) {
  const router = useRouter();

  return (
    <header className="dashboard-header bplen-glass-dark">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src="/logo-hub.svg" alt="Logo BPlen Hub" style={{ height: '38px', width: 'auto', display: 'block' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={toggleTheme} 
          className={`secondary-btn ${highlightThemeButton ? 'btn-highlight' : ''}`} 
          style={{ 
            padding: '0', 
            borderRadius: '50%', 
            width: '32px', 
            height: '32px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
          title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.displayName}</span>
        <button onClick={handleLogout} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '11px' }}>
          Sair
        </button>
      </div>
    </header>
  );
}
