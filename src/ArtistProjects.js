// ArtistProjects.js
// Save as: src/ArtistProjects.js

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ArtistProjects = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [deliveryForm, setDeliveryForm] = useState({
    files: [],
    note: '',
    round: 1
  });

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    try {
      // Get projects from accepted applications
      const { data: acceptedApps, error: appsError } = await supabase
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
        .eq('status', 'accepted');

      if (appsError) throw appsError;

      // Get projects from package orders
      const { data: packageOrders, error: ordersError } = await supabase
        .from('package_orders')
        .select(`
          *,
          architect:architect_id (
            full_name,
            email
          )
        `)
        .eq('artist_id', userId)
        .in('status', ['pending', 'in_progress', 'delivered']);

      if (ordersError) throw ordersError;

      // Combine both sources
      const allProjects = [
        ...(acceptedApps?.map(app => ({
          id: app.projects.id,
          type: 'application',
          title: app.projects.title,
          description: app.projects.description,
          deadline: app.projects.deadline,
          status: app.projects.status,
          architect: app.projects.architect,
          quoted_price: app.quoted_price,
          delivery_timeline: app.delivery_timeline,
          created_at: app.created_at
        })) || []),
        ...(packageOrders?.map(order => ({
          id: order.id,
          type: 'package',
          title: order.project_description,
          description: order.project_description,
          deadline: order.delivery_date,
          status: order.status,
          architect: order.architect,
          quoted_price: order.price,
          created_at: order.created_at
        })) || [])
      ];

      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setMessage('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setDeliveryForm(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index) => {
    setDeliveryForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleDeliverWork = async () => {
    if (deliveryForm.files.length === 0) {
      setMessage('Por favor, selecione pelo menos um arquivo');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const fileUrls = [];

      // Upload files
      for (const file of deliveryForm.files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${selectedProject.id}/round-${deliveryForm.round}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('project-deliverables')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('project-deliverables')
          .getPublicUrl(fileName);

        fileUrls.push(urlData.publicUrl);
      }

      // Save delivery record
      const { error: insertError } = await supabase
        .from('project_deliveries')
        .insert({
          project_id: selectedProject.id,
          artist_id: userId,
          round: deliveryForm.round,
          files: fileUrls,
          note: deliveryForm.note,
          status: 'pending_review'
        });

      if (insertError) throw insertError;

      // Update project status to 'delivered'
      if (selectedProject.type === 'application') {
        await supabase
          .from('projects')
          .update({ status: 'delivered' })
          .eq('id', selectedProject.id);
      } else {
        await supabase
          .from('package_orders')
          .update({ status: 'delivered' })
          .eq('id', selectedProject.id);
      }

      setMessage('✅ Trabalho entregue com sucesso!');
      setDeliveryForm({ files: [], note: '', round: 1 });
      setSelectedProject(null);
      await loadProjects();
    } catch (error) {
      console.error('Error delivering work:', error);
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'Aguardando Início',
      in_progress: 'Em Progresso',
      delivered: 'Entregue',
      completed: 'Concluído'
    };
    return badges[status] || status;
  };

  if (loading) {
    return <div className="loading">Carregando projetos...</div>;
  }

  if (selectedProject) {
    return (
      <div>
        <button onClick={() => setSelectedProject(null)} className="btn-back">
          ← Voltar aos Projetos
        </button>

        <div className="project-delivery-container">
          <h2 className="section-title">{selectedProject.title}</h2>
          
          {message && (
            <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}

          <div className="project-info-card">
            <div className="project-info-item">
              <span className="project-info-label">Cliente:</span>
              <span className="project-info-value-medium">{selectedProject.architect.full_name}</span>
            </div>
            <div className="project-info-item">
              <span className="project-info-label">Valor:</span>
              <span className="project-info-value-medium">
                R$ {selectedProject.quoted_price?.toFixed(2)}
              </span>
            </div>
            {selectedProject.deadline && (
              <div className="project-info-item">
                <span className="project-info-label">Prazo:</span>
                <span className="project-info-value-medium">
                  {new Date(selectedProject.deadline).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>

          <div className="delivery-form-card">
            <h3 className="form-card-title">Entregar Trabalho</h3>

            <div className="form-group">
              <label className="form-label">Rodada de Entrega</label>
              <select
                value={deliveryForm.round}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, round: parseInt(e.target.value) })}
                className="form-select"
              >
                <option value={1}>Rodada 1 - Primeira Entrega</option>
                <option value={2}>Rodada 2 - Revisão</option>
                <option value={3}>Rodada 3 - Revisão Final</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Arquivos *</label>
              <label className="file-upload-area">
                <div className="file-upload-content">
                  <p className="file-upload-text">📁 Clique para adicionar arquivos</p>
                  <p className="file-upload-hint">Renders finais em alta resolução</p>
                </div>
                <input
                  type="file"
                  accept="image/*,.zip,.rar"
                  multiple
                  onChange={handleFileSelect}
                  className="file-input-hidden"
                />
              </label>

              {deliveryForm.files.length > 0 && (
                <div className="selected-files-list">
                  {deliveryForm.files.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="file-remove-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Nota para o Cliente (Opcional)</label>
              <textarea
                value={deliveryForm.note}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, note: e.target.value })}
                placeholder="Descreva o que foi entregue, mudanças feitas, etc..."
                rows="4"
                className="form-textarea"
              />
            </div>

            <div className="form-actions">
              <button
                onClick={handleDeliverWork}
                disabled={uploading || deliveryForm.files.length === 0}
                className="btn-primary"
              >
                {uploading ? 'Enviando...' : 'Entregar Trabalho'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="artist-projects-container">
      <h2 className="section-title">Meus Projetos</h2>
      <p className="subtitle">Projetos em andamento e concluídos</p>

      {message && (
        <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
          {message}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">Nenhum projeto ativo</p>
          <p className="empty-state-text">
            Quando você for selecionado para um projeto, ele aparecerá aqui
          </p>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map(project => (
            <div key={`${project.type}-${project.id}`} className="project-card-artist">
              <div className="project-card-header">
                <h3 className="project-card-title">{project.title}</h3>
                <span className={`badge badge-${project.status}`}>
                  {getStatusBadge(project.status)}
                </span>
              </div>

              <div className="project-card-body">
                <p className="project-card-description">{project.description}</p>

                <div className="project-card-info">
                  <div className="info-item">
                    <span className="info-label">Cliente:</span>
                    <span className="info-value">{project.architect.full_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Valor:</span>
                    <span className="info-value">R$ {project.quoted_price?.toFixed(2)}</span>
                  </div>
                  {project.deadline && (
                    <div className="info-item">
                      <span className="info-label">Prazo:</span>
                      <span className="info-value">
                        {new Date(project.deadline).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="project-card-actions">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="btn-primary"
                >
                  Entregar Trabalho
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistProjects;