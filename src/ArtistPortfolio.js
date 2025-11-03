// ArtistPortfolio.js
// Save this as: src/ArtistPortfolio.js

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ArtistPortfolio = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    preview: null
  });

  useEffect(() => {
    loadPortfolio();
  }, [userId]);

  const loadPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('artist_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolio(data || []);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      setMessage('Erro ao carregar portfólio');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage('A imagem deve ter no máximo 10MB');
      return;
    }

    const preview = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, file, preview }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file && !editingItem) {
      setMessage('Por favor, selecione uma imagem');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      let imageUrl = editingItem?.image_url;

      // Upload new image if file was selected
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${userId}/portfolio/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, formData.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      const portfolioData = {
        artist_id: userId,
        title: formData.title,
        description: formData.description,
        image_url: imageUrl
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('portfolio')
          .update(portfolioData)
          .eq('id', editingItem.id);

        if (error) throw error;
        setMessage('✅ Item atualizado com sucesso!');
      } else {
        // Insert new item
        const { error } = await supabase
          .from('portfolio')
          .insert(portfolioData);

        if (error) throw error;
        setMessage('✅ Imagem adicionada ao portfólio!');
      }

      // Reset form
      resetForm();
      await loadPortfolio();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving portfolio item:', error);
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      file: null,
      preview: item.image_url
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta imagem?')) return;

    try {
      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage('✅ Imagem removida do portfólio');
      await loadPortfolio();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      setMessage(`❌ Erro ao deletar: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      file: null,
      preview: null
    });
    setShowAddForm(false);
    setEditingItem(null);
    if (formData.preview && formData.file) {
      URL.revokeObjectURL(formData.preview);
    }
  };

  if (loading) {
    return <div className="loading">Carregando portfólio...</div>;
  }

  return (
    <div className="artist-portfolio-manager">
      <div className="portfolio-header">
        <div>
          <h2 className="section-title">Meu Portfólio</h2>
          <p className="subtitle">
            Mostre seu melhor trabalho aos arquitetos
          </p>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            + Adicionar Imagem
          </button>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
          {message}
        </div>
      )}

      {showAddForm && (
        <div className="portfolio-form-card">
          <h3 className="form-card-title">
            {editingItem ? 'Editar Imagem' : 'Adicionar Nova Imagem'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Imagem *</label>
              {formData.preview ? (
                <div className="image-upload-preview">
                  <img src={formData.preview} alt="Preview" />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.file) URL.revokeObjectURL(formData.preview);
                      setFormData(prev => ({ ...prev, file: null, preview: null }));
                    }}
                    className="preview-remove-btn"
                  >
                    Remover Imagem
                  </button>
                </div>
              ) : (
                <label className="file-upload-area">
                  <div className="file-upload-content">
                    <p className="file-upload-text">📸 Clique para selecionar uma imagem</p>
                    <p className="file-upload-hint">JPG, PNG ou GIF (máx. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file-input-hidden"
                  />
                </label>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Título do Projeto *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Casa Moderna em São Paulo"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descrição (Opcional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o projeto, técnicas utilizadas, softwares..."
                rows="4"
                className="form-textarea"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={uploading}
                className="btn-primary"
              >
                {uploading ? 'Salvando...' : editingItem ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="portfolio-grid">
        {portfolio.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">Seu portfólio está vazio</p>
            <p className="empty-state-text">
              Adicione seus melhores trabalhos para impressionar arquitetos!
            </p>
          </div>
        ) : (
          portfolio.map(item => (
            <div key={item.id} className="portfolio-item-card">
              <div className="portfolio-image-wrapper">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="portfolio-image"
                />
              </div>
              <div className="portfolio-item-content">
                <h4 className="portfolio-item-title">{item.title}</h4>
                {item.description && (
                  <p className="portfolio-item-description">{item.description}</p>
                )}
                <div className="portfolio-item-actions">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="btn-edit"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="btn-delete"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArtistPortfolio;