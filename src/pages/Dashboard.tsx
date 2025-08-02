import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, TrendingUp, Eye, FileText, DollarSign, Users, MoreVertical } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import { formatCurrency, formatRelativeTime } from '../lib/utils'
import toast from 'react-hot-toast'

interface DashboardStats {
  total_proposals: number
  proposals_this_month: number
  total_views: number
  avg_conversion_rate: number
  revenue_this_month: number
  active_proposals: number
}

interface Proposal {
  id: string
  title: string
  status: string
  client_name: string
  created_at: string
  updated_at: string
  public_url_slug: string
  total_views: number
  pricing_total: number
}

export default function Dashboard() {
  const { userProfile } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      loadDashboardData()
    }
  }, [userProfile])

  const loadDashboardData = async () => {
    if (!userProfile) return

    try {
      // Load dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_dashboard_stats', { user_uuid: userProfile.id })

      if (statsError) throw statsError
      if (statsData && statsData.length > 0) {
        setStats(statsData[0])
      }

      // Load recent proposals
      const { data: proposalsData, error: proposalsError } = await supabase
        .rpc('get_user_proposals', { 
          user_uuid: userProfile.id,
          limit_count: 10 
        })

      if (proposalsError) throw proposalsError
      setProposals(proposalsData || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'status-draft'
      case 'sent': return 'status-sent'
      case 'viewed': return 'status-viewed'
      case 'signed': return 'status-signed'
      case 'rejected': return 'status-rejected'
      default: return 'status-draft'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'sent': return 'Sent'
      case 'viewed': return 'Viewed'
      case 'signed': return 'Signed'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {userProfile?.full_name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-white/70 mt-1">
              Here's what's happening with your proposals today.
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Link to="/create">
              <GlassButton size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Proposal
              </GlassButton>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Total Proposals</p>
                  <p className="text-3xl font-bold text-white">{stats.total_proposals}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-400">+{stats.proposals_this_month}</span>
                <span className="text-white/60 ml-1">this month</span>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Total Views</p>
                  <p className="text-3xl font-bold text-white">{stats.total_views}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400">Growing</span>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Conversion Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.avg_conversion_rate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-white/60">Average rate</span>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Revenue (Month)</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(stats.revenue_this_month)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-white/60">From signed proposals</span>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Recent Proposals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Proposals</h2>
                <Link to="/proposals" className="text-primary-400 hover:text-primary-300 text-sm">
                  View all
                </Link>
              </div>

              {proposals.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No proposals yet</h3>
                  <p className="text-white/60 mb-6">Create your first proposal to get started</p>
                  <Link to="/create">
                    <GlassButton>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Proposal
                    </GlassButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{proposal.title}</h3>
                          <p className="text-sm text-white/60">
                            {proposal.client_name} • {formatRelativeTime(proposal.updated_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`status-badge ${getStatusColor(proposal.status)}`}>
                          {getStatusText(proposal.status)}
                        </span>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">
                            {proposal.pricing_total ? formatCurrency(proposal.pricing_total) : '—'}
                          </p>
                          <p className="text-xs text-white/60">
                            {proposal.total_views} views
                          </p>
                        </div>
                        
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4 text-white/60" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/create">
                  <GlassButton variant="outline" fullWidth className="justify-start">
                    <Plus className="h-4 w-4 mr-3" />
                    Create New Proposal
                  </GlassButton>
                </Link>
                
                <Link to="/templates">
                  <GlassButton variant="outline" fullWidth className="justify-start">
                    <FileText className="h-4 w-4 mr-3" />
                    Browse Templates
                  </GlassButton>
                </Link>
                
                <Link to="/analytics">
                  <GlassButton variant="outline" fullWidth className="justify-start">
                    <TrendingUp className="h-4 w-4 mr-3" />
                    View Analytics
                  </GlassButton>
                </Link>
                
                <Link to="/settings">
                  <GlassButton variant="outline" fullWidth className="justify-start">
                    <Users className="h-4 w-4 mr-3" />
                    Team Settings
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>

            {/* Subscription Status */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Subscription</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Current Plan</span>
                  <span className="text-white font-medium capitalize">
                    {userProfile?.subscription_tier || 'Free'}
                  </span>
                </div>
                
                {userProfile?.subscription_tier === 'free' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Proposals Used</span>
                      <span className="text-white">0 / 5</span>
                    </div>
                    
                    <Link to="/settings?tab=billing">
                      <GlassButton size="sm" fullWidth>
                        Upgrade Plan
                      </GlassButton>
                    </Link>
                  </>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}