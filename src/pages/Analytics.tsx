import { BarChart3, Eye, Users, TrendingUp, Target, Clock, DollarSign, Zap, TrendingDown } from 'lucide-react'

export default function Analytics() {
  const stats = [
    {
      title: 'TOTAL VIEWS',
      value: '1,247',
      change: '+23.5%',
      icon: Eye,
      trend: 'up'
    },
    {
      title: 'UNIQUE VISITORS', 
      value: '892',
      change: '+18.2%',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'CONVERSION RATE',
      value: '23.5%',
      change: '+5.3%', 
      icon: Target,
      trend: 'up'
    },
    {
      title: 'AVG TIME ON PAGE',
      value: '4:32',
      change: '+12.1%',
      icon: Clock,
      trend: 'up'
    }
  ]

  const proposalStats = [
    {
      title: 'PROPOSALS SENT',
      value: '156',
      icon: BarChart3
    },
    {
      title: 'PROPOSALS WON',
      value: '37',
      icon: TrendingUp
    },
    {
      title: 'TOTAL REVENUE',
      value: '$127K',
      icon: DollarSign
    },
    {
      title: 'AVG DEAL SIZE',
      value: '$3.4K',
      icon: Zap
    }
  ]

  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk relative overflow-hidden">
      {/* Ultra-Modern Geometric Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
        <div className="absolute top-20 left-10 w-48 h-48 border-8 border-electric-500 animate-pulse shadow-brutal"></div>
        <div className="absolute top-40 right-20 w-36 h-36 bg-electric-500 shadow-brutal animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-28 h-28 border-6 border-brutalist-black dark:border-brutalist-white animate-spin shadow-brutal" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-brutalist-black dark:bg-brutalist-white animate-pulse shadow-brutal" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 left-1/2 w-32 h-32 border-4 border-electric-500 animate-ping shadow-brutal" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Brutal Header */}
        <div className="brutal-card p-8 mb-8 hover-lift electric-pulse">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center animate-spin">
              <BarChart3 className="h-10 w-10 text-brutalist-black" />
            </div>
            <div>
              <h1 className="text-6xl font-black text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-tight">
                ANALYTICS
              </h1>
              <p className="text-2xl text-brutalist-black dark:text-brutalist-white font-black uppercase tracking-widest">
                TRACK YOUR PROPOSAL PERFORMANCE & CLIENT ENGAGEMENT
              </p>
            </div>
          </div>
        </div>

        {/* Performance Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="brutal-card p-8 hover-lift group cursor-pointer transform hover:-translate-x-2 hover:-translate-y-2 hover:shadow-brutal-lg transition-all duration-300 electric-pulse">
              <div className="flex items-start justify-between mb-6">
                <div className="w-20 h-20 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center group-hover:animate-pulse group-hover:rotate-12 transition-transform duration-300">
                  <stat.icon className="h-10 w-10 text-brutalist-black" />
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-brutalist-black dark:text-brutalist-white mb-2">
                    {stat.value}
                  </div>
                  <div className={`text-lg font-black uppercase tracking-wider animate-pulse ${
                    stat.trend === 'up' ? 'text-electric-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>
              <div className="text-lg font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-widest mb-4">
                {stat.title}
              </div>
              <div className="h-2 bg-electric-500 w-full shadow-brutal"></div>
            </div>
          ))}
        </div>

        {/* Proposal Performance Stats */}
        <div className="brutal-card p-8 mb-8 hover-lift">
          <h2 className="text-4xl font-black text-brutalist-black dark:text-brutalist-white mb-8 uppercase tracking-tight">
            PROPOSAL PERFORMANCE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {proposalStats.map((stat, index) => (
              <div key={index} className="border-4 border-brutalist-black dark:border-brutalist-white bg-electric-500 p-6 shadow-brutal hover-lift transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-8 w-8 text-brutalist-black" />
                  <div className="text-3xl font-black text-brutalist-black">
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm font-black text-brutalist-black uppercase tracking-widest">
                  {stat.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="brutal-card p-8 hover-lift">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-brutalist-black" />
              </div>
              <h2 className="text-3xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-tight">
                VIEWS OVER TIME
              </h2>
            </div>
            <div className="h-64 border-4 border-brutalist-black dark:border-brutalist-white bg-brutalist-light-gray dark:bg-brutalist-dark-gray shadow-brutal flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal mx-auto mb-4 flex items-center justify-center animate-pulse">
                  <BarChart3 className="h-10 w-10 text-brutalist-black" />
                </div>
                <p className="text-xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
                  CHART COMING SOON
                </p>
              </div>
            </div>
          </div>

          <div className="brutal-card p-8 hover-lift">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center">
                <Target className="h-8 w-8 text-brutalist-black" />
              </div>
              <h2 className="text-3xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-tight">
                PROPOSAL STATUS
              </h2>
            </div>
            <div className="h-64 border-4 border-brutalist-black dark:border-brutalist-white bg-brutalist-light-gray dark:bg-brutalist-dark-gray shadow-brutal flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal mx-auto mb-4 flex items-center justify-center animate-spin">
                  <Target className="h-10 w-10 text-brutalist-black" />
                </div>
                <p className="text-xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
                  CHART COMING SOON
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}