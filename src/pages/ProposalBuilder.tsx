import { useState } from 'react'
import { ArrowLeft, Save, Send, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import SimpleAIGenerator from '../components/SimpleAIGenerator'
import { OpenAIProposalResponse } from '../services/openaiService'
import toast from 'react-hot-toast'

export default function ProposalBuilder() {
  const [loading, setLoading] = useState(false)
  const [generatedProposal, setGeneratedProposal] = useState<OpenAIProposalResponse | null>(null)
  const navigate = useNavigate()

  const handleProposalGenerated = (proposal: OpenAIProposalResponse) => {
    setGeneratedProposal(proposal)
    if (proposal.success) {
      toast.success('Proposal generated successfully!')
    } else {
      toast.error(proposal.error || 'Failed to generate proposal')
    }
  }

  const handleSave = async () => {
    if (!generatedProposal?.success) {
      toast.error('No proposal to save. Generate one first.')
      return
    }

    setLoading(true)
    try {
      // TODO: Save to Supabase database
      setTimeout(() => {
        setLoading(false)
        toast.success('Proposal saved as draft!')
      }, 1000)
    } catch (error) {
      setLoading(false)
      toast.error('Failed to save proposal')
    }
  }

  const handleSend = async () => {
    if (!generatedProposal?.success) {
      toast.error('No proposal to send. Generate one first.')
      return
    }

    try {
      // TODO: Send proposal to client
      toast.success('Proposal sent to client!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to send proposal')
    }
  }

  const handlePreview = () => {
    if (!generatedProposal?.success) {
      toast.error('No proposal to preview. Generate one first.')
      return
    }
    
    // TODO: Open preview modal or navigate to preview page
    toast('Preview functionality coming soon!')
  }

  return (
    <div className="min-h-screen p-6 bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <GlassButton variant="brutalist" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                BACK
              </GlassButton>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-tight">
                CREATE PROPOSAL
              </h1>
              <p className="text-brutalist-gray dark:text-brutalist-gray font-medium">
                Generate your winning proposal with AI in 60 seconds
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <GlassButton variant="brutalist" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              PREVIEW
            </GlassButton>
            <GlassButton variant="brutalist" onClick={handleSave} loading={loading}>
              <Save className="h-4 w-4 mr-2" />
              SAVE DRAFT
            </GlassButton>
            <GlassButton variant="brutalist-electric" onClick={handleSend} disabled={!generatedProposal?.success}>
              <Send className="h-4 w-4 mr-2" />
              SEND PROPOSAL
            </GlassButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Generator Form */}
          <div>
            <SimpleAIGenerator onProposalGenerated={handleProposalGenerated} />
          </div>

          {/* Live Preview */}
          <GlassCard variant="brutalist" className="p-6">
            <h2 className="text-2xl font-bold text-brutalist-black dark:text-brutalist-white mb-6 uppercase tracking-wide">LIVE PREVIEW</h2>
            
            {generatedProposal?.success ? (
              <div className="prose prose-invert max-w-none">
                <div className="space-y-6">
                  {/* Proposal Title */}
                  <div className="text-center border-b border-white/20 pb-4">
                    <h1 className="text-2xl font-bold text-white mb-2">
                      {generatedProposal.content.title}
                    </h1>
                    <div className="text-sm text-white/60">
                      {generatedProposal.content.metadata.wordCount} words • 
                      {generatedProposal.content.metadata.estimatedReadingTime} min read
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Executive Summary</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {generatedProposal.content.sections.executive_summary}
                    </p>
                  </div>

                  {/* Project Understanding */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Project Understanding</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {generatedProposal.content.sections.project_understanding}
                    </p>
                  </div>

                  {/* Proposed Solution */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Proposed Solution</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {generatedProposal.content.sections.proposed_solution}
                    </p>
                  </div>

                  {/* Deliverables */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Deliverables</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {generatedProposal.content.sections.deliverables}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Timeline</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {generatedProposal.content.sections.timeline}
                    </p>
                  </div>

                  {/* Investment */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Investment</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {generatedProposal.content.sections.investment}
                    </p>
                    {generatedProposal.pricing && (
                      <div className="mt-4 p-4 bg-white/5 rounded-xl">
                        <div className="text-2xl font-bold text-white">
                          Total: ${generatedProposal.pricing.total.toLocaleString()}
                        </div>
                        {generatedProposal.pricing.breakdown && (
                          <div className="mt-2 text-sm text-white/70">
                            {Object.entries(generatedProposal.pricing.breakdown).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span>{key}:</span>
                                <span>${value.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Why Choose Us */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Why Choose Us</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {generatedProposal.content.sections.why_choose_us}
                    </p>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Next Steps</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {generatedProposal.content.sections.next_steps}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl p-6 min-h-96 flex items-center justify-center">
                <div className="text-center text-white/50">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <p className="text-lg font-medium mb-2">Proposal preview will appear here</p>
                  <p className="text-sm">Fill in the project details and click "Generate Proposal" to see your AI-powered proposal</p>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}