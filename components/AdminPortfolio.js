import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PieChart as RPieChart, Pie, Cell, Tooltip as RTooltip, Legend as RLegend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import {
  Briefcase, FileText, PieChart, Plus, CheckCircle,
  Search, ExternalLink, Filter, LayoutDashboard, Calendar,
  UploadCloud, AlertCircle, List, Edit3
} from 'lucide-react';

export default function AdminPortfolio() {
  const [activeTab, setActiveTab] = useState('lista'); // 'lista', 'ficha', 'pendentes', 'visao'
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ficha Tecnica States
  const [formData, setFormData] = useState({
    id: '', nome: '', jornada: 'Carreira Profissional', publico: 'Pessoas',
    etapa: '01', objetivo: '', descricao: '', observacoes: '',
    cronograma: [], entregaveis: [], faq: [], seo: '', termos: '',
    preco_padrao: { moeda: 'BRL', valor: 0 },
    condicoes_parcelamento: { taxa: 0, limite_parcelas: '12' },
    link_vendas: '', link_pagamento: '', qr_code_url: '', capa_url: '',
    ofertas: [], cupons: [],
    status: 'Pendente'
  });
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio/get-services');
      const json = await res.json();
      if (json.success) {
        setServices(json.data);
      } else {
        throw new Error(json.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error("Erro ao buscar serviços", error);
    } finally {
      setLoading(false);
    }
  };

  const statsJornada = useMemo(() => {
    const cp = services.filter(s => s.jornada === 'Carreira Profissional').length;
    const ee = services.filter(s => s.jornada === 'Employee Experience').length;
    return [
      { name: 'Carreira', value: cp, color: '#8a4fff' },
      { name: 'Empresas', value: ee, color: '#00ff88' }
    ];
  }, [services]);

  const calculateProgress = (data) => {
    // Only truly mandatory fields determine progress towards activation
    const required = ['id', 'nome', 'jornada', 'publico', 'etapa', 'objetivo'];
    const optional = ['descricao', 'cronograma', 'entregaveis', 'seo', 'termos', 'link_pagamento', 'link_vendas'];
    let filled = 0;
    required.forEach(k => {
      if (Array.isArray(data[k]) && data[k].length > 0) filled++;
      else if (!Array.isArray(data[k]) && data[k]) filled++;
    });
    let optFilled = 0;
    optional.forEach(k => {
      if (Array.isArray(data[k]) && data[k].length > 0) optFilled++;
      else if (!Array.isArray(data[k]) && data[k]) optFilled++;
    });
    // Required fields = 70% weight, optional = 30%
    const reqPct = (filled / required.length) * 70;
    const optPct = (optFilled / optional.length) * 30;
    return Math.round(reqPct + optPct);
  };

  const statsProgress = useMemo(() => {
    return services.map(s => ({
      name: s.nome && s.nome.length > 15 ? s.nome.substring(0, 15) + '...' : (s.nome || s.id),
      progresso: calculateProgress(s) || 0
    })).sort((a,b) => b.progresso - a.progresso);
  }, [services]);

  const statsFinanceiro = useMemo(() => {
    const cp = services.filter(s => s.jornada === 'Carreira Profissional' && s.preco_padrao?.valor);
    const ee = services.filter(s => s.jornada === 'Employee Experience' && s.preco_padrao?.valor);
    const avgCP = cp.length ? cp.reduce((acc, s) => acc + s.preco_padrao.valor, 0) / cp.length : 0;
    const avgEE = ee.length ? ee.reduce((acc, s) => acc + s.preco_padrao.valor, 0) / ee.length : 0;
    return [
      { name: 'Média - Carreira', valor: Math.round(avgCP) },
      { name: 'Média - Empresas', valor: Math.round(avgEE) }
    ];
  }, [services]);

  // Verifica duplicação de Jornada + Etapa
  const [isEtapaOcupada, setIsEtapaOcupada] = useState(false);
  useEffect(() => {
    if (activeTab === 'ficha' && isEditing) {
      const occupied = services.find(s => s.id !== formData.id && s.jornada === formData.jornada && s.etapa === formData.etapa);
      setIsEtapaOcupada(!!occupied);
    } else {
      setIsEtapaOcupada(false);
    }
  }, [formData.jornada, formData.etapa, services, activeTab, isEditing, formData.id]);

  const progress = useMemo(() => calculateProgress(formData), [formData]);

  const generateId = () => {
    const initJornada = formData.jornada === 'Carreira Profissional' ? 'CP' : 'EE';
    const initPub = formData.publico === 'Pessoas' ? 'P' : 'E';
    const numEtapa = formData.etapa || '01';
    const d = new Date();
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    return `${initJornada}-${numEtapa}-${initPub}-${ano}${mes}`;
  };

  const handleCreateNew = () => {
    const initial = {
      id: '', nome: '', jornada: 'Carreira Profissional', publico: 'Pessoas',
      etapa: '01', objetivo: '', descricao: '', observacoes: '',
      cronograma: [], entregaveis: [], faq: [], seo: '', termos: '',
      preco_padrao: { moeda: 'BRL', valor: 0 },
      condicoes_parcelamento: { taxa: 0, limite_parcelas: '12' },
      link_vendas: '', link_pagamento: '', qr_code_url: '', capa_url: '',
      ofertas: [], cupons: [],
      status: 'Pendente'
    };
    initial.id = generateId(); // Auto-generate an initial ID
    setFormData(initial);
    setIsEditing(true);
    setActiveTab('ficha');
  };

  const loadServiceData = (service) => {
    setFormData({
      ...service,
      ofertas: service.ofertas || [],
      cupons: service.cupons || [],
      cronograma: service.cronograma || [],
      entregaveis: service.entregaveis || [],
      faq: service.faq || []
    });
    setIsEditing(false);
  };

  const handleSaveService = async () => {
    setIsSaving(true);
    try {
      let finalFormData = { ...formData };

      // Upload Images
      if (formData.file_capa || formData.file_qrcode) {
        // Assuming 'toast' is available globally or imported, e.g., from 'react-hot-toast'
        // If not, replace with console.log or a state update for user feedback
        // toast.loading('Fazendo upload das imagens...');
        const fd = new FormData();
        const expectedFolderName = `${formData.id}_${formData.nome.replace(/[^a-zA-Z0-9 -]/g, '')}`;
        fd.append('folderName', expectedFolderName);
        fd.append('jornada', formData.jornada);
        fd.append('serviceId', expectedFolderName);
        if (formData.file_capa) fd.append('capa', formData.file_capa);
        if (formData.file_qrcode) fd.append('qrCode', formData.file_qrcode);

        try {
          const resUpload = await fetch('/api/portfolio/upload-assets', {
            method: 'POST',
            body: fd
          });
          const uploadData = await resUpload.json();
          if (uploadData.success) {
            if (uploadData.capaUrl) finalFormData.capa_url = uploadData.capaUrl;
            if (uploadData.qrCodeUrl) finalFormData.qrcode_url = uploadData.qrCodeUrl;
          }
        } catch (uploadError) {
          console.error("Erro upload:", uploadError);
          // continua mesmo com erro
        }
        // Remove file objects before sending JSON
        delete finalFormData.file_capa;
        delete finalFormData.file_qrcode;
      }

      // toast.loading('Sincronizando Ficha Técnica no Google Drive...'); // Assuming toast is available
      const res = await fetch('/api/portfolio/save-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...finalFormData,
          // Auto-determinar status com base no progresso real
          status: calculateProgress(finalFormData) >= 100 ? 'Ativo' : (finalFormData.status === 'Ativo' ? 'Ativo' : 'Pendente')
        })
      });
      const data = await res.json();
      if(!data.success) throw new Error(data.details || data.error);
      // Atualizar formData com as URLs persistidas
      setFormData(prev => ({
        ...prev,
        ...(finalFormData.capa_url ? { capa_url: finalFormData.capa_url } : {}),
        ...(finalFormData.qrcode_url ? { qrcode_url: finalFormData.qrcode_url } : {}),
        file_capa: null, file_qrcode: null
      }));
      alert('Serviço salvo! ID da Pasta Drive: ' + data.folderId);
      // Aqui integrariamos a rota de Assets logo em seguida se houvesse formFiles
      await fetchServices();
    } catch(err) {
      alert('Detalhes do Erro: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, key, value) => {
    const list = [...(formData[field] || [])];
    if (list[index]) {
      list[index][key] = value;
      handleChange(field, list);
    }
  };

  const addArrayItem = (field, item) => {
    const currentList = formData[field] || [];
    handleChange(field, [...currentList, item]);
  };

  const removeArrayItem = (field, index) => {
    const list = [...(formData[field] || [])];
    list.splice(index, 1);
    handleChange(field, list);
  };

  const handleJornadaChange = (jrn) => {
    handleChange('jornada', jrn);
    handleChange('publico', jrn === 'Carreira Profissional' ? 'Pessoas' : 'Empresas');
  };

  return (
    <div className="section-card bplen-glass-dark" style={{ minHeight: '600px' }}>
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2><Briefcase size={24} strokeWidth={1.5} className="title-icon" /> Gestão de Portfólio</h2>
        <p className="subtitle">Visualização e administração completa de serviços cadastrados.</p>
      </div>

      {/* SUB-TABS OVERVIEW */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
        <button className={`filter-btn ${activeTab === 'lista' ? 'active' : ''}`} onClick={() => setActiveTab('lista')}>
          <List size={14} style={{ display: 'inline', marginRight: '6px' }} /> Portfólio Inicial
        </button>
        <button className={`filter-btn ${activeTab === 'pendentes' ? 'active' : ''}`} onClick={() => setActiveTab('pendentes')} style={{ position: 'relative' }}>
          <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px' }} /> Pendentes
          {services.filter(s => calculateProgress(s) < 100).length > 0 && (
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {services.filter(s => calculateProgress(s) < 100).length}
            </span>
          )}
        </button>
        <button className={`filter-btn ${activeTab === 'ficha' ? 'active' : ''}`} onClick={() => setActiveTab('ficha')}>
          <FileText size={14} style={{ display: 'inline', marginRight: '6px' }} /> Ficha Técnica
        </button>
        <button className={`filter-btn ${activeTab === 'visao' ? 'active' : ''}`} onClick={() => setActiveTab('visao')}>
          <PieChart size={14} style={{ display: 'inline', marginRight: '6px' }} /> Visão Geral
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Mapeando Portfólio...</p>
        </div>
      )}

      {/* TAB 1: LISTA GERAL DE SERVIÇOS */}
      {!loading && activeTab === 'lista' && (
        <div className="portfolio-list-view">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
            <div className="admin-input-small" style={{ display: 'flex', alignItems: 'center', width: '260px', padding: '6px 12px', height: '34px' }}>
              <Search size={13} style={{ marginRight: '8px', color: 'var(--text-muted)', flexShrink: 0 }} />
              <input type="text" placeholder="Buscar serviço..." style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%', fontSize: '13px' }} />
            </div>
            <button onClick={handleCreateNew} className="action-btn btn-primary" style={{ padding: '6px 14px', fontSize: '13px', height: '34px' }}>
              <Plus size={13} /> Novo Serviço
            </button>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cod/Nome</th>
                  <th>Jornada</th>
                  <th style={{ textAlign: 'center' }}>Etapa</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Preço</th>
                  <th style={{ textAlign: 'center' }}>Oferta</th>
                  <th style={{ textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Nenhum serviço cadastrado.
                    </td>
                  </tr>
                ) : (
                  services.map(srv => (
                    <tr key={srv.id} className="session-item" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--glass-border)', borderRadius: 0 }}>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{srv.nome}</div>
                        <div style={{ fontSize: '10px', color: 'var(--primary)' }}>{srv.id}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{srv.jornada}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{srv.etapa}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="status-concluido" style={{
                          fontSize: '10px', padding: '4px 8px', borderRadius: '10px',
                          background: srv.status === 'Ativo' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)',
                          color: srv.status === 'Ativo' ? '#00b35f' : 'var(--text-muted)'
                        }}>
                          {srv.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>{srv.preco_padrao?.moeda} {srv.preco_padrao?.valor}</td>
                      <td style={{ textAlign: 'center' }}>
                        {srv.ofertas?.length > 0 ? <CheckCircle size={14} color="#00ff88" /> : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => { loadServiceData(srv); setActiveTab('ficha'); }}
                          className="action-btn btn-outline" style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TELA PENDENTES */}
      {activeTab === 'pendentes' && (
        <div className="admin-panel animate-fadein">
          <div className="admin-header">
            <h3>Serviços Pendentes de Revisão</h3>
            <p className="text-muted">Serviços que ainda não estão 100% preenchidos e não podem ser ativados.</p>
          </div>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>Serviço</th><th>Jornada</th><th>Etapa</th><th>Progresso</th><th>Ação</th></tr>
              </thead>
              <tbody>
                {services.filter(s => calculateProgress(s) < 100).map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.nome || s.id}</strong></td>
                    <td>{s.jornada}</td>
                    <td>{s.etapa}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, background: 'var(--glass-bg)', height: '6px', borderRadius: '4px' }}>
                          <div style={{ width: `${calculateProgress(s)}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{calculateProgress(s)}%</span>
                      </div>
                    </td>
                    <td>
                      <button onClick={() => { setActiveTab('ficha'); loadServiceData(s); }} className="action-btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Edit3 size={14} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {services.filter(s => calculateProgress(s) < 100).length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Nenhum serviço pendente! Parabéns.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FICHA TÉCNICA (Básico Estruturado) */}
      {!loading && activeTab === 'ficha' && (
        <div className="ficha-tecnica-view">

          {/* TOPO: Seletor e Status */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="admin-input-small"
              style={{ width: '280px' }}
              value={formData.id}
              onChange={(e) => {
                const s = services.find(x => x.id === e.target.value);
                if (s) { loadServiceData(s); }
              }}
            >
              <option value="">-- Selecione ou cadastre novo --</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.nome} ({s.id})</option>)}
            </select>

            <button onClick={handleCreateNew} className="action-btn btn-outline">
               <Plus size={14} /> Cadastrar Novo
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '150px', background: 'var(--glass-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: progress + '%', background: progress === 100 ? '#00ff88' : 'var(--primary)', height: '100%', transition: 'width 0.3s' }}></div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{progress}% Preenchido</span>
            </div>
          </div>

          {/* Form Content */}
          <div style={{ padding: '30px', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', display: 'flex', flexDirection: 'column', gap: '30px' }}>

            {/* Action Bar (Top) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="action-btn btn-outline"
              >
                 {isEditing ? 'Desabilitar Edição' : 'Habilitar Edição'}
              </button>
              <button
                onClick={handleSaveService}
                disabled={!isEditing || isSaving || isEtapaOcupada}
                className="action-btn btn-primary"
              >
                 {isSaving ? 'Salvando...' : 'Salvar Dados'}
              </button>
              <button
                disabled={progress < 100 || formData.status === 'Ativo' || !isEditing || isEtapaOcupada}
                onClick={() => handleChange('status', 'Ativo')}
                className={`action-btn ${progress === 100 ? 'btn-success' : 'btn-outline'}`}
                style={{ opacity: progress < 100 || isEtapaOcupada ? 0.5 : 1 }}
              >
                 Ativar Serviço
              </button>
            </div>

            {(progress < 100 || isEtapaOcupada) && formData.status !== 'Ativo' && (
              <div style={{ padding: '15px', borderRadius: '10px', background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)', color: '#ffb300', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={16} />
                {isEtapaOcupada ? `A etapa ${formData.etapa} da jornada ${formData.jornada} já está ocupada por outro serviço. Por favor, selecione outra etapa ou desative o serviço existente.` : 'Existem campos pendentes na Ficha Técnica. O serviço não pode ser ativado até 100% de preenchimento.'}
              </div>
            )}

            {/* SEÇÃO 1: Dados Base */}
            <fieldset disabled={!isEditing} style={{ border: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Dados Primários</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID Único</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" className="admin-input" value={formData.id} readOnly style={{ opacity: 0.7 }} />
                    <button type="button" onClick={() => handleChange('id', generateId())} className="action-btn btn-outline" style={{ fontSize: '11px' }}>Gerar</button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nome do Serviço</label>
                  <input type="text" className="admin-input" value={formData.nome} onChange={e => handleChange('nome', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Jornada</label>
                  <select className="admin-input" value={formData.jornada} onChange={e => handleJornadaChange(e.target.value)}>
                    <option value="Carreira Profissional">Carreira Profissional</option>
                    <option value="Employee Experience">Employee Experience</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Público</label>
                  <select className="admin-input" value={formData.publico} onChange={e => handleChange('publico', e.target.value)}>
                    <option value="Pessoas">Pessoas</option>
                    <option value="Empresas">Empresas</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Etapa da Jornada</label>
                  <select className="admin-input" value={formData.etapa} onChange={e => handleChange('etapa', e.target.value)} style={{ borderColor: isEtapaOcupada ? '#ff4d4f' : '' }}>
                    {Array.from({ length: 15 }, (_, i) => String(i + 1).padStart(2, '0')).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  {isEtapaOcupada && <p style={{ color: '#ff4d4f', fontSize: '11px', marginTop: '5px' }}><AlertCircle size={10} style={{ display: 'inline', marginRight: '3px' }}/>Essa jornada já tem um produto ocupando a etapa {formData.etapa}. Desative ou edite a existente!</p>}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Objetivo do Serviço</label>
                <textarea className="admin-input-obs" rows="3" value={formData.objetivo} onChange={e => handleChange('objetivo', e.target.value)}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Descrição</label>
                <textarea className="admin-input-obs" rows="5" value={formData.descricao} onChange={e => handleChange('descricao', e.target.value)}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Observações Gerais do Serviço</label>
                <textarea className="admin-input-obs" rows="3" value={formData.observacoes || ''} onChange={e => handleChange('observacoes', e.target.value)} placeholder="Use para anotações internas..."></textarea>
              </div>
            </fieldset>

            {/* SEÇÃO 2: Cronograma */}
            <fieldset disabled={!isEditing} style={{ border: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Estrutura e Cronograma</h3>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>SLA (Unidade)</th><th>SLA (Prazo)</th><th>Nome Checkpoint</th><th>Participantes</th><th>Duração (Formato)</th><th>Tempo</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.cronograma.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <select className="admin-input-small" value={item.tipo_prazo || 'Dias'} onChange={e => handleArrayChange('cronograma', idx, 'tipo_prazo', e.target.value)}>
                            <option value="Dia(s)">Dia(s)</option>
                            <option value="Mês(es)">Mês(es)</option>
                            <option value="Ano(s)">Ano(s)</option>
                          </select>
                        </td>
                        <td><input type="number" className="admin-input-small" style={{ width: '60px' }} value={item.prazo_valor || ''} onChange={e => handleArrayChange('cronograma', idx, 'prazo_valor', e.target.value)} /></td>
                        <td><input type="text" className="admin-input-small" value={item.checkpoint} onChange={e => handleArrayChange('cronograma', idx, 'checkpoint', e.target.value)} /></td>
                        <td><input type="text" className="admin-input-small" value={item.participantes} onChange={e => handleArrayChange('cronograma', idx, 'participantes', e.target.value)} /></td>
                        <td>
                          <select className="admin-input-small" value={item.duracao_tipo} onChange={e => handleArrayChange('cronograma', idx, 'duracao_tipo', e.target.value)}>
                            <option value="minutos">Minutes</option><option value="horas">Horas</option><option value="dias">Dias</option>
                          </select>
                        </td>
                        <td><input type="number" className="admin-input-small" style={{ width: '70px' }} value={item.duracao_valor} onChange={e => handleArrayChange('cronograma', idx, 'duracao_valor', e.target.value)} /></td>
                        <td><button type="button" onClick={() => removeArrayItem('cronograma', idx)} className="action-btn" style={{ color: '#ff4d4f' }}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={() => addArrayItem('cronograma', { tipo_prazo: 'Dia(s)', prazo_valor: '', checkpoint: '', participantes: '', duracao_tipo: 'minutos', duracao_valor: '' })} className="action-btn btn-outline" style={{ marginTop: '10px', fontSize: '11px' }}>+ Linha de Cronograma</button>
              </div>
            </fieldset>

            {/* SEÇÃO 3: Commercial & Ofertas */}
            <fieldset disabled={!isEditing} style={{ border: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Comercial e Links</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Moeda Padrão</label>
                  <select className="admin-input" value={formData.preco_padrao.moeda} onChange={e => handleChange('preco_padrao', { ...formData.preco_padrao, moeda: e.target.value })}>
                    <option value="BRL">BRL (R$)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Valor Padrão</label>
                  <input type="number" className="admin-input" value={formData.preco_padrao.valor} onChange={e => handleChange('preco_padrao', { ...formData.preco_padrao, valor: Number(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div><label className="text-muted" style={{ fontSize: '11px' }}>Taxa Parcela %</label><input type="number" className="admin-input" value={formData.condicoes_parcelamento.taxa} onChange={e => handleChange('condicoes_parcelamento', { ...formData.condicoes_parcelamento, taxa: Number(e.target.value) })} /></div>
                <div>
                  <label className="text-muted" style={{ fontSize: '11px' }}>Limite Parcelas</label>
                  <select className="admin-input" value={formData.condicoes_parcelamento.limite_parcelas} onChange={e => handleChange('condicoes_parcelamento', { ...formData.condicoes_parcelamento, limite_parcelas: e.target.value })}>
                     {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(n => <option key={n} value={n}>{n}x</option>)}
                  </select>
                </div>
                <div><label className="text-muted" style={{ fontSize: '11px' }}>Valor p/ Parcela (Calculado)</label><input type="number" readOnly className="admin-input" value={((formData.preco_padrao.valor * (1 + formData.condicoes_parcelamento.taxa / 100)) / Number(formData.condicoes_parcelamento.limite_parcelas)).toFixed(2)} style={{ opacity: 0.7 }} /></div>
                <div><label className="text-muted" style={{ fontSize: '11px' }}>Valor Total c/ Taxa</label><input type="number" readOnly className="admin-input" value={(formData.preco_padrao.valor * (1 + formData.condicoes_parcelamento.taxa / 100)).toFixed(2)} style={{ opacity: 0.7 }} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Link de Pagamento / Checkout Padrão</label>
                  <input type="url" className="admin-input" value={formData.link_pagamento} onChange={e => handleChange('link_pagamento', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Link da Página de Vendas (Publicação)</label>
                  <input type="url" className="admin-input" value={formData.link_vendas || ''} onChange={e => handleChange('link_vendas', e.target.value)} />
                </div>
              </div>

              {/* OFERTAS DYNAMIC ARRAY */}
              <div className="table-wrapper" style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Ofertas e Combos Ativos</label>
                <table className="admin-table">
                  <thead>
                    <tr><th>Nome da Oferta</th><th>Desc. / Termos</th><th>Validade</th><th>% Desc</th><th>Valor Desc</th><th>Valor Final</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {(formData.ofertas || []).map((item, idx) => (
                      <tr key={idx}>
                        <td><input type="text" className="admin-input-small" placeholder="Black Friday" value={item.nome || ''} onChange={e => handleArrayChange('ofertas', idx, 'nome', e.target.value)} /></td>
                        <td><textarea rows={1} className="admin-input-small" placeholder="Termos..." value={item.termos || ''} onChange={e => handleArrayChange('ofertas', idx, 'termos', e.target.value)} /></td>
                        <td><input type="date" className="admin-input-small" value={item.validade || ''} onChange={e => handleArrayChange('ofertas', idx, 'validade', e.target.value)} /></td>
                        <td><input type="number" className="admin-input-small" style={{ width: '60px' }} value={item.desconto_perc || 0} onChange={e => {
                          const p = Number(e.target.value);
                          const desc = (formData.preco_padrao.valor * (p/100));
                          const final = formData.preco_padrao.valor - desc;
                          const list = [...formData.ofertas];
                          list[idx].desconto_perc = p; list[idx].desconto_valor = desc; list[idx].valor_final = final;
                          handleChange('ofertas', list);
                        }} /></td>
                        <td><input type="number" className="admin-input-small" style={{ width: '80px' }} value={item.desconto_valor || 0} onChange={e => handleArrayChange('ofertas', idx, 'desconto_valor', Number(e.target.value))}/></td>
                        <td><input type="number" className="admin-input-small" style={{ width: '80px', background: 'rgba(255,255,255,0.05)' }} readOnly value={item.valor_final || 0} /></td>
                        <td>
                          <select className="admin-input-small" value={item.status || 'Ativa'} onChange={e => handleArrayChange('ofertas', idx, 'status', e.target.value)}>
                            <option value="Ativa">Ativa</option><option value="Inativa">Inativa</option>
                          </select>
                        </td>
                        <td><button type="button" onClick={() => removeArrayItem('ofertas', idx)} className="action-btn" style={{ color: '#ff4d4f' }}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={() => addArrayItem('ofertas', { nome: '', termos: '', validade: '', desconto_perc: 0, desconto_valor: 0, valor_final: formData.preco_padrao.valor, status: 'Ativa' })} className="action-btn btn-outline" style={{ marginTop: '10px', fontSize: '11px' }}>+ Nova Oferta</button>
              </div>

              {/* CUPONS DYNAMIC ARRAY */}
              <div className="table-wrapper" style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Códigos de Desconto (Cupons)</label>
                <table className="admin-table">
                  <thead>
                    <tr><th>Código do Cupom</th><th>Desc. / Termos</th><th>Validade</th><th>% Desc</th><th>Valor Desc</th><th>Valor Final</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {(formData.cupons || []).map((item, idx) => (
                      <tr key={idx}>
                        <td><input type="text" className="admin-input-small" placeholder="EXBPLEN10" value={item.codigo || ''} onChange={e => handleArrayChange('cupons', idx, 'codigo', e.target.value.toUpperCase())} /></td>
                        <td><textarea rows={1} className="admin-input-small" placeholder="Termos..." value={item.termos || ''} onChange={e => handleArrayChange('cupons', idx, 'termos', e.target.value)} /></td>
                        <td><input type="date" className="admin-input-small" value={item.validade || ''} onChange={e => handleArrayChange('cupons', idx, 'validade', e.target.value)} /></td>
                        <td><input type="number" className="admin-input-small" style={{ width: '60px' }} value={item.desconto_perc || 0} onChange={e => {
                          const p = Number(e.target.value);
                          const desc = (formData.preco_padrao.valor * (p/100));
                          const final = formData.preco_padrao.valor - desc;
                          const list = [...formData.cupons];
                          list[idx].desconto_perc = p; list[idx].desconto_valor = desc; list[idx].valor_final = final;
                          handleChange('cupons', list);
                        }} /></td>
                        <td><input type="number" className="admin-input-small" style={{ width: '80px' }} value={item.desconto_valor || 0} onChange={e => handleArrayChange('cupons', idx, 'desconto_valor', Number(e.target.value))}/></td>
                        <td><input type="number" className="admin-input-small" style={{ width: '80px', background: 'rgba(255,255,255,0.05)' }} readOnly value={item.valor_final || 0} /></td>
                        <td>
                          <select className="admin-input-small" value={item.status || 'Ativa'} onChange={e => handleArrayChange('cupons', idx, 'status', e.target.value)}>
                            <option value="Ativa">Ativa</option><option value="Inativa">Inativa</option>
                          </select>
                        </td>
                        <td><button type="button" onClick={() => removeArrayItem('cupons', idx)} className="action-btn" style={{ color: '#ff4d4f' }}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={() => addArrayItem('cupons', { codigo: '', termos: '', validade: '', desconto_perc: 0, desconto_valor: 0, valor_final: formData.preco_padrao.valor, status: 'Ativa' })} className="action-btn btn-outline" style={{ marginTop: '10px', fontSize: '11px' }}>+ Novo Cupom</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'var(--bg-panel)', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Capa do Produto (Arquivo)</label>
                  <input type="file" className="admin-input" accept="image/*" onChange={e => handleChange('file_capa', e.target.files[0])} />
                  {formData.capa_url && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(138,79,255,0.1)', borderRadius: '8px', border: '1px solid rgba(138,79,255,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Arquivo salvo:</span>
                      <a href={formData.capa_url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', wordBreak: 'break-all' }}>Ver no Google Drive ↗</a>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>QR Code Pagamento (Arquivo)</label>
                  <input type="file" className="admin-input" accept="image/*" onChange={e => handleChange('file_qrcode', e.target.files[0])} />
                  {formData.qrcode_url && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(138,79,255,0.1)', borderRadius: '8px', border: '1px solid rgba(138,79,255,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Arquivo salvo:</span>
                      <a href={formData.qrcode_url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', wordBreak: 'break-all' }}>Ver no Google Drive ↗</a>
                    </div>
                  )}
                </div>
              </div>

            </fieldset>

            {/* SEÇÃO 4: Base de Conhecimento e SEO */}
            <fieldset disabled={!isEditing} style={{ border: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Conteúdo e Base de Conhecimento</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Entregaveis */}
                <div className="table-wrapper">
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Entregáveis (O que o cliente recebe)</label>
                  <table className="admin-table">
                    <thead><tr><th>Nome do Entregável</th><th>Formato</th><th></th></tr></thead>
                    <tbody>
                      {formData.entregaveis.map((item, idx) => (
                        <tr key={idx}>
                          <td><input type="text" className="admin-input-small" value={item.nome || ''} onChange={e => handleArrayChange('entregaveis', idx, 'nome', e.target.value)} /></td>
                          <td><input type="text" className="admin-input-small" value={item.formato || ''} onChange={e => handleArrayChange('entregaveis', idx, 'formato', e.target.value)} /></td>
                          <td><button type="button" onClick={() => removeArrayItem('entregaveis', idx)} className="action-btn" style={{ color: '#ff4d4f', padding: '0 5px' }}>X</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button type="button" onClick={() => addArrayItem('entregaveis', { nome: '', formato: '' })} className="action-btn btn-outline" style={{ marginTop: '10px', fontSize: '11px' }}>+ Adicionar Entregável</button>
                </div>
                
                {/* FAQ */}
                <div className="table-wrapper">
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Perguntas Frequentes (FAQ)</label>
                  <table className="admin-table">
                    <thead><tr><th>Dúvida</th><th>Resposta</th><th></th></tr></thead>
                    <tbody>
                      {formData.faq.map((item, idx) => (
                        <tr key={idx}>
                          <td><input type="text" className="admin-input-small" value={item.pergunta || ''} onChange={e => handleArrayChange('faq', idx, 'pergunta', e.target.value)} /></td>
                          <td><input type="text" className="admin-input-small" value={item.resposta || ''} onChange={e => handleArrayChange('faq', idx, 'resposta', e.target.value)} /></td>
                          <td><button type="button" onClick={() => removeArrayItem('faq', idx)} className="action-btn" style={{ color: '#ff4d4f', padding: '0 5px' }}>X</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button type="button" onClick={() => addArrayItem('faq', { pergunta: '', resposta: '' })} className="action-btn btn-outline" style={{ marginTop: '10px', fontSize: '11px' }}>+ Adicionar FAQ</button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estratégia de SEO</label>
                  <textarea className="admin-input-obs" rows="4" value={formData.seo} onChange={e => handleChange('seo', e.target.value)}></textarea>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Termos e Condições</label>
                  <textarea className="admin-input-obs" rows="4" value={formData.termos} onChange={e => handleChange('termos', e.target.value)}></textarea>
                </div>
              </div>
            </fieldset>

            {/* Ações de Repetição Inferior */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
              <button onClick={() => setIsEditing(!isEditing)} className="action-btn btn-outline">{isEditing ? 'Desabilitar Edição' : 'Habilitar Edição'}</button>
              <button onClick={handleSaveService} disabled={!isEditing || isSaving} className="action-btn btn-primary">{isSaving ? 'Salvando...' : 'Salvar Dados'}</button>
            </div>
            
          </div>
        </div>
      )}

      {/* TAB 3: VISÃO GERAL */}
      {!loading && activeTab === 'visao' && (
        <div className="visao-geral-view">
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Gráfico 1: Rosca de Segmentos */}
            <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '20px', color: 'var(--text-main)' }}>Total de Serviços por Jornada</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <RPieChart>
                    <Pie data={statsJornada} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {statsJornada.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RTooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    <RLegend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Barra Horizontal Progresso */}
            <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '20px', color: 'var(--text-main)' }}>Progresso de Preenchimento</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <BarChart data={statsProgress} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={80} />
                    <RTooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="progresso" fill="#8a4fff" radius={[0, 4, 4, 0]}>
                      {statsProgress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.progresso === 100 ? '#00ff88' : '#8a4fff'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 3: Receitas (Ticket Medio Vertical) */}
            <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '20px', color: 'var(--text-main)' }}>Ticket Médio (BRL)</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <BarChart data={statsFinanceiro} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <RTooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="valor" fill="#00ff88" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
