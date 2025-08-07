import { useState } from 'react'
import { User, CreditCard, Bell, Zap, Settings as SettingsIcon, Save, Globe, Mail, Key, Shield, Crown, Check, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Settings() {
  const { userProfile, updateProfile, user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: userProfile?.full_name || '',
    email: userProfile?.email || user?.email || '',
    locale: userProfile?.locale || 'en',
  })

  const tabs = [
    { id: 'profile', label: 'PROFILE', icon: User },
    { id: 'billing', label: 'BILLING', icon: CreditCard },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell },
    { id: 'integrations', label: 'INTEGRATIONS', icon: Zap },
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ru', name: 'Russian' },
    { code: 'pl', name: 'Polish' },
  ]

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await updateProfile({
        full_name: profileData.full_name,
        locale: profileData.locale as any,
      })
    } catch (error) {
      // Error is handled in updateProfile
    } finally {
      setLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center">
                <User className="h-8 w-8 text-brutalist-black" />
              </div>
              <h3 className="text-4xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-tight">
                PERSONAL INFORMATION
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="input-liquid">
                <label className="block text-sm font-black text-brutalist-black dark:text-brutalist-white mb-3 uppercase tracking-wider">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className="w-full px-6 py-4 bg-brutalist-white dark:bg-brutalist-dark-gray border-2 border-brutalist-black dark:border-brutalist-white font-bold text-brutalist-black dark:text-brutalist-white placeholder-brutalist-black dark:placeholder-brutalist-white uppercase tracking-wider"
                  placeholder="ENTER YOUR FULL NAME"
                />
              </div>
              
              <div className="input-liquid">
                <label className="block text-sm font-black text-brutalist-black dark:text-brutalist-white mb-3 uppercase tracking-wider">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-6 py-4 bg-brutalist-gray border-2 border-brutalist-black dark:border-brutalist-white font-bold text-brutalist-black opacity-60 uppercase tracking-wider cursor-not-allowed"
                />
              </div>
              
              <div className="input-liquid">
                <label className="block text-sm font-black text-brutalist-black dark:text-brutalist-white mb-3 uppercase tracking-wider">
                  LANGUAGE
                </label>
                <select
                  value={profileData.locale}
                  onChange={(e) => setProfileData({ ...profileData, locale: e.target.value as any })}
                  className="w-full px-6 py-4 bg-brutalist-white dark:bg-brutalist-dark-gray border-2 border-brutalist-black dark:border-brutalist-white font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white">
                      {lang.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center px-8 py-4 bg-electric-500 text-brutalist-black border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift font-black uppercase tracking-wider transition-all duration-300 hover:bg-electric-400"
              >
                <Save className="h-5 w-5 mr-3" />
                {loading ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-brutalist-black" />
              </div>
              <h3 className="text-4xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-tight">
                BILLING & SUBSCRIPTION
              </h3>
            </div>
            
            {/* Current Plan */}
            <div className="brutal-card p-8 hover-lift">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center">
                    <Crown className="h-6 w-6 text-brutalist-black" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white uppercase">
                      {userProfile?.subscription_tier?.toUpperCase() || 'FREE'} PLAN
                    </h4>
                    <p className="text-lg font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
                      {userProfile?.subscription_tier === 'free' 
                        ? 'LIMITED TO 50 PROPOSALS PER MONTH'
                        : 'UNLIMITED PROPOSALS AND FEATURES'
                      }
                    </p>
                  </div>
                </div>
                
                {userProfile?.subscription_tier === 'free' && (
                  <button className="px-6 py-3 bg-electric-500 text-brutalist-black border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift font-black uppercase tracking-wider">
                    UPGRADE NOW
                  </button>
                )}
              </div>
              
              {userProfile?.subscription_tier !== 'free' && (
                <div className="border-t-2 border-brutalist-black dark:border-brutalist-white pt-6">
                  <div className="text-lg font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider space-y-2">
                    <p>NEXT BILLING DATE: JANUARY 15, 2025</p>
                    <p>CANCEL ANYTIME FROM YOUR BILLING PORTAL</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'STARTER', price: '$19', features: ['50 PROPOSALS', 'BASIC TEMPLATES', 'EMAIL SUPPORT'] },
                { name: 'PRO', price: '$49', features: ['UNLIMITED PROPOSALS', 'AI PRICING', 'ANALYTICS', 'PRIORITY SUPPORT'], popular: true },
                { name: 'AGENCY', price: '$99', features: ['EVERYTHING IN PRO', 'WHITE-LABEL', 'TEAM COLLABORATION', 'DEDICATED SUPPORT'] }
              ].map((plan, index) => (
                <div key={index} className={`brutal-card p-6 hover-lift ${plan.popular ? 'electric-pulse' : ''}`}>
                  {plan.popular && (
                    <div className="mb-4 px-4 py-2 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal">
                      <span className="font-black text-brutalist-black uppercase tracking-wider text-sm">MOST POPULAR</span>
                    </div>
                  )}
                  <h4 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white mb-4 uppercase">{plan.name}</h4>
                  <div className="text-4xl font-black text-electric-500 mb-6">{plan.price}<span className="text-lg">/MONTH</span></div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <div className="w-4 h-4 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white mr-3"></div>
                        <span className="font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 bg-electric-500 text-brutalist-black border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift font-black uppercase tracking-wider">
                    {plan.popular ? 'UPGRADE NOW' : 'CHOOSE PLAN'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center">
                <Bell className="h-8 w-8 text-brutalist-black" />
              </div>
              <h3 className="text-4xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-tight">
                NOTIFICATION PREFERENCES
              </h3>
            </div>
            
            <div className="space-y-6">
              {[
                { label: 'PROPOSAL VIEWED BY CLIENT', description: 'GET NOTIFIED WHEN SOMEONE VIEWS YOUR PROPOSAL' },
                { label: 'PROPOSAL SIGNED', description: 'GET NOTIFIED WHEN A PROPOSAL IS SIGNED' },
                { label: 'WEEKLY ANALYTICS SUMMARY', description: 'RECEIVE WEEKLY PERFORMANCE REPORTS' },
                { label: 'PRODUCT UPDATES', description: 'STAY INFORMED ABOUT NEW FEATURES' },
              ].map((item, index) => (
                <div key={index} className="brutal-card p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider opacity-70">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-16 h-8 bg-brutalist-white dark:bg-brutalist-dark-gray border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal rounded-none peer-checked:bg-electric-500 peer-focus:outline-none peer-checked:after:translate-x-8 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-brutalist-black after:w-6 after:h-6 after:transition-all peer-checked:after:bg-brutalist-black"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center">
                <Zap className="h-8 w-8 text-brutalist-black" />
              </div>
              <h3 className="text-4xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-tight">
                CONNECTED INTEGRATIONS
              </h3>
            </div>
            
            <div className="space-y-6">
              {[
                { name: 'NOTION', description: 'IMPORT PROJECT DATA FROM YOUR NOTION WORKSPACE', connected: false },
                { name: 'GOOGLE DRIVE', description: 'SAVE PROPOSALS TO YOUR GOOGLE DRIVE', connected: false },
                { name: 'SLACK', description: 'GET NOTIFICATIONS IN YOUR SLACK WORKSPACE', connected: false },
                { name: 'HUBSPOT', description: 'SYNC CLIENT DATA WITH HUBSPOT CRM', connected: false },
              ].map((integration, index) => (
                <div key={index} className="brutal-card p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center">
                        <Zap className="h-6 w-6 text-brutalist-black" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">{integration.name}</h4>
                        <p className="text-sm font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wider opacity-70">{integration.description}</p>
                      </div>
                    </div>
                    
                    <button className={`px-6 py-3 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift font-black uppercase tracking-wider ${
                      integration.connected 
                        ? 'bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white'
                        : 'bg-electric-500 text-brutalist-black'
                    }`}>
                      {integration.connected ? 'DISCONNECT' : 'CONNECT'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

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
              <SettingsIcon className="h-10 w-10 text-brutalist-black" />
            </div>
            <div>
              <h1 className="text-6xl font-black text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-tight">
                SETTINGS
              </h1>
              <p className="text-2xl text-brutalist-black dark:text-brutalist-white font-black uppercase tracking-widest">
                MANAGE YOUR ACCOUNT SETTINGS & PREFERENCES
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="brutal-card p-8 hover-lift">
              <h2 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white mb-6 uppercase tracking-tight">
                CATEGORIES
              </h2>
              <nav className="space-y-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-6 py-4 border-2 font-black uppercase tracking-wider text-sm transition-all duration-300 hover-lift ${
                        activeTab === tab.id
                          ? 'bg-electric-500 text-brutalist-black border-brutalist-black dark:border-brutalist-white shadow-brutal'
                          : 'bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white border-brutalist-black dark:border-brutalist-white hover:bg-electric-500 hover:text-brutalist-black shadow-brutal'
                      }`}
                    >
                      <Icon className="h-6 w-6 mr-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="brutal-card p-8 hover-lift">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}