import { useState } from 'react'
import { Wand2, Loader2 } from 'lucide-react'
import { openaiService, OpenAIProposalResponse } from '../services/openaiService'
import GlassCard from './ui/GlassCard'
import GlassButton from './ui/GlassButton'
import GlassInput from './ui/GlassInput'
import toast from 'react-hot-toast'

interface SimpleAIGeneratorProps {
  onProposalGenerated?: (proposal: OpenAIProposalResponse) => void
}

export default function SimpleAIGenerator({ onProposalGenerated }: SimpleAIGeneratorProps) {
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    description: '',
    estimatedBudget: '',
    timeline: '',
    industry: ''
  })
  
  const [preferences, setPreferences] = useState({
    tone: 'professional' as const,
    language: 'en' as const,
    templateType: 'web_design' as const
  })
  
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value,
    })
  }

  const handleGenerate = async () => {
    if (!formData.title || !formData.clientName || !formData.description) {
      toast.error('Please fill in title, client name, and description')
      return
    }

    setIsGenerating(true)

    try {
      const response = await openaiService.generateProposal({
        projectData: {
          title: formData.title,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientCompany: formData.clientCompany,
          description: formData.description,
          estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : undefined,
          timeline: formData.timeline ? Number(formData.timeline) : undefined,
          industry: formData.industry
        },
        userPreferences: preferences,
        templateType: preferences.templateType
      })

      if (response.success) {
        toast.success('Proposal generated successfully!')
        onProposalGenerated?.(response)
      } else {
        toast.error(response.error || 'Failed to generate proposal')
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate proposal')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Wand2 className="h-5 w-5 mr-2" />
        AI Proposal Generator
      </h2>
      
      <div className="space-y-6">
        {/* Basic Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Website Redesign for Coffee Shop"
            required
            fullWidth
          />
          
          <GlassInput
            label="Client Name"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            placeholder="John Doe"
            required
            fullWidth
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Client Email"
            name="clientEmail"
            type="email"
            value={formData.clientEmail}
            onChange={handleInputChange}
            placeholder="john@example.com"
            fullWidth
          />
          
          <GlassInput
            label="Company"
            name="clientCompany"
            value={formData.clientCompany}
            onChange={handleInputChange}
            placeholder="Coffee Shop Inc."
            fullWidth
          />
        </div>

        {/* Project Description */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Project Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="block w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/30 dark:border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
            placeholder="Describe your project requirements, goals, and key deliverables..."
            required
          />
        </div>

        {/* Budget and Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Estimated Budget ($)"
            name="estimatedBudget"
            type="number"
            value={formData.estimatedBudget}
            onChange={handleInputChange}
            placeholder="5000"
            fullWidth
          />
          
          <GlassInput
            label="Timeline (weeks)"
            name="timeline"
            type="number"
            value={formData.timeline}
            onChange={handleInputChange}
            placeholder="4"
            fullWidth
          />
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Tone
            </label>
            <select
              name="tone"
              value={preferences.tone}
              onChange={handlePreferenceChange}
              className="block w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/30 dark:border-white/20 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
            >
              <option value="professional" className="bg-gray-800">Professional</option>
              <option value="friendly" className="bg-gray-800">Friendly</option>
              <option value="premium" className="bg-gray-800">Premium</option>
              <option value="casual" className="bg-gray-800">Casual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Language
            </label>
            <select
              name="language"
              value={preferences.language}
              onChange={handlePreferenceChange}
              className="block w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/30 dark:border-white/20 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
            >
              <option value="en" className="bg-gray-800">English</option>
              <option value="uk" className="bg-gray-800">Ukrainian</option>
              <option value="ru" className="bg-gray-800">Russian</option>
              <option value="pl" className="bg-gray-800">Polish</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Template
            </label>
            <select
              name="templateType"
              value={preferences.templateType}
              onChange={handlePreferenceChange}
              className="block w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/30 dark:border-white/20 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
            >
              <option value="web_design" className="bg-gray-800">Web Design</option>
              <option value="development" className="bg-gray-800">Development</option>
              <option value="branding" className="bg-gray-800">Branding</option>
              <option value="marketing" className="bg-gray-800">Marketing</option>
              <option value="custom" className="bg-gray-800">Custom</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <GlassButton
          onClick={handleGenerate}
          disabled={isGenerating || !formData.title || !formData.clientName || !formData.description}
          loading={isGenerating}
          fullWidth
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating Proposal...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Generate Proposal with AI
            </>
          )}
        </GlassButton>
      </div>
    </GlassCard>
  )
}