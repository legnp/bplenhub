import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Monitora se o aluno está logado
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // Se não estiver logado, manda de volta para o login
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) return <div style={{ color: '#fff', backgroundColor: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando Portal...</div>;

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>
      {/* Barra Superior */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>BPlen Hub</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Olá, {user.displayName}</span>
          <button onClick={handleLogout} style={{ backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main style={{ marginTop: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px' }}>Bem-vinda à sua Área de Membros! 🎓</h1>
        <p style={{ color: '#888', fontSize: '18px' }}>Seu acesso foi validado com sucesso via Google Sheets.</p>
        
        <div style={{ 
          marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' 
        }}>
          {/* Card de exemplo para o seu curso */}
          <div style={{ padding: '30px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', textAlign: 'left' }}>
            <h3 style={{ marginTop: 0 }}>📚 Módulo 1: Introdução</h3>
            <p style={{ color: '#aaa' }}>Comece sua jornada por aqui.</p>
            <button style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Assistir Aula</button>
          </div>
        </div>
      </main>
    </div>
  );
}
