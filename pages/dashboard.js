import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Busca na planilha o que este aluno pode ver
        const res = await fetch(`/api/check-access?email=${currentUser.email}`);
        const data = await res.json();
        
        if (data.authorized) {
          // Transforma a lista de produtos da planilha em um array (lista)
          const list = data.products ? data.products.split(',').map(p => p.trim()) : [];
          setProducts(list);
          setLoading(false);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) return <div style={{backgroundColor:'#000', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff'}}>Carregando seu portal...</div>;

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header Profissional */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 4%', backgroundColor: '#000', borderBottom: '1px solid #222' }}>
        <h2 style={{ letterSpacing: '1px', fontWeight: '800' }}>BPLEN <span style={{color:'#E50914'}}>HUB</span></h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#ccc' }}>{user.displayName}</span>
          <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid #444', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>Sair</button>
        </div>
      </header>

      <main style={{ padding: '40px 4%' }}>
        <h1 style={{ marginBottom: '30px' }}>Seus Conteúdos</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
          
          {/* CURSO BASE - Só aparece se estiver na planilha */}
          {products.includes('curso_base') && (
            <div className="card" style={cardStyle}>
              <div style={{height: '160px', backgroundColor: '#111', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems:'center', justifyContent:'center', fontSize: '40px'}}>🎓</div>
              <h3>Curso Base BPlen</h3>
              <p style={{color: '#888', fontSize: '14px'}}>Domine os fundamentos do nosso método.</p>
              <button style={btnStyle}>Acessar Aulas</button>
            </div>
          )}

          {/* MENTORIA VIP - Só aparece se estiver na planilha */}
          {products.includes('mentoria_vip') && (
            <div className="card" style={cardStyle}>
              <div style={{height: '160px', backgroundColor: '#1a1a1a', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems:'center', justifyContent:'center', fontSize: '40px'}}>🚀</div>
              <h3 style={{color: '#FFD700'}}>Mentoria VIP</h3>
              <p style={{color: '#888', fontSize: '14px'}}>Encontros ao vivo e suporte individual.</p>
              <button style={btnStyle}>Entrar na Sala</button>
            </div>
          )}

          {/* MENSAGEM SE NÃO TIVER NADA */}
          {products.length === 0 && (
            <p>Você ainda não possui produtos liberados. Entre em contato com o suporte.</p>
          )}

        </div>
      </main>
    </div>
  );
}

const cardStyle = {
  backgroundColor: '#111',
  padding: '20px',
  borderRadius: '15px',
  border: '1px solid #222',
  transition: 'transform 0.3s ease'
};

const btnStyle = {
  width: '100%',
  marginTop: '15px',
  padding: '12px',
  backgroundColor: '#fff',
  color: '#000',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
};
