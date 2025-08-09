import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, TrendingUp, Eye, FileText, DollarSign, Users, MoreVertical, Zap, ArrowUpRight, Clock, Target } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
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
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔥 Dashboard useEffect triggered, user:', !!user)
    
    // Always stop loading after 2 seconds max, regardless of user state
    const forceStopLoading = setTimeout(() => {
      console.log('🚨 FORCE STOPPING LOADING')
      setLoading(false)
      if (!stats) {
        setStats({
          total_proposals: 0,
          proposals_this_month: 0,
          total_views: 0,
          avg_conversion_rate: 0,
          revenue_this_month: 0,
          active_proposals: 0
        })
      }
    }, 2000)

    if (user) {
      loadDashboardData()
    } else {
      // No user, stop loading immediately
      console.log('🔥 No user, stopping loading immediately')
      setLoading(false)
      setStats({
        total_proposals: 0,
        proposals_this_month: 0,
        total_views: 0,
        avg_conversion_rate: 0,
        revenue_this_month: 0,
        active_proposals: 0
      })
    }

    return () => clearTimeout(forceStopLoading)
  }, [user])

  const loadDashboardData = async () => {
    if (!user) {
      console.log('No user found, stopping loading')
      setLoading(false)
      return
    }

    try {
      console.log('🔥 Loading dashboard data for user:', user.id)
      
      // Always set default stats first
      const defaultStats = {
        total_proposals: 0,
        proposals_this_month: 0,
        total_views: 0,
        avg_conversion_rate: 0,
        revenue_this_month: 0,
        active_proposals: 0
      }
      setStats(defaultStats)
      setProposals([])
      
      console.log('✅ Default data set, stopping loading')
      setLoading(false)
      
      // Try to load real data in background (non-blocking)
      setTimeout(async () => {
        try {
          console.log('🔄 Attempting to load real dashboard data...')
          
          const { data: statsData, error: statsError } = await supabase
            .rpc('get_dashboard_stats', { user_uuid: user.id })

          if (statsError) {
            console.log('⚠️ Stats RPC error (expected for new users):', statsError.message)
          } else if (statsData && statsData.length > 0) {
            console.log('✅ Real stats loaded:', statsData[0])
            setStats(statsData[0])
          }

          const { data: proposalsData, error: proposalsError } = await supabase
            .rpc('get_user_proposals', { 
              user_uuid: user.id,
              limit_count: 6 
            })

          if (proposalsError) {
            console.log('⚠️ Proposals RPC error (expected for new users):', proposalsError.message)
          } else if (proposalsData) {
            console.log('✅ Real proposals loaded:', proposalsData.length)
            setProposals(proposalsData || [])
          }
        } catch (bgError) {
          console.log('⚠️ Background data loading failed (this is OK):', bgError)
        }
      }, 100)

    } catch (error) {
      console.error('🚨 Critical error loading dashboard data:', error)
      // Still set defaults and stop loading
      setStats({
        total_proposals: 0,
        proposals_this_month: 0,
        total_views: 0,
        avg_conversion_rate: 0,
        revenue_this_month: 0,
        active_proposals: 0
      })
      setProposals([])
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
    return status.toUpperCase()
  }

  console.log('Dashboard render - loading:', loading, 'user:', !!user, 'stats:', !!stats, 'proposals:', proposals.length)

  if (loading) {
    return (
      <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk flex items-center justify-center relative overflow-hidden">
        {/* Geometric Loading Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-20 left-20 w-40 h-40 border-8 border-electric-500 animate-pulse"></div>
          <div className="absolute top-60 right-32 w-32 h-32 bg-electric-500 shadow-brutal animate-bounce" style={{animationDelay: '0.3s'}}></div>
          <div className="absolute bottom-40 left-1/3 w-24 h-24 border-4 border-brutalist-black dark:border-brutalist-white animate-spin" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-20 right-1/4 w-16 h-16 bg-brutalist-black dark:bg-brutalist-white animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 left-1/2 w-20 h-20 border-6 border-electric-500 animate-ping" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="brutal-card p-12 mb-8 electric-pulse">
            <div className="w-32 h-32 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal mx-auto mb-8 flex items-center justify-center animate-spin">
              <Zap className="h-16 w-16 text-brutalist-black" />
            </div>
            <div className="text-4xl font-black text-brutalist-black dark:text-brutalist-white mb-6 uppercase tracking-widest">
              LOADING WORKSPACE
            </div>
            <div className="text-xl text-electric-500 font-bold uppercase tracking-widest animate-pulse">
              PREPARING YOUR BRUTAL DASHBOARD
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk relative overflow-hidden">
      {/* Ultra-Modern Geometric Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
        <div className="absolute top-20 left-10 w-48 h-48 border-8 border-electric-500 animate-pulse shadow-brutal"></div>
        <div className="absolute top-40 right-20 w-36 h-36 bg-electric-500 shadow-brutal animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-28 h-28 border-6 border-brutalist-black dark:border-brutalist-white animate-spin shadow-brutal" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-32 h-32 bg-brutalist-black dark:bg-brutalist-white animate-pulse shadow-brutal" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-20 h-20 border-8 border-electric-500 animate-ping shadow-brutal" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-60 left-1/3 w-16 h-16 bg-electric-500 animate-bounce shadow-brutal" style={{animationDelay: '3s', animationDuration: '2s'}}></div>
        <div className="absolute bottom-60 right-20 w-24 h-24 border-4 border-electric-500 animate-pulse shadow-brutal" style={{animationDelay: '2.5s'}}></div>
      </div>

      <div className="relative z-10 p-6">
        
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Ultra-Brutal Hero Header */}
          <div className="brutal-card p-12 hover-lift relative overflow-hidden electric-pulse">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between relative z-10">
              <div className="mb-8 lg:mb-0">
                <div className="flex items-center mb-6">
                  <div className="w-24 h-24 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal mr-6 flex items-center justify-center hover:animate-spin hover:shadow-brutal-lg transform hover:-translate-x-2 hover:-translate-y-2 transition-all duration-300">
                    <Zap className="h-12 w-12 text-brutalist-black" />
                  </div>
                  <div>
                    <h1 className="text-6xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-tighter mb-2">
                      WELCOME BACK
                    </h1>
                    <div className="text-4xl font-black text-electric-500 uppercase tracking-wider animate-pulse">
                      {userProfile?.full_name?.split(' ')[0]?.toUpperCase() || 
                       user?.user_metadata?.full_name?.split(' ')[0]?.toUpperCase() || 
                       user?.email?.split('@')[0]?.toUpperCase() || 'USER'}
                    </div>
                  </div>
                </div>
                <p className="text-2xl text-brutalist-black dark:text-brutalist-white font-black uppercase tracking-widest max-w-3xl leading-tight">
                  YOUR ULTRA-MODERN BRUTAL WORKSPACE IS READY FOR WORLD-CLASS PROPOSAL GENERATION
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/create">
                  <button className="btn-primary px-12 py-6 text-2xl group relative overflow-hidden electric-pulse hover:shadow-brutal-lg transform hover:-translate-x-2 hover:-translate-y-2 transition-all duration-300">
                    <span className="flex items-center relative z-10">
                      <Plus className="h-8 w-8 mr-4 group-hover:animate-spin" />
                      CREATE PROPOSAL
                      <ArrowUpRight className="h-6 w-6 ml-3 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                    </span>
                  </button>
                </Link>
                <Link to="/analytics">
                  <button className="btn-secondary px-12 py-6 text-2xl group hover:shadow-brutal-lg transform hover:-translate-x-2 hover:-translate-y-2 transition-all duration-300">
                    <span className="flex items-center">
                      <TrendingUp className="h-8 w-8 mr-4 group-hover:animate-bounce" />
                      VIEW ANALYTICS
                    </span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Electric border animation */}
            <div className="absolute inset-0 border-8 border-electric-500 opacity-0 hover:opacity-40 transition-opacity duration-500 pointer-events-none animate-pulse"></div>
          </div>

          {/* Ultra-Brutal Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {/* Total Proposals */}
              <div className="brutal-card p-8 hover-lift group cursor-pointer transform hover:-translate-x-2 hover:-translate-y-2 hover:shadow-brutal-lg transition-all duration-300 electric-pulse">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-20 h-20 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center group-hover:animate-pulse group-hover:rotate-12 transition-transform duration-300">
                    <FileText className="h-10 w-10 text-brutalist-black" />
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-brutalist-black dark:text-brutalist-white mb-2">
                      {stats.total_proposals}
                    </div>
                    <div className="text-lg font-black text-electric-500 uppercase tracking-wider animate-pulse">
                      +{stats.proposals_this_month} THIS MONTH
                    </div>
                  </div>
                </div>
                <div className="text-lg font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-widest mb-4">
                  TOTAL PROPOSALS
                </div>
                <div className="h-2 bg-electric-500 w-full shadow-brutal"></div>
              </div>

              {/* Total Views */}
              <div className="brutal-card p-8 hover-lift group cursor-pointer transform hover:-translate-x-2 hover:-translate-y-2 hover:shadow-brutal-lg transition-all duration-300 electric-pulse">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-20 h-20 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center group-hover:animate-pulse group-hover:scale-110 transition-transform duration-300">
                    <Eye className="h-10 w-10 text-brutalist-black" />
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-brutalist-black dark:text-brutalist-white mb-2">
                      {stats.total_views}
                    </div>
                    <div className="text-lg font-black text-electric-500 uppercase tracking-wider flex items-center justify-end animate-bounce">
                      <TrendingUp className="h-6 w-6 mr-2" />
                      GROWING
                    </div>
                  </div>
                </div>
                <div className="text-lg font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-widest mb-4">
                  TOTAL VIEWS
                </div>
                <div className="h-2 bg-electric-500 w-full shadow-brutal"></div>
              </div>

              {/* Conversion Rate */}
              <div className="brutal-card p-8 hover-lift group cursor-pointer transform hover:-translate-x-2 hover:-translate-y-2 hover:shadow-brutal-lg transition-all duration-300 electric-pulse">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-20 h-20 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center group-hover:animate-pulse group-hover:rotate-45 transition-transform duration-300">
                    <Target className="h-10 w-10 text-brutalist-black" />
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-brutalist-black dark:text-brutalist-white mb-2">
                      {stats.avg_conversion_rate.toFixed(1)}%
                    </div>
                    <div className="text-lg font-black text-electric-500 uppercase tracking-wider animate-ping">
                      CONVERSION
                    </div>
                  </div>
                </div>
                <div className="text-lg font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-widest mb-4">
                  SUCCESS RATE
                </div>
                <div className="h-2 bg-electric-500 w-full shadow-brutal"></div>
              </div>

              {/* Revenue */}
              <div className="brutal-card p-8 hover-lift group cursor-pointer transform hover:-translate-x-2 hover:-translate-y-2 hover:shadow-brutal-lg transition-all duration-300 electric-pulse">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-20 h-20 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center group-hover:animate-pulse group-hover:animate-bounce transition-transform duration-300">
                    <DollarSign className="h-10 w-10 text-brutalist-black" />
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-brutalist-black dark:text-brutalist-white mb-2">
                      {formatCurrency(stats.revenue_this_month)}
                    </div>
                    <div className="text-lg font-black text-electric-500 uppercase tracking-wider animate-pulse">
                      THIS MONTH
                    </div>
                  </div>
                </div>
                <div className="text-lg font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-widest mb-4">
                  REVENUE EARNED
                </div>
                <div className="h-2 bg-electric-500 w-full shadow-brutal"></div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Recent Proposals */}
            <div className="xl:col-span-2">
              <div className="brutal-card p-8 hover-lift">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal mr-4 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-brutalist-black" />
                    </div>
                    <h2 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wide">
                      RECENT PROPOSALS
                    </h2>
                  </div>
                  <Link to="/proposals">
                    <button className="btn-secondary px-4 py-2 text-sm group">
                      <span className="flex items-center">
                        VIEW ALL
                        <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                    </button>
                  </Link>
                </div>

                {proposals.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-brutalist-gray mx-auto mb-6 border-2 border-brutalist-black dark:border-brutalist-white flex items-center justify-center">
                      <FileText className="h-12 w-12 text-brutalist-black dark:text-brutalist-white" />
                    </div>
                    <h3 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white mb-4 uppercase">
                      NO PROPOSALS YET
                    </h3>
                    <p className="text-brutalist-black dark:text-brutalist-white font-bold uppercase tracking-wider mb-8">
                      START YOUR JOURNEY WITH YOUR FIRST BRUTAL PROPOSAL
                    </p>
                    <Link to="/create">
                      <button className="btn-primary px-8 py-4 text-lg electric-pulse">
                        <span className="flex items-center">
                          <Plus className="h-5 w-5 mr-2" />
                          CREATE FIRST PROPOSAL
                        </span>
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {proposals.map((proposal, index) => (
                      <div 
                        key={proposal.id} 
                        className="brutal-card p-6 hover-lift group cursor-pointer"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center group-hover:rotate-12 transition-transform">
                              <FileText className="h-6 w-6 text-brutalist-black" />
                            </div>
                            <div>
                              <h3 className="font-black text-brutalist-black dark:text-brutalist-white uppercase text-lg">
                                {proposal.title}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
                                  {proposal.client_name}
                                </span>
                                <span className="text-xs font-bold text-electric-500 uppercase tracking-widest">
                                  {formatRelativeTime(proposal.updated_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-lg font-black text-brutalist-black dark:text-brutalist-white">
                                {proposal.pricing_total ? formatCurrency(proposal.pricing_total) : '—'}
                              </div>
                              <div className="text-xs font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
                                {proposal.total_views} VIEWS
                              </div>
                            </div>
                            
                            <div className={`status-badge ${getStatusColor(proposal.status)}`}>
                              {getStatusText(proposal.status)}
                            </div>
                            
                            <button className="w-8 h-8 border-2 border-brutalist-black dark:border-brutalist-white hover:bg-brutalist-black dark:hover:bg-brutalist-white group transition-colors">
                              <MoreVertical className="h-4 w-4 text-brutalist-black dark:text-brutalist-white group-hover:text-brutalist-white dark:group-hover:text-brutalist-black mx-auto" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="brutal-card p-6 hover-lift">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal mr-3 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-brutalist-black" />
                  </div>
                  <h2 className="text-lg font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wide">
                    QUICK ACTIONS
                  </h2>
                </div>
                
                <div className="space-y-3">
                  <Link to="/create">
                    <button className="btn-secondary w-full justify-start py-3 group">
                      <Plus className="h-5 w-5 mr-3 group-hover:animate-spin" />
                      CREATE PROPOSAL
                    </button>
                  </Link>
                  
                  <Link to="/templates">
                    <button className="btn-secondary w-full justify-start py-3 group">
                      <FileText className="h-5 w-5 mr-3 group-hover:animate-bounce" />
                      BROWSE TEMPLATES
                    </button>
                  </Link>
                  
                  <Link to="/analytics">
                    <button className="btn-secondary w-full justify-start py-3 group">
                      <TrendingUp className="h-5 w-5 mr-3 group-hover:animate-pulse" />
                      VIEW ANALYTICS
                    </button>
                  </Link>
                  
                  <Link to="/settings">
                    <button className="btn-secondary w-full justify-start py-3 group">
                      <Users className="h-5 w-5 mr-3 group-hover:animate-ping" />
                      TEAM SETTINGS
                    </button>
                  </Link>
                </div>
              </div>

              {/* Subscription Status */}
              <div className="brutal-card p-6 hover-lift electric-pulse">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal mr-3 flex items-center justify-center animate-pulse">
                    <Target className="h-4 w-4 text-brutalist-black" />
                  </div>
                  <h2 className="text-lg font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wide">
                    SUBSCRIPTION
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
                      CURRENT PLAN
                    </span>
                    <div className="brutal-card px-3 py-1">
                      <span className="text-sm font-black text-brutalist-black dark:text-brutalist-white uppercase">
                        {userProfile?.subscription_tier || 'FREE'}
                      </span>
                    </div>
                  </div>
                  
                  {(userProfile?.subscription_tier === 'free' || !userProfile) && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
                          PROPOSALS USED
                        </span>
                        <span className="text-sm font-black text-brutalist-black dark:text-brutalist-white">
                          0 / 5
                        </span>
                      </div>
                      
                      <div className="h-2 bg-brutalist-gray border-2 border-brutalist-black dark:border-brutalist-white">
                        <div className="h-full bg-electric-500 w-0"></div>
                      </div>
                      
                      <Link to="/settings?tab=billing">
                        <button className="btn-primary w-full py-3 text-lg electric-pulse">
                          <span className="flex items-center justify-center">
                            <ArrowUpRight className="h-5 w-5 mr-2" />
                            UPGRADE NOW
                          </span>
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="brutal-card p-6 hover-lift">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal mr-3 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-brutalist-black" />
                  </div>
                  <h2 className="text-lg font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wide">
                    THIS WEEK
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
                      PROPOSALS SENT
                    </span>
                    <span className="text-lg font-black text-electric-500">
                      {stats?.proposals_this_month || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
                      RESPONSE RATE
                    </span>
                    <span className="text-lg font-black text-electric-500">
                      {stats?.avg_conversion_rate.toFixed(0) || 0}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
                      ACTIVE PROPOSALS
                    </span>
                    <span className="text-lg font-black text-electric-500">
                      {stats?.active_proposals || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}