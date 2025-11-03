import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ServicePackagesManager = ({ userId }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    tier: 'basic',
    title: '',
    description: '',
    price: '',
    delivery_days: '',
    revision_rounds: '1',
    features: ['']
  });

  useEffect(() => {
    loadPackages();
  }, [userId]);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('artist_id', userId)
        .order('price', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    const validFeatures = formData.features.filter(f => f.trim() !== '');
    
    if (!formData.title || !formData.price || validFeatures.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      const packageData = {
        artist_id: userId,
        tier: formData.tier,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: 'BRL',
        delivery_days: parseInt(formData.delivery_days) || 7,
        revision_rounds: parseInt(formData.revision_rounds) || 1,
        features: validFeatures,
        is_active: true
      };

      if (editingPackage) {
        const { error } = await supabase
          .from('service_packages')
          .update(packageData)
          .eq('id', editingPackage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('service_packages')
          .insert([packageData]);
        if (error) throw error;
      }

      await loadPackages();
      resetForm();
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Erro ao salvar pacote. Tente novamente.');
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      tier: pkg.tier,
      title: pkg.title,
      description: pkg.description,
      price: pkg.price.toString(),
      delivery_days: pkg.delivery_days.toString(),
      revision_rounds: pkg.revision_rounds.toString(),
      features: pkg.features
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este pacote?')) return;

    try {
      const { error } = await supabase
        .from('service_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Erro ao deletar pacote.');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('service_packages')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await loadPackages();
    } catch (error) {
      console.error('Error toggling package status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      tier: 'basic',
      title: '',
      description: '',
      price: '',
      delivery_days: '',
      revision_rounds: '1',
      features: ['']
    });
    setEditingPackage(null);
    setShowForm(false);
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

  return (
    <div className="packages-manager">
      <div className="header">
        <h2>Meus Pacotes de Serviço</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Criar Pacote'}
        </button>
      </div>

      {showForm && (
        <div className="package-form">
          <h3>{editingPackage ? 'Editar Pacote' : 'Criar Novo Pacote'}</h3>

          <div className="form-group">
            <label>Nível do Pacote</label>
            <select value={formData.tier} onChange={(e) => setFormData({ ...formData, tier: e.target.value })}>
              <option value="basic">Básico</option>
              <option value="standard">Padrão</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Pacote Básico - Residencial"
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o que está incluído neste pacote..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Ex: 1500.00"
              />
            </div>

            <div className="form-group">
              <label>Prazo de Entrega (dias)</label>
              <input
                type="number"
                value={formData.delivery_days}
                onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                placeholder="Ex: 7"
              />
            </div>

            <div className="form-group">
              <label>Rodadas de Revisão</label>
              <input
                type="number"
                value={formData.revision_rounds}
                onChange={(e) => setFormData({ ...formData, revision_rounds: e.target.value })}
                placeholder="Ex: 2"
              />
            </div>
          </div>

          <div className="form-group">
            <label>O que está incluído? *</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="feature-input">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="Ex: 3 renders em HD"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={handleAddFeature}>
              + Adicionar Item
            </button>
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              {editingPackage ? 'Atualizar' : 'Criar'} Pacote
            </button>
          </div>
        </div>
      )}

      <div className="packages-grid">
        {packages.length === 0 ? (
          <div className="empty-state">
            <p>Você ainda não criou nenhum pacote.</p>
            <p>Crie pacotes para que arquitetos possam contratá-lo diretamente!</p>
          </div>
        ) : (
          packages.map(pkg => (
            <div key={pkg.id} className={`package-card ${!pkg.is_active ? 'inactive' : ''}`}>
              <div className="package-tier">{getTierLabel(pkg.tier)}</div>
              <h3>{pkg.title}</h3>
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

              <div className="package-actions">
                <button className="btn-edit" onClick={() => handleEdit(pkg)}>
                  Editar
                </button>
                <button 
                  className="btn-toggle"
                  onClick={() => toggleActive(pkg.id, pkg.is_active)}
                >
                  {pkg.is_active ? 'Desativar' : 'Ativar'}
                </button>
                <button className="btn-delete" onClick={() => handleDelete(pkg.id)}>
                  Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServicePackagesManager;