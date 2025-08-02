import { useState } from 'react'
import { ArrowLeft, Save, Send, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import GlassInput from '../components/ui/GlassInput'

export default function ProposalBuilder() {
  const [loading, setLoading] = useState(false)
  const [proposalData, setProposalData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    description: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProposalData({
      ...proposalData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    setLoading(true)
    // TODO: Implement save functionality
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <GlassButton variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </GlassButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Create Proposal</h1>
              <p className="text-white/70">Build your winning proposal with AI assistance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <GlassButton variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </GlassButton>
            <GlassButton variant="outline" onClick={handleSave} loading={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </GlassButton>
            <GlassButton>
              <Send className="h-4 w-4 mr-2" />
              Send Proposal
            </GlassButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Proposal Details</h2>
            
            <div className="space-y-6">
              <GlassInput
                label="Proposal Title"
                name="title"
                value={proposalData.title}
                onChange={handleInputChange}
                placeholder="Website Redesign for Coffee Shop"
                fullWidth
              />
              
              <div className="grid grid-cols-2 gap-4">
                <GlassInput
                  label="Client Name"
                  name="clientName"
                  value={proposalData.clientName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  fullWidth
                />
                
                <GlassInput
                  label="Client Email"
                  name="clientEmail"
                  type="email"
                  value={proposalData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  fullWidth
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Project Description
                </label>
                <textarea
                  name="description"
                  value={proposalData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/30 dark:border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
                  placeholder="Describe your project requirements, goals, and key deliverables..."
                />
              </div>
              
              <GlassButton fullWidth className="mt-6">
                🤖 Generate with AI
              </GlassButton>
            </div>
          </GlassCard>

          {/* Preview */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Live Preview</h2>
            
            <div className="prose prose-invert max-w-none">
              <div className="bg-white/5 rounded-2xl p-6 min-h-96">
                <div className="text-center text-white/50">
                  <p>Proposal preview will appear here...</p>
                  <p className="text-sm mt-2">Fill in the details and click "Generate with AI" to see your proposal</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}