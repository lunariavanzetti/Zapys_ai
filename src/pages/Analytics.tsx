import GlassCard from '../components/ui/GlassCard'
import { BarChart3, Eye, Users, TrendingUp } from 'lucide-react'

export default function Analytics() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-white/70">Track your proposal performance and client engagement</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-white">1,247</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Unique Visitors</p>
                <p className="text-2xl font-bold text-white">892</p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">23.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Avg. Time on Page</p>
                <p className="text-2xl font-bold text-white">4:32</p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-400" />
            </div>
          </GlassCard>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Views Over Time</h2>
            <div className="h-64 bg-white/5 rounded-2xl flex items-center justify-center">
              <p className="text-white/50">Chart will be implemented here</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Proposal Status</h2>
            <div className="h-64 bg-white/5 rounded-2xl flex items-center justify-center">
              <p className="text-white/50">Chart will be implemented here</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}