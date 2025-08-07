import { Link } from 'react-router-dom'
import { Check, Zap, Crown, Rocket, ArrowRight } from 'lucide-react'
import Footer from '../components/layout/Footer'

export default function Pricing() {
  const plans = [
    {
      name: 'FREE',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out Zapys AI',
      features: [
        '5 AI-generated proposals per month',
        'Basic proposal templates',
        'Email support',
        'Standard analytics',
        'PDF export'
      ],
      buttonText: 'GET STARTED FREE',
      buttonStyle: 'bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white border-2 border-brutalist-black dark:border-brutalist-white',
      popular: false
    },
    {
      name: 'STARTER',
      price: '$19',
      period: '/month',
      description: 'For small businesses and freelancers',
      features: [
        '50 AI-generated proposals per month',
        'Premium proposal templates',
        'Priority email support',
        'Advanced analytics dashboard',
        'PDF & Word export',
        'Custom branding',
        'Client tracking'
      ],
      buttonText: 'START FREE TRIAL',
      buttonStyle: 'bg-electric-500 text-brutalist-black border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift',
      popular: false
    },
    {
      name: 'PRO',
      price: '$49',
      period: '/month',
      description: 'Most popular for growing businesses',
      features: [
        'UNLIMITED AI-generated proposals',
        'All premium templates',
        'AI-powered pricing optimization',
        'Advanced analytics & insights',
        'All export formats',
        'Full custom branding',
        'Client engagement tracking',
        'Priority support',
        'API access',
        'Team collaboration (up to 5 users)'
      ],
      buttonText: 'START FREE TRIAL',
      buttonStyle: 'bg-electric-500 text-brutalist-black border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift',
      popular: true
    },
    {
      name: 'AGENCY',
      price: '$99',
      period: '/month',
      description: 'For agencies and large teams',
      features: [
        'UNLIMITED everything in Pro',
        'White-label solution',
        'Custom AI model training',
        'Advanced team collaboration',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security features',
        'Custom reporting',
        'Unlimited team members'
      ],
      buttonText: 'CONTACT SALES',
      buttonStyle: 'bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 w-48 h-48 border-8 border-electric-500 animate-pulse shadow-brutal"></div>
        <div className="absolute top-40 right-20 w-36 h-36 bg-electric-500 shadow-brutal animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-28 h-28 border-6 border-brutalist-black dark:border-brutalist-white animate-spin shadow-brutal" style={{animationDuration: '6s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="brutal-card p-12 hover-lift electric-pulse mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center animate-spin">
                <Zap className="h-10 w-10 text-brutalist-black" />
              </div>
            </div>
            <h1 className="text-7xl font-black text-brutalist-black dark:text-brutalist-white mb-6 uppercase tracking-tight">
              PRICING PLANS
            </h1>
            <p className="text-2xl text-brutalist-black dark:text-brutalist-white font-bold uppercase tracking-wider max-w-3xl mx-auto">
              CHOOSE THE PERFECT PLAN FOR YOUR BUSINESS NEEDS
            </p>
          </div>
          
          {/* Free Trial Notice */}
          <div className="brutal-card p-6 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift mb-12">
            <div className="flex items-center justify-center space-x-4">
              <Crown className="h-8 w-8 text-brutalist-black" />
              <span className="text-2xl font-black text-brutalist-black uppercase tracking-wider">
                🎉 ALL PAID PLANS INCLUDE A 7-DAY FREE TRIAL - NO CREDIT CARD REQUIRED!
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`brutal-card hover-lift relative ${plan.popular ? 'transform scale-105 electric-pulse' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal px-6 py-2">
                    <span className="font-black text-brutalist-black uppercase tracking-wider text-sm">
                      🔥 MOST POPULAR
                    </span>
                  </div>
                </div>
              )}
              
              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-black text-brutalist-black dark:text-brutalist-white mb-4 uppercase tracking-tight">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-5xl font-black text-electric-500">{plan.price}</span>
                    <span className="text-xl font-bold text-brutalist-black dark:text-brutalist-white">{plan.period}</span>
                  </div>
                  <p className="text-lg font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="w-6 h-6 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <Check className="h-3 w-3 text-brutalist-black" />
                      </div>
                      <span className="font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <Link
                    to="/auth"
                    className={`inline-flex items-center px-6 py-4 font-black uppercase tracking-wider text-sm transition-all duration-300 ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="brutal-card p-12 hover-lift">
          <h2 className="text-4xl font-black text-brutalist-black dark:text-brutalist-white mb-8 uppercase tracking-tight text-center">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-wider">
                  HOW DOES THE FREE TRIAL WORK?
                </h3>
                <p className="text-lg font-bold text-brutalist-black dark:text-brutalist-white">
                  Start with a 7-day free trial on any paid plan. No credit card required. Cancel anytime before the trial ends to avoid charges.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-black text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-wider">
                  CAN I UPGRADE OR DOWNGRADE?
                </h3>
                <p className="text-lg font-bold text-brutalist-black dark:text-brutalist-white">
                  Yes! Change your plan anytime. Upgrades take effect immediately, downgrades apply at your next billing cycle.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-black text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-wider">
                  WHAT PAYMENT METHODS DO YOU ACCEPT?
                </h3>
                <p className="text-lg font-bold text-brutalist-black dark:text-brutalist-white">
                  We accept all major credit cards, PayPal, and bank transfers through our secure payment processor Paddle.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-wider">
                  IS THERE A REFUND POLICY?
                </h3>
                <p className="text-lg font-bold text-brutalist-black dark:text-brutalist-white">
                  Yes! New customers get a 7-day money-back guarantee. See our <Link to="/refund-policy" className="text-electric-500 hover:underline">refund policy</Link> for details.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-black text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-wider">
                  DO YOU OFFER CUSTOM PLANS?
                </h3>
                <p className="text-lg font-bold text-brutalist-black dark:text-brutalist-white">
                  Yes! For enterprise needs or custom requirements, contact our sales team for a personalized quote.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-black text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-wider">
                  WHAT SUPPORT DO YOU PROVIDE?
                </h3>
                <p className="text-lg font-bold text-brutalist-black dark:text-brutalist-white">
                  Free plans get email support. Paid plans get priority support with faster response times. Agency plans get dedicated support.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="brutal-card p-12 hover-lift electric-pulse">
            <h2 className="text-4xl font-black text-brutalist-black dark:text-brutalist-white mb-6 uppercase tracking-tight">
              READY TO GET STARTED?
            </h2>
            <p className="text-xl text-brutalist-black dark:text-brutalist-white font-bold uppercase tracking-wider mb-8 max-w-2xl mx-auto">
              JOIN THOUSANDS OF BUSINESSES CREATING WINNING PROPOSALS WITH AI
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center px-12 py-6 bg-electric-500 text-brutalist-black border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift font-black uppercase tracking-wider text-xl transition-all duration-300"
            >
              <Rocket className="h-8 w-8 mr-4" />
              START YOUR FREE TRIAL
              <ArrowRight className="h-8 w-8 ml-4" />
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}