import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ArtistPricingSettings = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState({
    base_rate: '',
    rate_type: 'per_render',
    average_delivery_time: '',
    specialties: []
  });
  const [message, setMessage] = useState('');

  const specialtyOptions = [
    'Residential',
    'Commercial',
    'Interior Design',
    'Exterior',
    'Landscaping',
    'Industrial',
    'Urban Planning',
    'Product Visualization'
  ];

  useEffect(() => {
    loadPricing();
  }, [userId]);

  const loadPricing = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('base_rate, rate_type, average_delivery_time, specialties')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setPricing({
          base_rate: data.base_rate || '',
          rate_type: data.rate_type || 'per_render',
          average_delivery_time: data.average_delivery_time || '',
          specialties: data.specialties || []
        });
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          base_rate: pricing.base_rate || null,
          rate_type: pricing.rate_type,
          average_delivery_time: pricing.average_delivery_time || null,
          specialties: pricing.specialties
        })
        .eq('id', userId);

      if (error) throw error;

      setMessage('Pricing settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving pricing:', error);
      setMessage('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSpecialty = (specialty) => {
    setPricing(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="pricing-settings">
      <h2>Configurações de Preço</h2>
      <p className="subtitle">Configure sua taxa base e especialidades</p>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Base Rate */}
        <div className="form-group">
          <label>Taxa Base *</label>
          <div className="input-with-prefix">
            <span className="prefix">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={pricing.base_rate}
              onChange={(e) => setPricing({ ...pricing, base_rate: e.target.value })}
              placeholder="Ex: 800.00"
              required
            />
          </div>
        </div>

        {/* Rate Type */}
        <div className="form-group">
          <label>Tipo de Cobrança *</label>
          <select
            value={pricing.rate_type}
            onChange={(e) => setPricing({ ...pricing, rate_type: e.target.value })}
            required
          >
            <option value="per_render">Por Render</option>
            <option value="per_hour">Por Hora</option>
            <option value="per_project">Por Projeto</option>
          </select>
        </div>

        {/* Average Delivery Time */}
        <div className="form-group">
          <label>Tempo Médio de Entrega (dias)</label>
          <input
            type="number"
            min="1"
            value={pricing.average_delivery_time}
            onChange={(e) => setPricing({ ...pricing, average_delivery_time: e.target.value })}
            placeholder="Ex: 7"
          />
          <small>Quanto tempo normalmente leva para completar um projeto?</small>
        </div>

        {/* Specialties */}
        <div className="form-group">
          <label>Especialidades</label>
          <div className="specialty-grid">
            {specialtyOptions.map(specialty => (
              <button
                key={specialty}
                type="button"
                className={`specialty-tag ${pricing.specialties.includes(specialty) ? 'active' : ''}`}
                onClick={() => toggleSpecialty(specialty)}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>

      <style jsx>{`
        .pricing-settings {
          max-width: 600px;
        }

        .subtitle {
          color: #666;
          margin-bottom: 30px;
        }

        .message {
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }

        .form-group small {
          display: block;
          color: #666;
          font-size: 13px;
          margin-top: 6px;
        }

        .input-with-prefix {
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 6px;
          overflow: hidden;
        }

        .prefix {
          padding: 10px 12px;
          background: #f5f5f5;
          border-right: 1px solid #ddd;
          font-weight: 600;
          color: #666;
        }

        .input-with-prefix input {
          border: none;
          flex: 1;
          padding: 10px 12px;
        }

        .specialty-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .specialty-tag {
          padding: 10px 16px;
          border: 2px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .specialty-tag:hover {
          border-color: #6C63FF;
          background: #f8f8ff;
        }

        .specialty-tag.active {
          border-color: #6C63FF;
          background: #6C63FF;
          color: white;
        }

        .btn-primary {
          width: 100%;
          padding: 12px;
          background: #6C63FF;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #5a52d5;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ArtistPricingSettings;