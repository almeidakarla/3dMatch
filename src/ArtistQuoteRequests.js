import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ArtistQuoteRequests = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    proposed_price: '',
    delivery_days: '',
    message: ''
  });

  useEffect(() => {
    loadRequests();
  }, [userId]);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_quote_requests')
        .select(`
          *,
          architect:architect_id (name, email)
        `)
        .eq('artist_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (request) => {
    setRespondingTo(request.id);
    setQuoteForm({
      proposed_price: '',
      delivery_days: '',
      message: ''
    });
  };

  const handleSubmitQuote = async (requestId) => {
    if (!quoteForm.proposed_price || !quoteForm.delivery_days) {
      alert('Por favor, preencha o preço e o prazo de entrega');
      return;
    }

    try {
      // Insert the quote
      const { error: quoteError } = await supabase
        .from('custom_quotes')
        .insert([{
          request_id: requestId,
          artist_id: userId,
          proposed_price: parseFloat(quoteForm.proposed_price),
          currency: 'BRL',
          delivery_days: parseInt(quoteForm.delivery_days),
          message: quoteForm.message
        }]);

      if (quoteError) throw quoteError;

      // Update request status
      const { error: updateError } = await supabase
        .from('custom_quote_requests')
        .update({ status: 'quoted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      alert('Orçamento enviado com sucesso!');
      setRespondingTo(null);
      await loadRequests();
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Erro ao enviar orçamento. Tente novamente.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Aguardando Resposta', class: 'status-pending' },
      quoted: { text: 'Orçamento Enviado', class: 'status-quoted' },
      accepted: { text: 'Aceito', class: 'status-accepted' },
      rejected: { text: 'Recusado', class: 'status-rejected' },
      expired: { text: 'Expirado', class: 'status-expired' }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="quote-requests">
      <h2>Solicitações de Orçamento</h2>
      <p className="subtitle">Responda a solicitações personalizadas de arquitetos</p>

      {requests.length === 0 ? (
        <div className="empty-state">
          <p>Você não tem solicitações de orçamento no momento.</p>
          <p>Quando arquitetos enviarem solicitações personalizadas, elas aparecerão aqui!</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map(request => {
            const statusBadge = getStatusBadge(request.status);
            const isResponding = respondingTo === request.id;

            return (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div>
                    <h3>{request.architect?.name || 'Arquiteto'}</h3>
                    <span className="request-date">
                      Solicitado em {formatDate(request.created_at)}
                    </span>
                  </div>
                  <span className={`status-badge ${statusBadge.class}`}>
                    {statusBadge.text}
                  </span>
                </div>

                <div className="request-body">
                  <div className="detail-row">
                    <strong>Descrição do Projeto:</strong>
                    <p>{request.project_description}</p>
                  </div>

                  {request.deadline && (
                    <div className="detail-row">
                      <strong>Prazo Desejado:</strong>
                      <p>{formatDate(request.deadline)}</p>
                    </div>
                  )}

                  {request.reference_images && request.reference_images.length > 0 && (
                    <div className="detail-row">
                      <strong>Imagens de Referência:</strong>
                      <div className="reference-images">
                        {request.reference_images.map((url, idx) => (
                          <img key={idx} src={url} alt={`Referência ${idx + 1}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {request.status === 'pending' && !isResponding && (
                  <button 
                    className="btn-primary"
                    onClick={() => handleRespond(request)}
                  >
                    Enviar Orçamento
                  </button>
                )}

                {isResponding && (
                  <div className="quote-form">
                    <h4>Seu Orçamento</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Preço Proposto (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={quoteForm.proposed_price}
                          onChange={(e) => setQuoteForm({ ...quoteForm, proposed_price: e.target.value })}
                          placeholder="Ex: 2500.00"
                        />
                      </div>

                      <div className="form-group">
                        <label>Prazo de Entrega (dias) *</label>
                        <input
                          type="number"
                          value={quoteForm.delivery_days}
                          onChange={(e) => setQuoteForm({ ...quoteForm, delivery_days: e.target.value })}
                          placeholder="Ex: 10"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Mensagem (opcional)</label>
                      <textarea
                        value={quoteForm.message}
                        onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                        placeholder="Explique sua proposta, o que está incluído, etc..."
                        rows="4"
                      />
                    </div>

                    <div className="form-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => setRespondingTo(null)}
                      >
                        Cancelar
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={() => handleSubmitQuote(request.id)}
                      >
                        Enviar Orçamento
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArtistQuoteRequests;