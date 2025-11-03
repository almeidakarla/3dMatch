// ArtistApplications.js
// Save as: src/ArtistApplications.js

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ArtistApplications = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadApplications();
  }, [userId]);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          projects:project_id (
            *,
            architect:architect_id (
              full_name,
              email
            )
          )
        `)
        .eq('artist_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      setMessage('Erro ao carregar candidaturas');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Tem certeza que deseja retirar esta candidatura?')) return;

    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'withdrawn' })
        .eq('id', appId);

      if (error) throw error;

      setMessage('✅ Candidatura retirada com sucesso');
      await loadApplications();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error withdrawing application:', error);
      setMessage('❌ Erro ao retirar candidatura');
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: {
        label: 'Aguardando Resposta',
        class: 'status-pending',
        icon: '⏳'
      },
      accepted: {
        label: 'Aceita',
        class: 'status-accepted',
        icon: '✅'
      },
      rejected: {
        label: 'Recusada',
        class: 'status-rejected',
        icon: '❌'
      },
      withdrawn: {
        label: 'Retirada',
        class: 'status-expired',
        icon: '↩️'
      }
    };
    return statuses[status] || statuses.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Carregando candidaturas...</div>;
  }

  if (selectedApp) {
    const statusInfo = getStatusInfo(selectedApp.status);

    return (
      <div>
        <button onClick={() => setSelectedApp(null)} className="btn-back">
          ← Voltar às Candidaturas
        </button>

        <div className="application-detail-container">
          <div className="application-detail-header">
            <h2 className="section-title">{selectedApp.projects.title}</h2>
            <span className={`status-badge ${statusInfo.class}`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>

          <div className="application-detail-grid">
            <div className="application-detail-main">
              <div className="detail-section">
                <h3 className="detail-subtitle">Descrição do Projeto</h3>
                <p className="detail-text">{selectedApp.projects.description}</p>
              </div>

              {selectedApp.projects.reference_images && selectedApp.projects.reference_images.length > 0 && (
                <div className="detail-section">
                  <h3 className="detail-subtitle">Imagens de Referência</h3>
                  <div className="reference-images-grid">
                    {selectedApp.projects.reference_images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Ref ${idx + 1}`} className="reference-image" />
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3 className="detail-subtitle">Sua Proposta</h3>
                <p className="detail-text">{selectedApp.proposal}</p>
              </div>

              {selectedApp.rejection_reason && (
                <div className="detail-section rejection-feedback">
                  <h3 className="detail-subtitle">Feedback do Cliente</h3>
                  <p className="detail-text">{selectedApp.rejection_reason}</p>
                </div>
              )}
            </div>

            <div className="application-detail-sidebar">
              <div className="project-info-card">
                <div className="project-info-item">
                  <span className="project-info-label">Cliente</span>
                  <span className="project-info-value-medium">
                    {selectedApp.projects.architect.full_name}
                  </span>
                </div>
                <div className="project-info-item">
                  <span className="project-info-label">Seu Preço</span>
                  <span className="project-info-value-medium">
                    R$ {selectedApp.quoted_price.toFixed(2)}
                  </span>
                </div>
                <div className="project-info-item">
                  <span className="project-info-label">Prazo Proposto</span>
                  <span className="project-info-value-medium">
                    {selectedApp.delivery_timeline} dias
                  </span>
                </div>
                <div className="project-info-item">
                  <span className="project-info-label">Candidatura Enviada</span>
                  <span className="project-info-value-small">
                    {formatDate(selectedApp.created_at)}
                  </span>
                </div>
              </div>

              {selectedApp.status === 'pending' && (
                <button
                  onClick={() => handleWithdraw(selectedApp.id)}
                  className="btn-secondary btn-full-width"
                >
                  Retirar Candidatura
                </button>
              )}

              {selectedApp.status === 'accepted' && (
                <div className="success-message">
                  <p>🎉 Parabéns! Sua proposta foi aceita.</p>
                  <p>Vá para "Projetos" para começar a trabalhar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="artist-applications-container">
      <h2 className="section-title">Minhas Candidaturas</h2>
      <p className="subtitle">Acompanhe o status das suas propostas</p>

      {message && (
        <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
          {message}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">Nenhuma candidatura enviada</p>
          <p className="empty-state-text">
            Explore projetos disponíveis e envie suas propostas!
          </p>
        </div>
      ) : (
        <div className="applications-grid">
          {applications.map(app => {
            const statusInfo = getStatusInfo(app.status);

            return (
              <div
                key={app.id}
                className="application-summary-card"
                onClick={() => setSelectedApp(app)}
              >
                <div className="application-summary-header">
                  <h3 className="application-summary-title">
                    {app.projects.title}
                  </h3>
                  <span className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>

                <div className="application-summary-body">
                  <div className="summary-info">
                    <span className="summary-label">Cliente:</span>
                    <span className="summary-value">
                      {app.projects.architect.full_name}
                    </span>
                  </div>
                  <div className="summary-info">
                    <span className="summary-label">Seu Preço:</span>
                    <span className="summary-value">
                      R$ {app.quoted_price.toFixed(2)}
                    </span>
                  </div>
                  <div className="summary-info">
                    <span className="summary-label">Enviada em:</span>
                    <span className="summary-value">
                      {formatDate(app.created_at)}
                    </span>
                  </div>
                </div>

                <div className="application-summary-footer">
                  <button className="btn-secondary-small">
                    Ver Detalhes →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArtistApplications;