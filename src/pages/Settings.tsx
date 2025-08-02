import { useState } from 'react'
import { User, CreditCard, Bell, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import GlassInput from '../components/ui/GlassInput'

export default function Settings() {
  const { userProfile, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: userProfile?.full_name || '',
    email: userProfile?.email || '',
    locale: userProfile?.locale || 'en',
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Zap },
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              
              <div className="space-y-4">
                <GlassInput
                  label="Full Name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  fullWidth
                />
                
                <GlassInput
                  label="Email"
                  value={profileData.email}
                  disabled
                  fullWidth
                />
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Language
                  </label>
                  <select
                    value={profileData.locale}
                    onChange={(e) => setProfileData({ ...profileData, locale: e.target.value as any })}
                    className="block w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/30 dark:border-white/20 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-gray-800">
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <GlassButton onClick={handleSaveProfile} loading={loading}>
                  Save Changes
                </GlassButton>
              </div>
            </div>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Subscription</h3>
              
              <GlassCard className="p-6 border-primary-500/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-white capitalize">
                      {userProfile?.subscription_tier || 'Free'} Plan
                    </h4>
                    <p className="text-white/60 text-sm">
                      {userProfile?.subscription_tier === 'free' 
                        ? 'Limited to 5 proposals per month'
                        : 'Unlimited proposals and features'
                      }
                    </p>
                  </div>
                  
                  {userProfile?.subscription_tier === 'free' && (
                    <GlassButton>
                      Upgrade
                    </GlassButton>
                  )}
                </div>
                
                {userProfile?.subscription_tier !== 'free' && (
                  <div className="text-sm text-white/60">
                    <p>Next billing date: January 15, 2024</p>
                    <p>Cancel anytime from your billing portal</p>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
            
            <div className="space-y-4">
              {[
                { label: 'Proposal viewed by client', description: 'Get notified when someone views your proposal' },
                { label: 'Proposal signed', description: 'Get notified when a proposal is signed' },
                { label: 'Weekly analytics summary', description: 'Receive weekly performance reports' },
                { label: 'Product updates', description: 'Stay informed about new features' },
              ].map((item, index) => (
                <GlassCard key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-white/60">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Connected Integrations</h3>
            
            <div className="space-y-4">
              {[
                { name: 'Notion', description: 'Import project data from your Notion workspace', connected: false },
                { name: 'Google Drive', description: 'Save proposals to your Google Drive', connected: false },
                { name: 'Slack', description: 'Get notifications in your Slack workspace', connected: false },
              ].map((integration, index) => (
                <GlassCard key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{integration.name}</h4>
                      <p className="text-white/60 text-sm">{integration.description}</p>
                    </div>
                    
                    <GlassButton variant={integration.connected ? 'outline' : 'primary'} size="sm">
                      {integration.connected ? 'Disconnect' : 'Connect'}
                    </GlassButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/70">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-2xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </GlassCard>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <GlassCard className="p-8">
              {renderTabContent()}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}