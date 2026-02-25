'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { formatPrivateName } from '@/utils/nameFormatter';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  deadline: string;
  status: string;
  created_at: string;
  applicationCount: number;
}

interface Artist {
  id: string;
  full_name: string;
  bio: string;
  location: string;
  profile_photo: string;
  software: string[];
  portfolio_images: string[];
}

interface AuthUser {
  id: string;
}

interface AuthProfile {
  full_name: string;
}

const ArchitectDashboard = () => {
  const router = useRouter();
  const { user, profile } = useAuth() as { user: AuthUser | null; profile: AuthProfile | null };
  const [loading, setLoading] = useState<boolean>(true);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Load active projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          budget,
          currency,
          deadline,
          status,
          created_at
        `)
        .eq('architect_id', user!.id)
        .neq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);

      if (projectsError) throw projectsError;

      // For each project, count applications
      const projectsWithApps = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { count, error: countError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          if (countError) console.error('Error counting applications:', countError);

          return {
            ...project,
            applicationCount: count || 0
          };
        })
      );

      setActiveProjects(projectsWithApps);

      // Load featured artists (approved artists with portfolios)
      const { data: artistsData, error: artistsError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          bio,
          location,
          profile_photo,
          software
        `)
        .eq('user_type', 'artista')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (artistsError) {
        console.error('Error loading artists:', artistsError);
        throw artistsError;
      }

      console.log('Artists loaded:', artistsData?.length || 0);

      // For each artist, get their portfolio images
      const artistsWithPortfolios = await Promise.all(
        (artistsData || []).map(async (artist) => {
          const { data: portfolioData, error: portfolioError } = await supabase
            .from('portfolio')
            .select('image_url')
            .eq('artist_id', artist.id)
            .order('created_at', { ascending: false })
            .limit(3);

          if (portfolioError) {
            console.error('Error loading portfolio for artist:', artist.id, portfolioError);
          }

          console.log(`Portfolio for ${artist.full_name}:`, portfolioData?.length || 0, 'images');

          return {
            ...artist,
            portfolio_images: portfolioData?.map((p) => p.image_url) || []
          };
        })
      );

      // Show all artists, not just those with portfolios
      console.log('Total artists to display:', artistsWithPortfolios.length);
      setFeaturedArtists(artistsWithPortfolios.slice(0, 6));
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

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      open: '#28a745',
      in_progress: '#ffc107',
      completed: '#6c757d',
      canceled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="architect-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {profile?.full_name || 'Architect'}! 👋</h1>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="action-card action-primary"
          onClick={() => router.push('/dashboard/architect/post-project')}
        >
          <span className="action-icon">➕</span>
          <div className="action-content">
            <h3>Post New Project</h3>
            <p>Start receiving applications from artists</p>
          </div>
        </button>
        <button
          className="action-card action-secondary"
          onClick={() => router.push('/dashboard/architect/browse-artists')}
        >
          <span className="action-icon">🎨</span>
          <div className="action-content">
            <h3>Browse Artists</h3>
            <p>Explore portfolios and find the perfect match</p>
          </div>
        </button>
      </div>

      {/* Active Projects Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Active Projects</h2>
          <button
            className="btn-view-all"
            onClick={() => router.push('/dashboard/architect/projects')}
          >
            View All
          </button>
        </div>

        {activeProjects.length === 0 ? (
          <div className="empty-state-card">
            <p className="empty-icon">📋</p>
            <p className="empty-title">No active projects</p>
            <p className="empty-text">Post your first project to start receiving applications from talented 3D artists</p>
            <button
              className="btn-post-project"
              onClick={() => router.push('/dashboard/architect/post-project')}
            >
              Post New Project
            </button>
          </div>
        ) : (
          <div className="projects-row">
            {activeProjects.map((project) => (
              <div key={project.id} className="project-card" onClick={() => router.push(`/dashboard/architect/project/${project.id}`)}>
                <div className="project-card-header">
                  <h3 className="project-card-title">{project.title}</h3>
                  <span
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                    title={project.status}
                  />
                </div>
                <p className="project-card-description">{project.description}</p>
                <div className="project-card-footer">
                  <div className="project-info-item">
                    <span className="info-label">Budget</span>
                    <span className="info-value">
                      {project.currency?.toUpperCase()} {project.budget?.toLocaleString()}
                    </span>
                  </div>
                  <div className="project-info-item">
                    <span className="info-label">Deadline</span>
                    <span className="info-value">{formatDate(project.deadline)}</span>
                  </div>
                  <div className="project-info-item">
                    <span className="info-label">Applications</span>
                    <span className="info-value">{project.applicationCount}</span>
                  </div>
                </div>
                {project.applicationCount > 0 && (
                  <div className="applications-alert">
                    {project.applicationCount} new application{project.applicationCount > 1 ? 's' : ''} to review
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Artists Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Featured Artists</h2>
          <button
            className="btn-view-all"
            onClick={() => router.push('/dashboard/architect/browse-artists')}
          >
            View All
          </button>
        </div>

        {featuredArtists.length === 0 ? (
          <div className="empty-state-card">
            <p className="empty-icon">👨‍🎨</p>
            <p className="empty-title">No artists available</p>
            <p className="empty-text">Check back soon to discover talented 3D artists</p>
          </div>
        ) : (
          <div className="artists-grid">
            {featuredArtists.map((artist) => (
              <div key={artist.id} className="artist-card" onClick={() => router.push('/dashboard/architect/browse-artists')}>
                <div className="artist-photo">
                  {artist.profile_photo ? (
                    <img src={artist.profile_photo} alt={artist.full_name} />
                  ) : (
                    <div className="photo-placeholder">
                      {artist.full_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="artist-info">
                  <h3 className="artist-name">{formatPrivateName(artist.full_name)}</h3>
                  {artist.location && (
                    <p className="artist-location">📍 {artist.location}</p>
                  )}
                  {artist.bio && (
                    <p className="artist-bio">{artist.bio}</p>
                  )}
                  {artist.software && artist.software.length > 0 && (
                    <div className="artist-skills">
                      {artist.software.slice(0, 3).map((software, index) => (
                        <span key={index} className="skill-tag">{software}</span>
                      ))}
                    </div>
                  )}
                </div>
                {artist.portfolio_images && artist.portfolio_images.length > 0 && (
                  <div className="artist-portfolio-preview">
                    {artist.portfolio_images.slice(0, 3).map((image, index) => (
                      <div key={index} className="portfolio-thumbnail">
                        <img src={image} alt={`Portfolio ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn-view-artist">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .architect-dashboard {
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
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          font-size: 1.1rem;
          color: #666;
          margin: 0;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .action-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .action-secondary {
          background: white;
          border: 2px solid #667eea;
          color: #1a1a1a;
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .action-icon {
          font-size: 2.5rem;
        }

        .action-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }

        .action-content p {
          font-size: 0.95rem;
          margin: 0;
          opacity: 0.9;
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

        .btn-view-all {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-view-all:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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

        .empty-text {
          color: #6c757d;
          margin-bottom: 1.5rem;
        }

        .btn-post-project {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-post-project:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .projects-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .project-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          transition: all 0.2s;
          cursor: pointer;
          position: relative;
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

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 0.5rem;
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

        .applications-alert {
          margin-top: 1rem;
          padding: 0.75rem;
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border-left: 3px solid #667eea;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #667eea;
        }

        .artists-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .artist-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          transition: all 0.2s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .artist-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .artist-photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto;
        }

        .artist-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 600;
        }

        .artist-info {
          text-align: center;
        }

        .artist-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.5rem 0;
        }

        .artist-location {
          font-size: 0.875rem;
          color: #6c757d;
          margin: 0 0 0.5rem 0;
        }

        .artist-bio {
          font-size: 0.9rem;
          color: #495057;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }

        .artist-skills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 0.75rem;
        }

        .skill-tag {
          padding: 0.25rem 0.75rem;
          background: #e7f3ff;
          color: #0066cc;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .artist-portfolio-preview {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .portfolio-thumbnail {
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          background: #f8f9fa;
        }

        .portfolio-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-view-artist {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: auto;
        }

        .btn-view-artist:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .architect-dashboard {
            padding: 1rem;
          }

          .dashboard-header h1 {
            font-size: 1.75rem;
          }

          .section-header h2 {
            font-size: 1.5rem;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }

          .projects-row {
            grid-template-columns: 1fr;
          }

          .artists-grid {
            grid-template-columns: 1fr;
          }

          .project-card-footer {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ArchitectDashboard;
