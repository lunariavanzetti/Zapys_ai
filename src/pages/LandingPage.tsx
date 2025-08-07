import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowRight, Zap, BarChart3, Globe, Users, Target, DollarSign, FileText, TrendingUp } from 'lucide-react'
import BrutalistThemeToggle from '../components/BrutalistThemeToggle'
import Footer from '../components/layout/Footer'

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Check if this is an auth callback and redirect accordingly
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const code = searchParams.get('code')
    const accessToken = searchParams.get('access_token')
    
    if (code || accessToken) {
      console.log('Auth callback detected on landing page, redirecting to /auth/callback')
      navigate('/auth/callback' + location.search + location.hash, { replace: true })
    }
  }, [location, navigate])
  const features = [
    {
      icon: Zap,
      title: 'AI-POWERED GENERATION',
      description: 'GENERATE PROFESSIONAL PROPOSALS IN UNDER 60 SECONDS USING ADVANCED AI'
    },
    {
      icon: BarChart3,
      title: 'REAL-TIME ANALYTICS',
      description: 'TRACK CLIENT ENGAGEMENT WITH DETAILED ANALYTICS AND INSIGHTS'
    },
    {
      icon: Globe,
      title: 'MULTI-LANGUAGE SUPPORT',
      description: 'CREATE PROPOSALS IN UKRAINIAN, RUSSIAN, POLISH AND MORE'
    },
    {
      icon: Users,
      title: 'TEAM COLLABORATION',
      description: 'WORK TOGETHER WITH YOUR TEAM ON PROPOSALS AND PROJECTS'
    }
  ]

  const testimonials = [
    {
      name: 'ANNA KOVALENKO',
      role: 'FREELANCE DESIGNER',
      location: 'KYIV, UKRAINE',
      content: 'ZAPYS AI REDUCED MY PROPOSAL WRITING TIME FROM 3 HOURS TO 5 MINUTES. GAME CHANGER!',
      avatar: 'AK'
    },
    {
      name: 'MICHAŁ NOWAK',
      role: 'DEV AGENCY OWNER',
      location: 'WARSAW, POLAND',
      content: 'OUR PROPOSAL CONVERSION RATE INCREASED BY 40% SINCE USING ZAPYS AI.',
      avatar: 'MN'
    },
    {
      name: 'DMITRY PETROV',
      role: 'FULL-STACK DEVELOPER',
      location: 'BERLIN, GERMANY',
      content: 'THE PRICING SUGGESTIONS ARE INCREDIBLY ACCURATE. HELPS ME PRICE PROJECTS CONFIDENTLY.',
      avatar: 'DP'
    }
  ]

  const plans = [
    {
      name: 'STARTER',
      price: '$19',
      period: '/MONTH',
      features: [
        '50 PROPOSALS PER MONTH',
        'BASIC TEMPLATES',
        'PDF EXPORT',
        'EMAIL SUPPORT'
      ],
      isPopular: false
    },
    {
      name: 'PRO',
      price: '$49',
      period: '/MONTH',
      features: [
        'UNLIMITED PROPOSALS',
        'AI PRICING SUGGESTIONS',
        'ADVANCED ANALYTICS',
        'TEAM COLLABORATION',
        'PRIORITY SUPPORT'
      ],
      isPopular: true
    },
    {
      name: 'AGENCY',
      price: '$99',
      period: '/MONTH',
      features: [
        'EVERYTHING IN PRO',
        'WHITE-LABEL PROPOSALS',
        'ADVANCED INTEGRATIONS',
        'CUSTOM BRANDING',
        'DEDICATED SUPPORT'
      ],
      isPopular: false
    }
  ]

  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk relative overflow-hidden">
      {/* Geometric Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-8 border-electric-500 animate-pulse"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-electric-500 shadow-brutal animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-40 left-1/3 w-16 h-16 border-4 border-brutalist-black dark:border-brutalist-white animate-spin" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 right-1/4 w-20 h-20 bg-brutalist-black dark:bg-brutalist-white animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-12 h-12 border-6 border-electric-500 animate-ping" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="brutal-card mx-auto max-w-7xl px-8 py-4 hover-lift">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-16 h-16 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal hover:animate-spin">
                <Zap className="h-8 w-8 text-brutalist-black" />
              </div>
              <span className="text-4xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-tight">ZAPYS AI</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <BrutalistThemeToggle />
              <Link to="/auth">
                <button className="btn-secondary px-8 py-4 text-xl hover-lift">
                  SIGN IN
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-8xl font-black text-brutalist-black dark:text-brutalist-white mb-8 uppercase tracking-tighter leading-none">
              GENERATE WINNING PROPOSALS IN{' '}
              <span className="text-electric-500 animate-pulse relative">
                60 SECONDS
                <div className="absolute -bottom-4 left-0 w-full h-2 bg-electric-500 shadow-brutal"></div>
              </span>
            </h1>
            
            <p className="text-3xl text-brutalist-gray font-black uppercase tracking-widest mb-12 max-w-4xl mx-auto leading-tight">
              AI-POWERED PROPOSAL GENERATOR FOR FREELANCERS AND AGENCIES. CONNECT YOUR NOTION, 
              GENERATE BEAUTIFUL PROPOSALS, AND WIN MORE CLIENTS WITH REAL-TIME ANALYTICS.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-8">
              <Link to="/auth">
                <button className="btn-primary px-16 py-8 text-3xl group relative overflow-hidden electric-pulse hover:shadow-brutal-lg transform hover:-translate-x-2 hover:-translate-y-2 transition-all duration-300">
                  <span className="flex items-center relative z-10">
                    START FREE TRIAL
                    <ArrowRight className="h-8 w-8 ml-4 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </button>
              </Link>
              
              <button className="btn-secondary px-16 py-8 text-3xl group hover:shadow-brutal-lg transform hover:-translate-x-2 hover:-translate-y-2 transition-all duration-300">
                <span className="flex items-center">
                  <Target className="h-8 w-8 mr-4 group-hover:animate-spin" />
                  WATCH DEMO
                </span>
              </button>
            </div>
            
            <p className="text-xl text-electric-500 font-black uppercase tracking-widest animate-pulse">
              FREE 14-DAY TRIAL • NO CREDIT CARD REQUIRED
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black text-brutalist-black dark:text-brutalist-white mb-8 uppercase tracking-tight">
              EVERYTHING YOU NEED TO WIN MORE CLIENTS
            </h2>
            <p className="text-2xl text-brutalist-gray font-black uppercase tracking-widest max-w-4xl mx-auto">
              STOP SPENDING HOURS ON PROPOSALS. GENERATE, CUSTOMIZE, AND TRACK EVERYTHING IN ONE PLACE.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="brutal-card p-8 hover-lift group cursor-pointer transform hover:-translate-x-2 hover:-translate-y-2 hover:shadow-brutal-lg transition-all duration-300" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="w-20 h-20 mx-auto mb-8 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center group-hover:animate-spin">
                  <feature.icon className="h-10 w-10 text-brutalist-black" />
                </div>
                <h3 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white mb-6 uppercase tracking-wide text-center">
                  {feature.title}
                </h3>
                <p className="text-lg text-brutalist-gray font-bold uppercase tracking-wider text-center leading-tight">
                  {feature.description}
                </p>
                <div className="mt-6 h-2 bg-electric-500 w-full shadow-brutal"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black text-brutalist-black dark:text-brutalist-white mb-8 uppercase tracking-tight">
              LOVED BY FREELANCERS AND AGENCIES
            </h2>
            <p className="text-2xl text-brutalist-gray font-black uppercase tracking-widest">
              JOIN THOUSANDS OF PROFESSIONALS WHO'VE TRANSFORMED THEIR PROPOSAL PROCESS
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="brutal-card p-8 hover-lift group cursor-pointer transform hover:-translate-x-2 hover:-translate-y-2 hover:shadow-brutal-lg transition-all duration-300" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center mr-4 group-hover:animate-pulse">
                    <span className="text-xl font-black text-brutalist-black">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="text-xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wide">{testimonial.name}</p>
                    <p className="text-lg font-bold text-brutalist-gray uppercase tracking-wider">{testimonial.role}</p>
                    <p className="text-sm font-bold text-electric-500 uppercase tracking-widest">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-lg text-brutalist-black dark:text-brutalist-white font-bold uppercase tracking-wider leading-tight">
                  "{testimonial.content}"
                </p>
                <div className="mt-6 h-2 bg-electric-500 w-full shadow-brutal"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black text-brutalist-black dark:text-brutalist-white mb-8 uppercase tracking-tight">
              SIMPLE, TRANSPARENT PRICING
            </h2>
            <p className="text-2xl text-brutalist-gray font-black uppercase tracking-widest">
              CHOOSE THE PLAN THAT WORKS FOR YOUR BUSINESS
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`brutal-card p-10 hover-lift group cursor-pointer transform hover:-translate-x-2 hover:-translate-y-2 hover:shadow-brutal-lg transition-all duration-300 relative ${plan.isPopular ? 'electric-pulse' : ''}`} style={{animationDelay: `${index * 0.1}s`}}>
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white px-6 py-2 shadow-brutal">
                      <span className="text-xl font-black text-brutalist-black uppercase tracking-widest">MOST POPULAR</span>
                    </div>
                  </div>
                )}
                
                <h3 className="text-4xl font-black text-brutalist-black dark:text-brutalist-white mb-6 uppercase tracking-wide text-center">
                  {plan.name}
                </h3>
                
                <div className="text-center mb-8">
                  <span className="text-6xl font-black text-electric-500">{plan.price}</span>
                  <span className="text-2xl font-bold text-brutalist-gray uppercase tracking-wider">{plan.period}</span>
                </div>
                
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="w-6 h-6 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal mr-4 flex items-center justify-center">
                        <div className="w-2 h-2 bg-brutalist-black"></div>
                      </div>
                      <span className="text-lg font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/auth">
                  <button className={`w-full py-6 text-2xl hover-lift transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 ${plan.isPopular ? 'btn-primary electric-pulse' : 'btn-secondary'}`}>
                    <span className="flex items-center justify-center">
                      START FREE TRIAL
                      <ArrowRight className="h-6 w-6 ml-3" />
                    </span>
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="brutal-card p-16 hover-lift electric-pulse">
            <h2 className="text-6xl font-black text-brutalist-black dark:text-brutalist-white mb-8 uppercase tracking-tight">
              READY TO WIN MORE CLIENTS?
            </h2>
            <p className="text-3xl text-brutalist-gray font-black uppercase tracking-widest mb-12 leading-tight">
              JOIN THOUSANDS OF FREELANCERS AND AGENCIES USING ZAPYS AI TO CREATE WINNING PROPOSALS
            </p>
            <Link to="/auth">
              <button className="btn-primary px-20 py-8 text-4xl group relative overflow-hidden electric-pulse hover:shadow-brutal-lg transform hover:-translate-x-2 hover:-translate-y-2 transition-all duration-300">
                <span className="flex items-center relative z-10">
                  START YOUR FREE TRIAL
                  <ArrowRight className="h-10 w-10 ml-6 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}