import { useState } from 'react'
import { Wand2, Loader2 } from 'lucide-react'
import { openaiService, OpenAIProposalResponse } from '../services/openaiService'
import toast from 'react-hot-toast'

interface SimpleAIGeneratorProps {
  onProposalGenerated?: (proposal: OpenAIProposalResponse, formData: any) => void
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
        onProposalGenerated?.(response, formData)
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
    <div className="brutal-card p-8 hover-lift electric-pulse">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal mr-4 flex items-center justify-center hover:animate-spin transition-transform">
          <Wand2 className="h-6 w-6 text-brutalist-black" />
        </div>
        <h2 className="text-3xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wide">
          AI PROPOSAL GENERATOR
        </h2>
      </div>
      
      <div className="space-y-6">
        {/* Basic Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-liquid">
            <label className="block text-sm font-black text-brutalist-black dark:text-brutalist-white mb-3 uppercase tracking-wider">
              PROJECT TITLE *
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Website Redesign for Coffee Shop"
              required
              className="block w-full px-4 py-4 border-4 border-brutalist-black dark:border-brutalist-white bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white placeholder-brutalist-gray font-bold text-lg focus:border-electric-500 focus:shadow-brutal-lg transition-all duration-200 uppercase tracking-wide"
            />
          </div>
          
          <div className="input-liquid">
            <label className="block text-sm font-black text-brutalist-black dark:text-brutalist-white mb-3 uppercase tracking-wider">
              CLIENT NAME *
            </label>
            <input
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              placeholder="John Doe"
              required
              className="block w-full px-4 py-4 border-4 border-brutalist-black dark:border-brutalist-white bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white placeholder-brutalist-gray font-bold text-lg focus:border-electric-500 focus:shadow-brutal-lg transition-all duration-200 uppercase tracking-wide"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-liquid">
            <label className="block text-sm font-black text-brutalist-black dark:text-brutalist-white mb-3 uppercase tracking-wider">
              CLIENT EMAIL
            </label>
            <input
              name="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={handleInputChange}
              placeholder="john@example.com"
              className="block w-full px-4 py-4 border-4 border-brutalist-black dark:border-brutalist-white bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white placeholder-brutalist-gray font-bold text-lg focus:border-electric-500 focus:shadow-brutal-lg transition-all duration-200"
            />
          </div>
          
          <div className="input-liquid">
            <label className="block text-sm font-black text-brutalist-black dark:text-brutalist-white mb-3 uppercase tracking-wider">
              COMPANY
            </label>
            <input
              name="clientCompany"
              value={formData.clientCompany}
              onChange={handleInputChange}
              placeholder="Coffee Shop Inc."
              className="block w-full px-4 py-4 border-4 border-brutalist-black dark:border-brutalist-white bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white placeholder-brutalist-gray font-bold text-lg focus:border-electric-500 focus:shadow-brutal-lg transition-all duration-200 uppercase tracking-wide"
            />
          </div>
        </div>

        {/* Project Description */}
        <div className="input-liquid">
          <label className="block text-sm font-black text-brutalist-black dark:text-brutalist-white mb-3 uppercase tracking-wider">
            PROJECT DESCRIPTION *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="block w-full px-4 py-4 border-4 border-brutalist-black dark:border-brutalist-white bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white placeholder-brutalist-gray font-bold text-lg focus:border-electric-500 focus:shadow-brutal-lg transition-all duration-200 resize-none"
            placeholder="DESCRIBE YOUR PROJECT REQUIREMENTS, GOALS, AND KEY DELIVERABLES..."
            required
          />
        </div>

        {/* Budget and Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-liquid">
            <label className="block text-sm font-black text-brutalist-black dark:text-brutalist-white mb-3 uppercase tracking-wider">
              ESTIMATED BUDGET ($)
            </label>
            <input
              name="estimatedBudget"
              type="number"
              value={formData.estimatedBudget}
              onChange={handleInputChange}
              placeholder="5000"
              className="block w-full px-4 py-4 border-4 border-brutalist-black dark:border-brutalist-white bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white placeholder-brutalist-gray font-bold text-lg focus:border-electric-500 focus:shadow-brutal-lg transition-all duration-200"
            />
          </div>
          
          <div className="input-liquid">
            <label className="block text-sm font-black text-brutalist-black dark:text-brutalist-white mb-3 uppercase tracking-wider">
              TIMELINE (WEEKS)
            </label>
            <input
              name="timeline"
              type="number"
              value={formData.timeline}
              onChange={handleInputChange}
              placeholder="4"
              className="block w-full px-4 py-4 border-4 border-brutalist-black dark:border-brutalist-white bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white placeholder-brutalist-gray font-bold text-lg focus:border-electric-500 focus:shadow-brutal-lg transition-all duration-200"
            />
          </div>
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
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !formData.title || !formData.clientName || !formData.description}
          className="btn-primary w-full py-6 px-8 text-2xl group electric-pulse hover:shadow-brutal-lg transform hover:-translate-x-2 hover:-translate-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-8 w-8 mr-4 animate-spin" />
              GENERATING BRUTAL PROPOSAL...
            </>
          ) : (
            <>
              <Wand2 className="h-8 w-8 mr-4 group-hover:animate-spin" />
              GENERATE PROPOSAL WITH AI
            </>
          )}
          {/* Electric border animation */}
          <div className="absolute inset-0 border-4 border-electric-500 opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none animate-pulse"></div>
        </button>
      </div>
    </div>
  )
}