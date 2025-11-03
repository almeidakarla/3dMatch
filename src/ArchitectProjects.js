// ArchitectProjects.js
// Save as: src/ArchitectProjects.js

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ArchitectProjects = ({ userId, onViewDetails }) => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          applications (
            count
          )
        `)
        .eq('architect_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count applications for each project
      const projectsWithCounts = await Promise.all(
        (data || []).map(async (project) => {
          const { count } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          return { ...project, applications_count: count || 0 };
        })
      );

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error loading projects:', error);
      setMessage('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Tem certeza que deseja deletar este projeto? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setMessage('✅ Projeto deletado com sucesso');
      await loadProjects();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting project:', error);
      setMessage('❌ Erro ao deletar projeto');
    }
  };

  const handleCloseProject = async (projectId) => {
    if (!window.confirm('Deseja fechar este projeto? Não receberá mais propostas.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'closed' })
        .eq('id', projectId);

      if (error) throw error;

      setMessage('✅ Projeto fechado com sucesso');
      await loadProjects();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error closing project:', error);
      setMessage('❌ Erro ao fechar projeto');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { label: 'Aberto', class: 'badge-open' },
      in_progress: { label: 'Em Andamento', class: 'badge-in_progress' },
      delivered: { label: 'Entregue', class: 'badge-completed' },
      completed: { label: 'Concluído', class: 'badge-completed' },
      closed: { label: 'Fechado', class: 'status-expired' }
    };
    return badges[status] || badges.open;
  };

  const getCategoryLabel = (category) => {
    const categories = {
      residential: 'Residencial',
      commercial: 'Comercial',
      interior: 'Design de Interiores',
      landscape: 'Paisagismo',
      urban: 'Urbanismo',
      other: 'Outro'
    };
    return categories[category] || category;
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  if (loading) {
    return <div className="loading">Carregando projetos...</div>;
  }

  return (
    <div className="architect-projects-container">
      <div className="projects-header">
        <div>
          <h2 className="section-title">Meus Projetos</h2>
          <p className="subtitle">Gerencie suas solicitações de renderização</p>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
          {message}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({projects.length})
        </button>
        <button
          className={`filter-tab ${filter === 'open' ? 'active' : ''}`}
          onClick={() => setFilter('open')}
        >
          Abertos ({projects.filter(p => p.status === 'open').length})
        </button>
        <button
          className={`filter-tab ${filter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          Em Andamento ({projects.filter(p => p.status === 'in_progress').length})
        </button>
        <button
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Concluídos ({projects.filter(p => p.status === 'completed').length})
        </button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">
            {filter === 'all' ? 'Nenhum projeto ainda' : `Nenhum projeto ${getStatusBadge(filter).label.toLowerCase()}`}
          </p>
          <p className="empty-state-text">
            {filter === 'all' && 'Poste seu primeiro projeto para receber propostas de artistas 3D!'}
          </p>
        </div>
      ) : (
        <div className="architect-projects-grid">
          {filteredProjects.map(project => {
            const statusBadge = getStatusBadge(project.status);

            return (
              <div key={project.id} className="architect-project-card">
                <div className="architect-project-header">
                  <span className={`badge ${statusBadge.class}`}>
                    {statusBadge.label}
                  </span>
                  <span className="project-category-badge">
                    {getCategoryLabel(project.category)}
                  </span>
                </div>

                <h3 className="architect-project-title">{project.title}</h3>
                <p className="architect-project-description">
                  {project.description.length > 150
                    ? `${project.description.substring(0, 150)}...`
                    : project.description}
                </p>

                <div className="architect-project-stats">
                  <div className="stat-item">
                    <span className="stat-label">Propostas:</span>
                    <span className="stat-value">{project.applications_count}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Prazo:</span>
                    <span className="stat-value">
                      {new Date(project.deadline).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Publicado:</span>
                    <span className="stat-value">
                      {new Date(project.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {project.reference_images && project.reference_images.length > 0 && (
                  <div className="project-thumbnails">
                    {project.reference_images.slice(0, 3).map((img, idx) => (
                      <img key={idx} src={img} alt={`Ref ${idx + 1}`} className="thumbnail" />
                    ))}
                    {project.reference_images.length > 3 && (
                      <div className="thumbnail-more">
                        +{project.reference_images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="architect-project-actions">
                  <button
                    onClick={() => onViewDetails(project)}
                    className="btn-primary btn-small"
                  >
                    Ver Detalhes
                    {project.applications_count > 0 && (
                      <span className="action-badge">{project.applications_count}</span>
                    )}
                  </button>

                  {project.status === 'open' && (
                    <button
                      onClick={() => handleCloseProject(project.id)}
                      className="btn-secondary btn-small"
                    >
                      Fechar
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="btn-delete btn-small"
                  >
                    Deletar
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

export default ArchitectProjects;