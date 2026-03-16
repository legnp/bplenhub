import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  return (
    <div className="page-wrapper center-content" style={{ position: 'relative', overflow: 'hidden' }}>
      <Head>
        <title>BPlen Hub - Bem-vindo</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      {/* Background Color Layer */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#eef2f7',
        zIndex: 0
      }} />

      <div className="bplen-glass" style={{
        textAlign: 'center',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '420px',
        zIndex: 10,
        position: 'relative'
      }}>
        {/* Logo */}
        <img src="/logo-hub.svg" alt="Logo BPlen Hub" style={{ height: '86px', width: 'auto', display: 'block', margin: '0 auto 20px' }} />

        <h1 style={{ color: '#1a2a3a', marginBottom: '10px', fontSize: '24px' }}>
          Bem-vindo ao Portal
        </h1>
        
        <p style={{
          color: '#1a2a3a',
          opacity: 0.6,
          marginBottom: '40px',
          fontSize: '16px'
        }}>
          Acesse sua área restrita para gerenciar suas planilhas e indicadores.
        </p>

        <button onClick={() => router.push('/login')} className="auth-btn btn-primary-white">
          Acessar Portal
        </button>

        <p style={{ marginTop: '40px', fontSize: '13px', color: '#1a2a3a', opacity: 0.4 }}>
          Desenvolvido por BPlen Consulting
        </p>
      </div>
    </div>
  );
}
