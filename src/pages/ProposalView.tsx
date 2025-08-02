import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Download, CheckCircle } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'

export default function ProposalView() {
  const { slug } = useParams<{ slug: string }>()
  const [proposal, setProposal] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Load proposal by slug
    // Track analytics event
    setTimeout(() => {
      setProposal({
        title: 'Website Redesign Proposal',
        client_name: 'Coffee Shop Inc.',
        content_html: '<h1>Sample Proposal</h1><p>This is a sample proposal content...</p>',
        pricing_total: 5000,
        status: 'sent'
      })
      setLoading(false)
    }, 1000)
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Proposal Not Found</h1>
          <p className="text-white/70">The proposal you're looking for doesn't exist or has expired.</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">{proposal.title}</h1>
              <p className="text-white/60 text-sm">For {proposal.client_name}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <GlassButton variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </GlassButton>
              
              {proposal.status !== 'signed' && (
                <GlassButton size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Proposal
                </GlassButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <GlassCard className="p-8">
          {/* Proposal Content */}
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: proposal.content_html }}
          />
          
          {/* Signature Section */}
          {proposal.status !== 'signed' && (
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Ready to get started?</h3>
                <p className="text-white/70 mb-6">
                  Click below to accept this proposal and begin the project.
                </p>
                
                <GlassButton size="lg">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Accept & Sign Proposal
                </GlassButton>
                
                <p className="text-sm text-white/50 mt-4">
                  By clicking "Accept & Sign", you agree to the terms outlined in this proposal.
                </p>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}