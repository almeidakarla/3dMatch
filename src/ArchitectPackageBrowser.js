import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ArchitectPackageBrowser = ({ userId }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [packages, setPackages] = useState([]);
  const [orderingPackage, setOrderingPackage] = useState(null);
  const [orderForm, setOrderForm] = useState({
    project_description: '',
    reference_images: []
  });

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      // Get all artists with packages
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          bio,
          photo_url,
          base_rate,
          rate_type,
          average_delivery_time,
          specialties,
          service_packages (
            id,
            title,
            price,
            tier
          )
        `)
        .eq('role', 'artist')
        .not('service_packages', 'is', null);

      if (error) throw error;

      // Filter artists who have active packages
      const artistsWithPackages = (data || []).filter(
        artist => artist.service_packages && artist.service_packages.length > 0
      );

      setArtists(artistsWithPackages);
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArtistPackages = async (artistId) => {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('artist_id', artistId)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const handleViewArtist = async (artist) => {
    setSelectedArtist(artist);
    await loadArtistPackages(artist.id);
  };

  const handleOrderPackage = (pkg) => {
    setOrderingPackage(pkg);
    setOrderForm({
      project_description: '',
      reference_images: []
    });
  };

  const handleSubmitOrder = async () => {
    if (!orderForm.project_description.trim()) {
      alert('Por favor, descreva seu projeto');
      return;
    }

    try {
      const { error } = await supabase
        .from('package_orders')
        .insert([{
          package_id: orderingPackage.id,
          architect_id: userId,
          artist_id: selectedArtist.id,
          price: orderingPackage.price,
          currency: 'BRL',
          status: 'pending',
          project_description: orderForm.project_description,
          reference_images: orderForm.reference_images
        }]);

      if (error) throw error;

      alert('Pedido enviado com sucesso! O artista receberá sua solicitação.');
      setOrderingPackage(null);
      setOrderForm({ project_description: '', reference_images: [] });
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Erro ao enviar pedido. Tente novamente.');
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

  const getTierLabel = (tier) => {
    const labels = {
      basic: 'Básico',
      standard: 'Padrão',
      premium: 'Premium'
    };
    return labels[tier] || tier;
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (selectedArtist) {
    return (
      <div className="artist-packages-view">
        <button className="btn-back" onClick={() => setSelectedArtist(null)}>
          ← Voltar para Artistas
        </button>

        <div className="artist-header">
          {selectedArtist.photo_url && (
            <img src={selectedArtist.photo_url} alt={selectedArtist.name} className="artist-photo" />
          )}
          <div className="artist-info">
            <h2>{selectedArtist.name}</h2>
            {selectedArtist.bio && <p>{selectedArtist.bio}</p>}
            {selectedArtist.base_rate && (
              <div className="base-rate">
                A partir de R$ {selectedArtist.base_rate.toFixed(2)} {getRateTypeLabel(selectedArtist.rate_type)}
              </div>
            )}
            {selectedArtist.average_delivery_time && (
              <div className="delivery-time">
                ⏱️ Prazo médio: {selectedArtist.average_delivery_time} dias
              </div>
            )}
            {selectedArtist.specialties && selectedArtist.specialties.length > 0 && (
              <div className="specialties">
                {selectedArtist.specialties.map((s, idx) => (
                  <span key={idx} className="specialty-tag">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <h3>Pacotes Disponíveis</h3>
        <div className="packages-grid">
          {packages.map(pkg => (
            <div key={pkg.id} className="package-card">
              <div className="package-tier">{getTierLabel(pkg.tier)}</div>
              <h4>{pkg.title}</h4>
              <div className="package-price">R$ {pkg.price.toFixed(2)}</div>
              <p className="package-description">{pkg.description}</p>
              
              <div className="package-details">
                <div className="detail-item">⏱️ {pkg.delivery_days} dias</div>
                <div className="detail-item">🔄 {pkg.revision_rounds} revisões</div>
              </div>

              <div className="package-features">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="feature">✓ {feature}</div>
                ))}
              </div>

              <button 
                className="btn-primary"
                onClick={() => handleOrderPackage(pkg)}
              >
                Contratar Pacote
              </button>
            </div>
          ))}
        </div>

        {orderingPackage && (
          <div className="modal-overlay" onClick={() => setOrderingPackage(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Contratar: {orderingPackage.title}</h3>
              <p className="modal-subtitle">
                Por R$ {orderingPackage.price.toFixed(2)}
              </p>

              <div className="form-group">
                <label>Descreva seu projeto *</label>
                <textarea
                  value={orderForm.project_description}
                  onChange={(e) => setOrderForm({ ...orderForm, project_description: e.target.value })}
                  placeholder="Conte ao artista sobre seu projeto, o que você precisa, estilo desejado, etc..."
                  rows="5"
                />
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setOrderingPackage(null)}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={handleSubmitOrder}>
                  Enviar Pedido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="package-browser">
      <h2>Contratar Artistas por Pacote</h2>
      <p className="subtitle">
        Escolha um pacote pronto e contrate rapidamente
      </p>

      {artists.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum artista com pacotes disponíveis no momento.</p>
        </div>
      ) : (
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
                  A partir de R$ {artist.base_rate.toFixed(2)}
                </div>
              )}

              <div className="package-count">
                {artist.service_packages.length} pacote{artist.service_packages.length !== 1 ? 's' : ''} disponível{artist.service_packages.length !== 1 ? 'is' : ''}
              </div>

              <button 
                className="btn-primary"
                onClick={() => handleViewArtist(artist)}
              >
                Ver Pacotes
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchitectPackageBrowser;