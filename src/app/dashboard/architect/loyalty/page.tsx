'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Award, Gift, TrendingUp, CheckCircle } from 'lucide-react'

interface Milestone {
  id: string
  milestone_number: number
  discount_amount: number
  reached_at: string
  processed: boolean
}

const PROJECTS_PER_DISCOUNT = 10

export default function LoyaltyProgramPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [loyaltyData, setLoyaltyData] = useState({
    completedProjects: 0,
    discountEarned: 0,
    discountUsed: 0,
    averageProjectCost: 0,
    lastMilestoneReachedAt: null as string | null,
  })
  const [milestones, setMilestones] = useState<Milestone[]>([])

  useEffect(() => {
    if (user?.id) { loadLoyaltyData() } else { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const loadLoyaltyData = async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      setLoading(true)
      const { data: loyaltyRecord, error: loyaltyError } = await supabase
        .from('loyalty_program').select('*').eq('architect_id', user.id).single()
      if (loyaltyError && loyaltyError.code !== 'PGRST116') throw loyaltyError
      if (loyaltyRecord) {
        setLoyaltyData({
          completedProjects: loyaltyRecord.completed_projects || 0,
          discountEarned: loyaltyRecord.discount_earned || 0,
          discountUsed: loyaltyRecord.discount_used || 0,
          averageProjectCost: loyaltyRecord.average_project_cost || 0,
          lastMilestoneReachedAt: loyaltyRecord.last_milestone_reached_at,
        })
      }
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('loyalty_milestones').select('*').eq('architect_id', user.id).order('reached_at', { ascending: false })
      if (milestonesError) throw milestonesError
      setMilestones(milestonesData || [])
    } catch (error) {
      console.error('Error loading loyalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = () => {
    const projectsInCurrentCycle = loyaltyData.completedProjects % PROJECTS_PER_DISCOUNT
    const progressPercentage = (projectsInCurrentCycle / PROJECTS_PER_DISCOUNT) * 100
    const projectsRemaining = PROJECTS_PER_DISCOUNT - projectsInCurrentCycle
    return { projectsInCurrentCycle, progressPercentage, projectsRemaining }
  }

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BRL' }).format(value || 0)

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  if (loading) return <div className="loading">Loading loyalty program...</div>

  const progress = calculateProgress()
  const discountAvailable = loyaltyData.discountEarned - loyaltyData.discountUsed

  return (
    <div className="loyalty-program-container">
      <div className="loyalty-header">
        <h2 className="section-title"><Award size={28} /> Loyalty Program</h2>
        <p className="subtitle">Complete 10 projects and earn a discount equal to the average of the amounts spent!</p>
      </div>

      <div className="loyalty-stats-grid">
        <div className="loyalty-card loyalty-card-primary">
          <div className="loyalty-card-icon"><CheckCircle size={32} /></div>
          <div className="loyalty-card-content">
            <h3 className="loyalty-card-value">{loyaltyData.completedProjects}</h3>
            <p className="loyalty-card-label">Completed Projects</p>
          </div>
        </div>
        <div className="loyalty-card loyalty-card-success">
          <div className="loyalty-card-icon"><Gift size={32} /></div>
          <div className="loyalty-card-content">
            <h3 className="loyalty-card-value">{formatCurrency(discountAvailable)}</h3>
            <p className="loyalty-card-label">Available Discount</p>
          </div>
        </div>
        <div className="loyalty-card loyalty-card-info">
          <div className="loyalty-card-icon"><TrendingUp size={32} /></div>
          <div className="loyalty-card-content">
            <h3 className="loyalty-card-value">{formatCurrency(loyaltyData.discountEarned)}</h3>
            <p className="loyalty-card-label">Total Discounts Earned</p>
          </div>
        </div>
      </div>

      <div className="loyalty-progress-section">
        <h3 className="loyalty-section-title">Progress to Next Discount</h3>
        <div className="loyalty-progress-info">
          <span className="loyalty-progress-label">{progress.projectsInCurrentCycle} of {PROJECTS_PER_DISCOUNT} projects</span>
          <span className="loyalty-progress-remaining">{progress.projectsRemaining} project{progress.projectsRemaining !== 1 ? 's' : ''} remaining</span>
        </div>
        <div className="loyalty-progress-bar-container">
          <div className="loyalty-progress-bar-fill" style={{ width: `${progress.progressPercentage}%` }}>
            {progress.progressPercentage > 10 && <span className="loyalty-progress-percentage">{Math.round(progress.progressPercentage)}%</span>}
          </div>
        </div>
        <div className="loyalty-milestones-markers">
          {[...Array(PROJECTS_PER_DISCOUNT + 1)].map((_, index) => (
            <div key={index} className={`loyalty-milestone-marker ${index <= progress.projectsInCurrentCycle ? 'reached' : ''}`} />
          ))}
        </div>
      </div>

      {loyaltyData.averageProjectCost > 0 && (
        <div className="loyalty-info-box">
          <h3 className="loyalty-section-title">Your Next Discount</h3>
          <p>Based on the average of your completed projects, your next discount will be approximately <strong>{formatCurrency(loyaltyData.averageProjectCost)}</strong>.</p>
          <p className="loyalty-info-note">If you hire a project cheaper than the discount, it&apos;s free and you lose the rest of the discount.</p>
        </div>
      )}

      <div className="loyalty-how-it-works">
        <h3 className="loyalty-section-title">How It Works?</h3>
        <div className="loyalty-steps">
          <div className="loyalty-step"><div className="loyalty-step-number">1</div><div className="loyalty-step-content"><h4>Complete Projects</h4><p>Finish projects on the 3dMatch platform</p></div></div>
          <div className="loyalty-step"><div className="loyalty-step-number">2</div><div className="loyalty-step-content"><h4>Accumulate Points</h4><p>Each completed project counts toward your progress</p></div></div>
          <div className="loyalty-step"><div className="loyalty-step-number">3</div><div className="loyalty-step-content"><h4>Earn Discount!</h4><p>Every 10 projects, earn a discount equal to the average of the amounts spent</p></div></div>
        </div>
      </div>

      {milestones.length > 0 && (
        <div className="loyalty-history">
          <h3 className="loyalty-section-title">Achievement History</h3>
          <div className="loyalty-milestones-list">
            {milestones.map(milestone => (
              <div key={milestone.id} className="loyalty-milestone-item">
                <div className="loyalty-milestone-icon"><Gift size={24} /></div>
                <div className="loyalty-milestone-details">
                  <h4>{milestone.milestone_number} Projects Milestone Reached!</h4>
                  <p className="loyalty-milestone-reward">Discount Earned: <strong>{formatCurrency(milestone.discount_amount)}</strong></p>
                  <p className="loyalty-milestone-date">{formatDate(milestone.reached_at)}</p>
                  {milestone.processed ? (
                    <span className="loyalty-milestone-badge"><CheckCircle size={14} /> Reward Processed</span>
                  ) : (
                    <span className="loyalty-milestone-badge pending">Awaiting Processing</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loyaltyData.completedProjects === 0 && (
        <div className="loyalty-empty-state">
          <Award size={64} />
          <h3>Start Your Journey!</h3>
          <p>Complete your first project on the platform to start accumulating points in the loyalty program.</p>
        </div>
      )}
    </div>
  )
}
