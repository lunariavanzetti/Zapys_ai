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
      <div className="min-h-screen flex items-center justify-center bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk">
        <div className="animate-spin border-4 border-brutalist-black dark:border-brutalist-white border-t-electric-500 h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-tight">
              WELCOME BACK, {userProfile?.full_name?.split(' ')[0]?.toUpperCase() || 'USER'}! ⚡
            </h1>
            <p className="text-brutalist-gray dark:text-brutalist-gray mt-2 font-medium uppercase tracking-wide">
              HERE'S WHAT'S HAPPENING WITH YOUR PROPOSALS TODAY.
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Link to="/create">
              <GlassButton variant="brutalist-electric" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                CREATE PROPOSAL
              </GlassButton>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard variant="brutalist" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brutalist-gray text-sm font-bold uppercase tracking-wide">TOTAL PROPOSALS</p>
                  <p className="text-3xl font-bold text-brutalist-black dark:text-brutalist-white">{stats.total_proposals}</p>
                </div>
                <div className="w-12 h-12 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutalist dark:shadow-brutalist-white flex items-center justify-center">
                  <FileText className="h-6 w-6 text-brutalist-black" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-electric-500 font-bold">+{stats.proposals_this_month}</span>
                <span className="text-brutalist-gray ml-1 font-medium uppercase">THIS MONTH</span>
              </div>
            </GlassCard>

            <GlassCard variant="brutalist" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brutalist-gray text-sm font-bold uppercase tracking-wide">TOTAL VIEWS</p>
                  <p className="text-3xl font-bold text-brutalist-black dark:text-brutalist-white">{stats.total_views}</p>
                </div>
                <div className="w-12 h-12 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutalist dark:shadow-brutalist-white flex items-center justify-center">
                  <Eye className="h-6 w-6 text-brutalist-black" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-electric-500 mr-1" />
                <span className="text-electric-500 font-bold uppercase">GROWING</span>
              </div>
            </GlassCard>

            <GlassCard variant="brutalist" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brutalist-gray text-sm font-bold uppercase tracking-wide">CONVERSION RATE</p>
                  <p className="text-3xl font-bold text-brutalist-black dark:text-brutalist-white">{stats.avg_conversion_rate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutalist dark:shadow-brutalist-white flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-brutalist-black" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-brutalist-gray font-medium uppercase">AVERAGE RATE</span>
              </div>
            </GlassCard>

            <GlassCard variant="brutalist" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brutalist-gray text-sm font-bold uppercase tracking-wide">REVENUE (MONTH)</p>
                  <p className="text-3xl font-bold text-brutalist-black dark:text-brutalist-white">{formatCurrency(stats.revenue_this_month)}</p>
                </div>
                <div className="w-12 h-12 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutalist dark:shadow-brutalist-white flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-brutalist-black" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-brutalist-gray font-medium uppercase">FROM SIGNED PROPOSALS</span>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Recent Proposals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GlassCard variant="brutalist" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wide">RECENT PROPOSALS</h2>
                <Link to="/proposals" className="text-electric-500 hover:text-electric-400 text-sm font-bold uppercase tracking-wide">
                  VIEW ALL
                </Link>
              </div>

              {proposals.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-brutalist-black dark:text-brutalist-white mb-2 uppercase">NO PROPOSALS YET</h3>
                  <p className="text-brutalist-gray mb-6 font-medium uppercase">CREATE YOUR FIRST PROPOSAL TO GET STARTED</p>
                  <Link to="/create">
                    <GlassButton variant="brutalist-electric">
                      <Plus className="h-4 w-4 mr-2" />
                      CREATE PROPOSAL
                    </GlassButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between p-4 bg-brutalist-white dark:bg-brutalist-dark-gray border-2 border-brutalist-black dark:border-brutalist-white shadow-brutalist dark:shadow-brutalist-white hover:shadow-brutalist-hover dark:hover:shadow-brutalist-white-hover hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutalist dark:shadow-brutalist-white flex items-center justify-center">
                          <FileText className="h-5 w-5 text-brutalist-black" />
                        </div>
                        <div>
                          <h3 className="font-bold text-brutalist-black dark:text-brutalist-white uppercase">{proposal.title}</h3>
                          <p className="text-sm text-brutalist-gray font-medium uppercase">
                            {proposal.client_name} • {formatRelativeTime(proposal.updated_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`status-badge ${getStatusColor(proposal.status)}`}>
                          {getStatusText(proposal.status)}
                        </span>
                        
                        <div className="text-right">
                          <p className="text-sm font-bold text-brutalist-black dark:text-brutalist-white">
                            {proposal.pricing_total ? formatCurrency(proposal.pricing_total) : '—'}
                          </p>
                          <p className="text-xs text-brutalist-gray font-medium uppercase">
                            {proposal.total_views} VIEWS
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
            <GlassCard variant="brutalist" className="p-6">
              <h2 className="text-lg font-bold text-brutalist-black dark:text-brutalist-white mb-4 uppercase tracking-wide">QUICK ACTIONS</h2>
              <div className="space-y-3">
                <Link to="/create">
                  <GlassButton variant="brutalist" fullWidth className="justify-start">
                    <Plus className="h-4 w-4 mr-3" />
                    CREATE NEW PROPOSAL
                  </GlassButton>
                </Link>
                
                <Link to="/templates">
                  <GlassButton variant="brutalist" fullWidth className="justify-start">
                    <FileText className="h-4 w-4 mr-3" />
                    BROWSE TEMPLATES
                  </GlassButton>
                </Link>
                
                <Link to="/analytics">
                  <GlassButton variant="brutalist" fullWidth className="justify-start">
                    <TrendingUp className="h-4 w-4 mr-3" />
                    VIEW ANALYTICS
                  </GlassButton>
                </Link>
                
                <Link to="/settings">
                  <GlassButton variant="brutalist" fullWidth className="justify-start">
                    <Users className="h-4 w-4 mr-3" />
                    TEAM SETTINGS
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>

            {/* Subscription Status */}
            <GlassCard variant="brutalist" className="p-6">
              <h2 className="text-lg font-bold text-brutalist-black dark:text-brutalist-white mb-4 uppercase tracking-wide">SUBSCRIPTION</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-brutalist-gray font-medium uppercase tracking-wide">CURRENT PLAN</span>
                  <span className="text-brutalist-black dark:text-brutalist-white font-bold uppercase">
                    {userProfile?.subscription_tier || 'Free'}
                  </span>
                </div>
                
                {userProfile?.subscription_tier === 'free' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-brutalist-gray font-medium uppercase tracking-wide">PROPOSALS USED</span>
                      <span className="text-brutalist-black dark:text-brutalist-white font-bold">0 / 5</span>
                    </div>
                    
                    <Link to="/settings?tab=billing">
                      <GlassButton variant="brutalist-electric" size="sm" fullWidth>
                        UPGRADE PLAN
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