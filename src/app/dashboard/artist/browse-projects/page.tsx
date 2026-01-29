'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Calendar, DollarSign, Tag, Search, ArrowRight, X } from 'lucide-react'
import ApplicationModal from '@/components/artist/ApplicationModal'

interface ProjectData {
  id: string
  title: string
  description: string
  budget: number
  currency: string
  category: string
  deadline: string
  status: string
  created_at: string
  reference_images?: string[]
  applicationCount: number
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'interior', label: 'Interior Design' },
  { value: 'exterior', label: 'Facade/Exterior' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'urban', label: 'Urban Planning' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'other', label: 'Other' },
]

export default function BrowseProjectsPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([])
  const [message, setMessage] = useState('')
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [deadlineFilter, setDeadlineFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showFilters, setShowFilters] = useState(true)

  const getDaysUntilDeadline = (deadline: string): number => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getCategoryLabel = (value: string): string => {
    const category = categories.find(cat => cat.value === value)
    return category ? category.label : value
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const hasActiveFilters = (): boolean => {
    return searchTerm !== '' ||
      selectedCategory !== 'all' ||
      minBudget !== '' ||
      maxBudget !== '' ||
      deadlineFilter !== 'all' ||
      sortBy !== 'recent'
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setMinBudget('')
    setMaxBudget('')
    setDeadlineFilter('all')
    setSortBy('recent')
  }

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)

        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`*, applications ( id )`)
          .eq('status', 'open')
          .order('created_at', { ascending: false })

        if (projectsError) throw projectsError

        const projectsWithCounts = (projectsData || []).map((project: any) => ({
          ...project,
          applicationCount: project.applications?.length || 0,
          applications: undefined,
        }))

        setProjects(projectsWithCounts)
        setFilteredProjects(projectsWithCounts)
      } catch (error) {
        console.error('Error loading projects:', error)
        setMessage('Error loading projects')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filterProjects = useCallback(() => {
    let filtered = [...projects]

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower)
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory)
    }

    if (minBudget) {
      filtered = filtered.filter(project => project.budget >= parseFloat(minBudget))
    }
    if (maxBudget) {
      filtered = filtered.filter(project => project.budget <= parseFloat(maxBudget))
    }

    if (deadlineFilter !== 'all') {
      filtered = filtered.filter(project => {
        const daysLeft = getDaysUntilDeadline(project.deadline)
        if (deadlineFilter === 'urgent') return daysLeft <= 7 && daysLeft >= 0
        if (deadlineFilter === 'week') return daysLeft <= 14 && daysLeft >= 0
        if (deadlineFilter === 'month') return daysLeft <= 30 && daysLeft >= 0
        return true
      })
    }

    if (sortBy === 'budget-low') {
      filtered.sort((a, b) => a.budget - b.budget)
    } else if (sortBy === 'budget-high') {
      filtered.sort((a, b) => b.budget - a.budget)
    } else if (sortBy === 'deadline-soon') {
      filtered.sort((a, b) => getDaysUntilDeadline(a.deadline) - getDaysUntilDeadline(b.deadline))
    }

    setFilteredProjects(filtered)
  }, [searchTerm, selectedCategory, minBudget, maxBudget, deadlineFilter, sortBy, projects])

  useEffect(() => {
    filterProjects()
  }, [filterProjects])

  const handleApply = (project: ProjectData) => {
    setSelectedProject(project)
    setShowApplicationModal(true)
  }

  const handleApplicationSuccess = () => {
    setShowApplicationModal(false)
    setSelectedProject(null)
    setMessage('Application submitted successfully!')
    setTimeout(() => setMessage(''), 5000)
    setTimeout(() => {
      router.push('/dashboard/artist/applications')
    }, 2000)
  }

  const handleCloseModal = () => {
    setShowApplicationModal(false)
    setSelectedProject(null)
  }

  if (loading) {
    return <div className="loading">Loading projects...</div>
  }

  return (
    <div className="browse-projects-container">
      <h2 className="section-title">Explore Projects</h2>
      <p className="subtitle">Find interesting projects and submit your proposals</p>

      {message && <div className="message message-error">{message}</div>}

      <div className="search-filter-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-controls">
          <button
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters() && <span className="filter-badge">&bull;</span>}
          </button>

          <div className="sort-control">
            <label htmlFor="sort">Sort:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="recent">Most Recent</option>
              <option value="deadline-soon">Closest Deadline</option>
              <option value="budget-low">Lowest Budget</option>
              <option value="budget-high">Highest Budget</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="location-select"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Budget Range</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  className="price-input"
                  min="0"
                  step="100"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="price-input"
                  min="0"
                  step="100"
                />
              </div>
              {(minBudget || maxBudget) && (
                <div className="price-hint">
                  R$ {minBudget || 0} - R$ {maxBudget || '\u221E'}
                </div>
              )}
            </div>

            <div className="filter-group">
              <label>Delivery Deadline</label>
              <div className="rating-filter">
                <button
                  className={`rating-btn ${deadlineFilter === 'urgent' ? 'active' : ''}`}
                  onClick={() => setDeadlineFilter(deadlineFilter === 'urgent' ? 'all' : 'urgent')}
                >
                  Urgent (up to 7 days)
                </button>
                <button
                  className={`rating-btn ${deadlineFilter === 'week' ? 'active' : ''}`}
                  onClick={() => setDeadlineFilter(deadlineFilter === 'week' ? 'all' : 'week')}
                >
                  Up to 2 weeks
                </button>
                <button
                  className={`rating-btn ${deadlineFilter === 'month' ? 'active' : ''}`}
                  onClick={() => setDeadlineFilter(deadlineFilter === 'month' ? 'all' : 'month')}
                >
                  Up to 1 month
                </button>
              </div>
            </div>

            {hasActiveFilters() && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="results-count">
        {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">
            {hasActiveFilters() ? 'No projects found with these filters' : 'No projects available at the moment'}
          </p>
          <p className="empty-state-text">
            {hasActiveFilters() ? (
              <button className="btn-secondary" onClick={clearFilters}>Clear Filters</button>
            ) : (
              'There are no open projects at the moment. Come back soon!'
            )}
          </p>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => {
            const daysLeft = getDaysUntilDeadline(project.deadline)
            const isUrgent = daysLeft <= 7

            return (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <div className="category-badge">
                    <Tag size={14} />
                    {getCategoryLabel(project.category)}
                  </div>
                  {isUrgent && <div className="urgent-badge">Urgent</div>}
                </div>

                <h3 className="project-card-title">{project.title}</h3>

                <p className="project-card-description">
                  {project.description.length > 150
                    ? project.description.substring(0, 150) + '...'
                    : project.description}
                </p>

                <div className="project-card-details">
                  <div className="detail-row">
                    <DollarSign size={16} />
                    <span className="detail-text">
                      {project.currency} {project.budget?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="detail-row">
                    <Calendar size={16} />
                    <span className={`detail-text ${isUrgent ? 'text-urgent' : ''}`}>
                      {formatDate(project.deadline)}
                      {daysLeft >= 0 && ` (${daysLeft} day${daysLeft !== 1 ? 's' : ''})`}
                    </span>
                  </div>
                </div>

                {project.reference_images && project.reference_images.length > 0 && (
                  <div className="reference-images-preview">
                    {project.reference_images.slice(0, 3).map((img, index) => (
                      <div key={index} className="reference-thumbnail">
                        <img src={img} alt={`Reference ${index + 1}`} />
                      </div>
                    ))}
                    {project.reference_images.length > 3 && (
                      <div className="more-images">+{project.reference_images.length - 3}</div>
                    )}
                  </div>
                )}

                <div className="project-card-footer">
                  <p className="applications-count">{project.applicationCount} application(s)</p>
                  <button className="btn-primary" onClick={() => handleApply(project)}>
                    Apply <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showApplicationModal && selectedProject && profile && (
        <ApplicationModal
          project={selectedProject}
          artistId={profile.id}
          onClose={handleCloseModal}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  )
}
