import { Link } from 'react-router-dom'
import { ArrowRight, Zap, BarChart3, Globe, Users } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import BrutalistThemeToggle from '../components/BrutalistThemeToggle'

export default function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Generation',
      description: 'Generate professional proposals in under 60 seconds using advanced AI'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track client engagement with detailed analytics and insights'
    },
    {
      icon: Globe,
      title: 'Multi-language Support',
      description: 'Create proposals in Ukrainian, Russian, Polish and more'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your team on proposals and projects'
    }
  ]

  const testimonials = [
    {
      name: 'Anna Kovalenko',
      role: 'Freelance Designer',
      location: 'Kyiv, Ukraine',
      content: 'Zapys AI reduced my proposal writing time from 3 hours to 5 minutes. Game changer!',
      avatar: 'AK'
    },
    {
      name: 'Michał Nowak',
      role: 'Dev Agency Owner',
      location: 'Warsaw, Poland',
      content: 'Our proposal conversion rate increased by 40% since using Zapys AI.',
      avatar: 'MN'
    },
    {
      name: 'Dmitry Petrov',
      role: 'Full-stack Developer',
      location: 'Prague, Czech Republic',
      content: 'The pricing suggestions are incredibly accurate. Helps me price projects confidently.',
      avatar: 'DP'
    }
  ]

  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <GlassCard variant="brutalist" className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutalist dark:shadow-brutalist-white">
                <Zap className="h-6 w-6 text-brutalist-black" />
              </div>
              <span className="text-2xl font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wide">ZAPYS AI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <BrutalistThemeToggle />
              <Link to="/auth">
                <GlassButton variant="brutalist" size="sm">
                  SIGN IN
                </GlassButton>
              </Link>
            </div>
          </div>
        </GlassCard>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-brutalist-black dark:text-brutalist-white mb-6 animate-fade-in uppercase tracking-tight">
              GENERATE WINNING PROPOSALS IN{' '}
              <span className="text-electric-500 shadow-electric animate-electric-pulse">
                60 SECONDS
              </span>
            </h1>
            
            <p className="text-xl text-brutalist-gray dark:text-brutalist-gray mb-8 max-w-3xl mx-auto animate-slide-up font-medium">
              AI-POWERED PROPOSAL GENERATOR FOR FREELANCERS AND AGENCIES. CONNECT YOUR NOTION, 
              GENERATE BEAUTIFUL PROPOSALS, AND WIN MORE CLIENTS WITH REAL-TIME ANALYTICS.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/auth">
                <GlassButton variant="brutalist-electric" size="lg" className="min-w-48">
                  START FREE TRIAL
                  <ArrowRight className="ml-2 h-5 w-5" />
                </GlassButton>
              </Link>
              
              <GlassButton variant="brutalist" size="lg" className="min-w-48">
                WATCH DEMO
              </GlassButton>
            </div>
            
            <p className="text-sm text-brutalist-gray dark:text-brutalist-gray mt-4 font-medium uppercase tracking-wide">
              FREE 14-DAY TRIAL • NO CREDIT CARD REQUIRED
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to win more clients
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Stop spending hours on proposals. Generate, customize, and track everything in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <GlassCard key={index} variant="hover" className="p-6 text-center group">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by freelancers and agencies
            </h2>
            <p className="text-xl text-white/80">
              Join thousands of professionals who've transformed their proposal process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <GlassCard key={index} variant="hover" className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">{testimonial.avatar}</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-sm text-white/60">{testimonial.role}</p>
                    <p className="text-xs text-white/50">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-white/80 italic">"{testimonial.content}"</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-white/80">
              Choose the plan that works for your business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <GlassCard variant="hover" className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$19</span>
                <span className="text-white/60">/month</span>
              </div>
              <ul className="text-white/80 mb-8 space-y-3">
                <li>50 proposals per month</li>
                <li>Basic templates</li>
                <li>PDF export</li>
                <li>Email support</li>
              </ul>
              <Link to="/auth">
                <GlassButton variant="outline" size="lg" fullWidth>
                  Start Free Trial
                </GlassButton>
              </Link>
            </GlassCard>

            {/* Pro Plan */}
            <GlassCard variant="hover" className="p-8 text-center border-primary-500/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$49</span>
                <span className="text-white/60">/month</span>
              </div>
              <ul className="text-white/80 mb-8 space-y-3">
                <li>Unlimited proposals</li>
                <li>AI pricing suggestions</li>
                <li>Advanced analytics</li>
                <li>Team collaboration</li>
                <li>Priority support</li>
              </ul>
              <Link to="/auth">
                <GlassButton size="lg" fullWidth>
                  Start Free Trial
                </GlassButton>
              </Link>
            </GlassCard>

            {/* Agency Plan */}
            <GlassCard variant="hover" className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Agency</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-white/60">/month</span>
              </div>
              <ul className="text-white/80 mb-8 space-y-3">
                <li>Everything in Pro</li>
                <li>White-label proposals</li>
                <li>Advanced integrations</li>
                <li>Custom branding</li>
                <li>Dedicated support</li>
              </ul>
              <Link to="/auth">
                <GlassButton variant="outline" size="lg" fullWidth>
                  Start Free Trial
                </GlassButton>
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard className="p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to win more clients?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of freelancers and agencies using Zapys AI to create winning proposals
            </p>
            <Link to="/auth">
              <GlassButton size="xl">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </GlassButton>
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Zapys AI</span>
          </div>
          <p className="text-white/60">
            © 2024 Zapys AI. All rights reserved. Built for freelancers and agencies worldwide.
          </p>
        </div>
      </footer>
    </div>
  )
}