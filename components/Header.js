import { useRouter } from 'next/router';

export default function Header({ user, theme, toggleTheme, handleLogout, showBackButton = false }) {
  const router = useRouter();

  return (
    <header className="dashboard-header bplen-glass-dark" style={{ position: 'relative', top: '0', marginTop: '0', marginBottom: '0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src="/logo-hub.svg" alt="Logo BPlen Hub" style={{ height: '52px', width: 'auto', display: 'block' }} />
        {showBackButton && (
          <button 
            onClick={() => router.push('/dashboard')} 
            className="secondary-btn" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              padding: '0',
              fontSize: '14px',
              cursor: 'pointer',
              marginLeft: '20px',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            ← Voltar ao Dashboard
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={toggleTheme} 
          className="secondary-btn" 
          style={{ 
            padding: '8px', 
            fontSize: '18px', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{user?.displayName}</span>
        <button onClick={handleLogout} className="secondary-btn" style={{ padding: '8px 15px', fontSize: '12px' }}>
          Sair
        </button>
      </div>
    </header>
  );
}
