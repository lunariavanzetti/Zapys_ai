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
    <GlassCard variant="brutalist" className="p-6">
      <h2 className="text-2xl font-bold text-brutalist-black dark:text-brutalist-white mb-6 flex items-center uppercase tracking-wide">
        <Wand2 className="h-6 w-6 mr-3" />
        AI PROPOSAL GENERATOR
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
          <label className="block text-sm font-bold text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-wide">
            PROJECT DESCRIPTION *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="block w-full px-4 py-3 border-2 border-brutalist-black dark:border-brutalist-white bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white placeholder-brutalist-gray font-medium focus:border-electric-500 focus:shadow-electric transition-all duration-200"
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
            <label className="block text-sm font-bold text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-wide">
              TONE
            </label>
            <select
              name="tone"
              value={preferences.tone}
              onChange={handlePreferenceChange}
              className="block w-full px-4 py-3 border-2 border-brutalist-black dark:border-brutalist-white bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white font-medium focus:border-electric-500 focus:shadow-electric transition-all duration-200"
            >
              <option value="professional" className="bg-brutalist-white dark:bg-brutalist-dark-gray">PROFESSIONAL</option>
              <option value="friendly" className="bg-brutalist-white dark:bg-brutalist-dark-gray">FRIENDLY</option>
              <option value="premium" className="bg-brutalist-white dark:bg-brutalist-dark-gray">PREMIUM</option>
              <option value="casual" className="bg-brutalist-white dark:bg-brutalist-dark-gray">CASUAL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-wide">
              LANGUAGE
            </label>
            <select
              name="language"
              value={preferences.language}
              onChange={handlePreferenceChange}
              className="block w-full px-4 py-3 border-2 border-brutalist-black dark:border-brutalist-white bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white font-medium focus:border-electric-500 focus:shadow-electric transition-all duration-200"
            >
              <option value="en" className="bg-brutalist-white dark:bg-brutalist-dark-gray">ENGLISH</option>
              <option value="uk" className="bg-brutalist-white dark:bg-brutalist-dark-gray">UKRAINIAN</option>
              <option value="ru" className="bg-brutalist-white dark:bg-brutalist-dark-gray">RUSSIAN</option>
              <option value="pl" className="bg-brutalist-white dark:bg-brutalist-dark-gray">POLISH</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-brutalist-black dark:text-brutalist-white mb-2 uppercase tracking-wide">
              TEMPLATE
            </label>
            <select
              name="templateType"
              value={preferences.templateType}
              onChange={handlePreferenceChange}
              className="block w-full px-4 py-3 border-2 border-brutalist-black dark:border-brutalist-white bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white font-medium focus:border-electric-500 focus:shadow-electric transition-all duration-200"
            >
              <option value="web_design" className="bg-brutalist-white dark:bg-brutalist-dark-gray">WEB DESIGN</option>
              <option value="development" className="bg-brutalist-white dark:bg-brutalist-dark-gray">DEVELOPMENT</option>
              <option value="branding" className="bg-brutalist-white dark:bg-brutalist-dark-gray">BRANDING</option>
              <option value="marketing" className="bg-brutalist-white dark:bg-brutalist-dark-gray">MARKETING</option>
              <option value="custom" className="bg-brutalist-white dark:bg-brutalist-dark-gray">CUSTOM</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <GlassButton
          variant="brutalist-electric"
          onClick={handleGenerate}
          disabled={isGenerating || !formData.title || !formData.clientName || !formData.description}
          loading={isGenerating}
          fullWidth
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              GENERATING PROPOSAL...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              GENERATE PROPOSAL WITH AI
            </>
          )}
        </GlassButton>
      </div>
    </GlassCard>
  )
}