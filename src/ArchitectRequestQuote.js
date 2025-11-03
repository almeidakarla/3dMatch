import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ArchitectRequestQuote = ({ userId }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [formData, setFormData] = useState({
    project_description: '',
    deadline: '',
    reference_images: []
  });
  const [myRequests, setMyRequests] = useState([]);
  const [viewingQuotes, setViewingQuotes] = useState(null);

  useEffect(() => {
    loadArtists();
    loadMyRequests();
  }, [userId]);

  const loadArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, bio, photo_url, base_rate, rate_type, specialties')
        .eq('role', 'artist');

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_quote_requests')
        .select(`
          *,
          artist:artist_id (name, photo_url),
          custom_quotes (*)
        `)
        .eq('architect_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleRequestQuote = (artist) => {
    setSelectedArtist(artist);
    setFormData({
      project_description: '',
      deadline: '',
      reference_images: []
    });
  };

  const handleSubmitRequest = async () => {
    if (!formData.project_description.trim()) {
      alert('Por favor, descreva seu projeto');
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_quote_requests')
        .insert([{
          architect_id: userId,
          artist_id: selectedArtist.id,
          project_description: formData.project_description,
          deadline: formData.deadline || null,
          reference_images: formData.reference_images,
          status: 'pending'
        }]);

      if (error) throw error;

      alert('Solicitação enviada com sucesso! O artista receberá sua solicitação.');
      setSelectedArtist(null);
      await loadMyRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  const handleAcceptQuote = async (requestId, quoteId) => {
    if (!window.confirm('Deseja aceitar este orçamento?')) return;

    try {
      const { error } = await supabase
        .from('custom_quote_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      alert('Orçamento aceito! Entre em contato com o artista para finalizar os detalhes.');
      await loadMyRequests();
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert('Erro ao aceitar orçamento.');
    }
  };

  const getRateTypeLabel = (rateType) => {
    const labels = {
      per_render: 'por render',
      per_hour: 'por hora',
      per_project: 'por projeto'
    };
    return labels[rateType] || '';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Aguardando Resposta', class: 'status-pending' },
      quoted: { text: 'Orçamento Recebido', class: 'status-quoted' },
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
    <div className="quote-request-system">
      <div className="section">
        <h2>Solicitar Orçamento Personalizado</h2>
        <p className="subtitle">
          Envie uma solicitação personalizada para um artista
        </p>

        <div className="artists-grid">
          {artists.map(artist => (
            <div key={artist.id} className="artist-card">
              {artist.photo_url && (
                <img src={artist.photo_url} alt={artist.name} className="artist-photo" />
              )}
              <h3>{artist.name}</h3>
              {artist.bio && <p className="artist-bio">{artist.bio}</p>}
              
              {artist.base_rate && (
                <div className="artist-rate">
                  A partir de R$ {artist.base_rate.toFixed(2)} {getRateTypeLabel(artist.rate_type)}
                </div>
              )}

              {artist.specialties && artist.specialties.length > 0 && (
                <div className="specialties">
                  {artist.specialties.slice(0, 3).map((s, idx) => (
                    <span key={idx} className="specialty-tag-small">{s}</span>
                  ))}
                </div>
              )}

              <button 
                className="btn-primary"
                onClick={() => handleRequestQuote(artist)}
              >
                Solicitar Orçamento
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Minhas Solicitações</h2>
        
        {myRequests.length === 0 ? (
          <div className="empty-state">
            <p>Você ainda não fez nenhuma solicitação de orçamento.</p>
          </div>
        ) : (
          <div className="requests-list">
            {myRequests.map(request => {
              const statusBadge = getStatusBadge(request.status);
              const hasQuote = request.custom_quotes && request.custom_quotes.length > 0;
              const quote = hasQuote ? request.custom_quotes[0] : null;

              return (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="artist-info">
                      {request.artist?.photo_url && (
                        <img src={request.artist.photo_url} alt={request.artist.name} className="artist-photo-small" />
                      )}
                      <div>
                        <h4>{request.artist?.name || 'Artista'}</h4>
                        <span className="request-date">
                          Solicitado em {formatDate(request.created_at)}
                        </span>
                      </div>
                    </div>
                    <span className={`status-badge ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  <div className="request-body">
                    <p><strong>Seu Projeto:</strong> {request.project_description}</p>
                    {request.deadline && (
                      <p><strong>Prazo Desejado:</strong> {formatDate(request.deadline)}</p>
                    )}
                  </div>

                  {hasQuote && (
                    <div className="quote-response">
                      <h5>Orçamento do Artista</h5>
                      <div className="quote-details">
                        <div className="quote-price">
                          <strong>Preço:</strong> R$ {quote.proposed_price.toFixed(2)}
                        </div>
                        <div className="quote-delivery">
                          <strong>Prazo:</strong> {quote.delivery_days} dias
                        </div>
                      </div>
                      {quote.message && (
                        <div className="quote-message">
                          <strong>Mensagem:</strong>
                          <p>{quote.message}</p>
                        </div>
                      )}

                      {request.status === 'quoted' && (
                        <button 
                          className="btn-primary"
                          onClick={() => handleAcceptQuote(request.id, quote.id)}
                        >
                          Aceitar Orçamento
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedArtist && (
        <div className="modal-overlay" onClick={() => setSelectedArtist(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Solicitar Orçamento: {selectedArtist.name}</h3>
            
            <div className="form-group">
              <label>Descreva seu projeto *</label>
              <textarea
                value={formData.project_description}
                onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
                placeholder="Conte sobre seu projeto: tipo de propriedade, quantos renders precisa, estilo desejado, etc..."
                rows="6"
              />
            </div>

            <div className="form-group">
              <label>Prazo Desejado (opcional)</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setSelectedArtist(null)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSubmitRequest}>
                Enviar Solicitação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectRequestQuote;