import { useState } from 'react'
import { ArrowLeft, Save, Send, Eye, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import SimpleAIGenerator from '../components/SimpleAIGenerator'
import { OpenAIProposalResponse } from '../services/openaiService'
import toast from 'react-hot-toast'

export default function ProposalBuilder() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generatedProposal, setGeneratedProposal] = useState<OpenAIProposalResponse | null>(null)
  const [projectData, setProjectData] = useState<any>(null)
  const navigate = useNavigate()

  const handleProposalGenerated = (proposal: OpenAIProposalResponse, formData: any) => {
    setGeneratedProposal(proposal)
    setProjectData(formData)
    if (proposal.success) {
      toast.success('Proposal generated successfully!')
    } else {
      toast.error(proposal.error || 'Failed to generate proposal')
    }
  }

  const handleSave = async () => {
    if (!generatedProposal?.success || !projectData || !user) {
      toast.error('No proposal to save. Generate one first.')
      return
    }

    setLoading(true)
    try {
      // First, get or create a workspace for the user
      let workspace = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!workspace.data) {
        const { data: newWorkspace } = await supabase
          .from('workspaces')
          .insert({
            owner_id: user.id,
            name: 'My Workspace',
            slug: `workspace-${user.id}`
          })
          .select('id')
          .single()
        
        workspace.data = newWorkspace
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          workspace_id: workspace.data.id,
          created_by: user.id,
          title: projectData.title,
          client_name: projectData.clientName,
          client_email: projectData.clientEmail,
          client_company: projectData.clientCompany,
          project_data: {
            description: projectData.description,
            estimatedBudget: projectData.estimatedBudget,
            timeline: projectData.timeline,
            industry: projectData.industry
          },
          estimated_budget: projectData.estimatedBudget ? Number(projectData.estimatedBudget) : null,
          estimated_timeline: projectData.timeline ? Number(projectData.timeline) * 7 : null // Convert weeks to days
        })
        .select('id')
        .single()

      if (projectError) throw projectError

      // Create proposal
      const { error: proposalError } = await supabase
        .from('proposals')
        .insert({
          project_id: project.id,
          created_by: user.id,
          title: generatedProposal.content.title,
          content: {
            sections: generatedProposal.content.sections,
            metadata: generatedProposal.content.metadata
          },
          status: 'draft',
          language: generatedProposal.content.metadata.language,
          pricing_total: generatedProposal.pricing?.total || null,
          pricing_breakdown: generatedProposal.pricing?.breakdown || null
        })

      if (proposalError) throw proposalError

      toast.success('Proposal saved as draft!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error saving proposal:', error)
      toast.error('Failed to save proposal')
    } finally {
      setLoading(false)
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
    <div className="min-h-screen p-6 bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk relative overflow-hidden">
      {/* Ultra-Brutal Geometric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-4 border-electric-500 animate-pulse shadow-brutal"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-electric-500 shadow-brutal animate-bounce" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-40 left-1/3 w-16 h-16 border-2 border-brutalist-black dark:border-brutalist-white animate-spin shadow-brutal" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-20 right-1/4 w-12 h-12 bg-brutalist-black dark:bg-brutalist-white animate-pulse shadow-brutal" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Brutal Header */}
        <div className="brutal-card p-8 mb-8 hover-lift electric-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <Link to="/dashboard">
                <button className="btn-secondary px-6 py-3 group hover:shadow-brutal-lg transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                  BACK TO DASHBOARD
                </button>
              </Link>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal mr-4 flex items-center justify-center hover:animate-spin transition-transform">
                  <Zap className="h-8 w-8 text-brutalist-black" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-tighter mb-2">
                    CREATE PROPOSAL
                  </h1>
                  <p className="text-xl text-electric-500 font-bold uppercase tracking-wider animate-pulse">
                    GENERATE YOUR WINNING PROPOSAL IN 60 SECONDS
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handlePreview}
                className="btn-secondary px-6 py-3 group hover:shadow-brutal-lg transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                <Eye className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                PREVIEW
              </button>
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="btn-secondary px-6 py-3 group hover:shadow-brutal-lg transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
              >
                <Save className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                {loading ? 'SAVING...' : 'SAVE DRAFT'}
              </button>
              <button 
                onClick={handleSend} 
                disabled={!generatedProposal?.success}
                className="btn-primary px-8 py-3 group electric-pulse hover:shadow-brutal-lg transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
              >
                <Send className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                SEND PROPOSAL
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Generator Form */}
          <div>
            <SimpleAIGenerator onProposalGenerated={handleProposalGenerated} />
          </div>

          {/* Brutal Live Preview */}
          <div className="brutal-card p-8 hover-lift relative overflow-hidden">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal mr-4 flex items-center justify-center">
                <Eye className="h-5 w-5 text-brutalist-black" />
              </div>
              <h2 className="text-3xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wide">LIVE PREVIEW</h2>
            </div>
            
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
              <div className="brutal-card p-12 min-h-96 flex items-center justify-center bg-brutalist-gray/20">
                <div className="text-center">
                  <div className="mb-8">
                    <div className="w-24 h-24 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal mx-auto mb-6 flex items-center justify-center animate-pulse">
                      <Eye className="h-12 w-12 text-brutalist-black" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white mb-4 uppercase tracking-wide">
                    PROPOSAL PREVIEW
                  </h3>
                  <p className="text-lg font-bold text-brutalist-gray uppercase tracking-wider mb-2">
                    WAITING FOR AI GENERATION
                  </p>
                  <p className="text-sm font-medium text-brutalist-gray">
                    Fill in the project details and click "GENERATE PROPOSAL" to see your AI-powered proposal
                  </p>
                  <div className="mt-8 flex justify-center">
                    <div className="h-2 w-32 bg-brutalist-gray border-2 border-brutalist-black dark:border-brutalist-white">
                      <div className="h-full bg-electric-500 w-0 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}