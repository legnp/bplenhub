import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // 1. Abre o pop-up do Google
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      
      // 2. Consulta a sua API (que lê a planilha)
      const res = await fetch(`/api/check-access?email=${email}`);
      const data = await res.json();

      if (data.authorized) {
        // 3. Se estiver ativo na planilha, vai para o portal
        router.push('/dashboard');
      } else {
        alert('Acesso Negado: Este e-mail não consta como aluno ativo na nossa base.');
        await auth.signOut();
      }
    } catch (error) {
      console.error("Erro no login:", error);
      alert('Ocorreu um erro ao tentar entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      height: '100vh', backgroundColor: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' 
    }}>
      <div style={{ 
        padding: '40px', borderRadius: '16px', backgroundColor: '#111', 
        border: '1px solid #333', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' 
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>BPlen Hub</h1>
        <p style={{ color: '#888', marginBottom: '30px' }}>Faça login para acessar seus cursos</p>
        
        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{ 
            padding: '12px 24px', fontSize: '16px', cursor: 'pointer', borderRadius: '8px', 
            border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s'
          }}
        >
          {loading ? 'Verificando...' : 'Entrar com Google'}
        </button>
      </div>
    </div>
  );
}
