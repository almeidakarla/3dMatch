'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { formatPrivateName } from '@/utils/nameFormatter';

interface Project {
  id: string;
  applicationId: string;
  title: string;
  description: string;
  deadline: string;
  architect: {
    id: string;
    full_name: string;
  };
  quoted_price: number;
  delivery_status: string;
  current_round: number;
}

interface AvailableProject {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  deadline: string;
  status: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    location: string;
  };
}

export default function ArtistDashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [availableProjects, setAvailableProjects] = useState<AvailableProject[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Load active projects (accepted applications)
      const { data: activeApps, error: activeError } = await supabase
        .from('applications')
        .select(`
          id,
          project_id,
          quoted_price,
          delivery_status,
          current_round,
          status,
          projects (
            id,
            title,
            description,
            deadline,
            architect_id,
            profiles!projects_architect_id_fkey (
              id,
              full_name
            )
          )
        `)
        .eq('artist_id', user?.id)
        .in('status', ['accepted', 'accepted_paid', 'in_progress'])
        .neq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activeError) throw activeError;

      const active = activeApps?.map((app: any) => ({
        id: app.projects.id,
        applicationId: app.id,
        title: app.projects.title,
        description: app.projects.description,
        deadline: app.projects.deadline,
        architect: app.projects.profiles,
        quoted_price: app.quoted_price,
        delivery_status: app.delivery_status,
        current_round: app.current_round || 1
      })) || [];

      setActiveProjects(active);

      // Load available projects (no artist chosen yet)
      const { data: availableProjectsData, error: availableError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          budget,
          currency,
          deadline,
          status,
          created_at,
          profiles!projects_architect_id_fkey (
            id,
            full_name,
            location
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(6);

      if (availableError) throw availableError;

      // Filter out projects the artist has already applied to
      const { data: myApplications } = await supabase
        .from('applications')
        .select('project_id')
        .eq('artist_id', user?.id);

      const appliedProjectIds = myApplications?.map((app: any) => app.project_id) || [];

      const available = (availableProjectsData?.filter(
        (project: any) => !appliedProjectIds.includes(project.id)
      ) || []).map((project: any) => ({
        ...project,
        profiles: Array.isArray(project.profiles) ? project.profiles[0] : project.profiles,
      }));

      setAvailableProjects(available);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id, loadDashboardData]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="artist-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {profile?.full_name || 'Artist'}! 👋</h1>
      </div>

      {/* Active Projects Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Active Projects</h2>
          <button
            className="btn-view-all"
            onClick={() => router.push('/dashboard/artist/projects')}
          >
            View All
          </button>
        </div>

        {activeProjects.length === 0 ? (
          <div className="empty-state-card">
            <p className="empty-icon">📋</p>
            <p className="empty-title">No active projects yet</p>
            <p className="empty-text">When you're selected for a project, it will appear here</p>
            <button
              className="btn-browse"
              onClick={() => router.push('/dashboard/artist/browse-projects')}
            >
              Browse Available Projects
            </button>
          </div>
        ) : (
          <div className="projects-row">
            {activeProjects.map((project) => (
              <div key={project.id} className="project-card" onClick={() => router.push(`/dashboard/artist/project/${project.id}`)}>
                <div className="project-card-header">
                  <h3 className="project-card-title">{project.title}</h3>
                  <span className={`status-badge badge-${project.delivery_status || 'in_progress'}`}>
                    Round {project.current_round}/3
                  </span>
                </div>
                <p className="project-card-description">{project.description}</p>
                <div className="project-card-footer">
                  <div className="project-info-item">
                    <span className="info-label">Client</span>
                    <span className="info-value">{formatPrivateName(project.architect?.full_name)}</span>
                  </div>
                  <div className="project-info-item">
                    <span className="info-label">Deadline</span>
                    <span className="info-value">{formatDate(project.deadline)}</span>
                  </div>
                  <div className="project-info-item">
                    <span className="info-label">Amount</span>
                    <span className="info-value">${project.quoted_price?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available Projects Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Available Projects</h2>
          <button
            className="btn-view-all"
            onClick={() => router.push('/dashboard/artist/browse-projects')}
          >
            View All
          </button>
        </div>

        {availableProjects.length === 0 ? (
          <div className="empty-state-card">
            <p className="empty-icon">🔍</p>
            <p className="empty-title">No available projects right now</p>
            <p className="empty-text">Check back soon for new opportunities</p>
          </div>
        ) : (
          <div className="projects-grid">
            {availableProjects.map((project) => (
              <div key={project.id} className="available-project-card">
                <div className="card-header">
                  <h3 className="card-title">{project.title}</h3>
                  <span className="budget-badge">
                    ${project.budget?.toLocaleString('en-US')}
                  </span>
                </div>
                <p className="card-description">{project.description}</p>
                <div className="card-meta">
                  <span className="meta-item">📍 {project.profiles?.location || 'Remote'}</span>
                  <span className="meta-item">📅 {formatDate(project.deadline)}</span>
                </div>
                <button
                  className="btn-apply"
                  onClick={() => router.push('/dashboard/artist/browse-projects')}
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .artist-dashboard {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          font-size: 1.1rem;
          color: #666;
        }

        .dashboard-header {
          margin-bottom: 2.5rem;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        :global(body.dark-mode) .dashboard-header h1 {
          color: #ffffff;
        }

        .dashboard-subtitle {
          font-size: 1.1rem;
          color: #666;
          margin: 0;
        }

        .dashboard-section {
          margin-bottom: 3rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          font-size: 1.75rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        :global(body.dark-mode) .section-header h2 {
          color: #ffffff;
        }

        .btn-view-all {
          padding: 0.5rem 1rem;
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-view-all:hover {
          background: #667eea;
          color: white;
        }

        .empty-state-card {
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.5rem;
        }

        :global(body.dark-mode) .empty-title {
          color: #ffffff;
        }

        .empty-text {
          color: #6c757d;
          margin-bottom: 1.5rem;
        }

        .btn-browse {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-browse:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .projects-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          overflow-x: auto;
        }

        .project-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .project-card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .project-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          flex: 1;
        }

        :global(body.dark-mode) .project-card-title {
          color: #ffffff;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          background: #e7f3ff;
          color: #0066cc;
        }

        .project-card-description {
          color: #495057;
          margin-bottom: 1rem;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .project-card-footer {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .project-info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-label {
          font-size: 0.75rem;
          color: #6c757d;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 0.95rem;
          color: #1a1a1a;
          font-weight: 600;
        }

        :global(body.dark-mode) .info-value {
          color: #ffffff;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .available-project-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
        }

        .available-project-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          flex: 1;
        }

        :global(body.dark-mode) .card-title {
          color: #ffffff;
        }

        .budget-badge {
          padding: 0.375rem 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .card-description {
          color: #495057;
          margin-bottom: 1rem;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .card-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .meta-item {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .btn-apply {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-apply:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .artist-dashboard {
            padding: 1rem;
          }

          .dashboard-header h1 {
            font-size: 1.75rem;
          }

          .section-header h2 {
            font-size: 1.5rem;
          }

          .projects-row {
            grid-template-columns: 1fr;
          }

          .projects-grid {
            grid-template-columns: 1fr;
          }

          .project-card-footer {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
