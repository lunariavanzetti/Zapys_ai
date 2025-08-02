/**
 * OpenAI Service for Zapys AI
 * Integrates with GPT-4o Mini for AI-powered features
 */

interface OpenAIProposalRequest {
  projectData: {
    title: string
    clientName: string
    clientEmail?: string
    clientCompany?: string
    description: string
    deliverables?: string[]
    estimatedBudget?: number
    timeline?: number
    industry?: string
  }
  userPreferences: {
    tone: 'professional' | 'friendly' | 'premium' | 'casual'
    language: 'en' | 'uk' | 'ru' | 'pl'
    brandVoice?: string
    customInstructions?: string
  }
  templateType?: 'web_design' | 'development' | 'branding' | 'marketing' | 'custom'
}

interface OpenAIProposalResponse {
  success: boolean
  content: {
    title: string
    sections: {
      executive_summary: string
      project_understanding: string
      proposed_solution: string
      deliverables: string
      timeline: string
      investment: string
      why_choose_us: string
      next_steps: string
    }
    metadata: {
      wordCount: number
      estimatedReadingTime: number
      language: string
      tone: string
    }
  }
  pricing?: {
    total: number
    breakdown: Record<string, number>
    currency: string
  }
  error?: string
}

class OpenAIService {
  private apiKey: string
  private baseUrl = 'https://api.openai.com/v1'

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. AI features will be disabled.')
    }
  }

  /**
   * Generate proposal content using GPT-4o Mini
   */
  async generateProposal(request: OpenAIProposalRequest): Promise<OpenAIProposalResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        content: {} as any,
        error: 'OpenAI API key not configured'
      }
    }

    try {
      const prompt = this.buildProposalPrompt(request)
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert proposal writer specializing in creating compelling, professional proposals for freelancers and agencies. Generate structured, persuasive content that wins clients.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const generatedContent = JSON.parse(data.choices[0].message.content)

      return {
        success: true,
        content: {
          title: generatedContent.title || `${request.projectData.title} - Professional Proposal`,
          sections: {
            executive_summary: generatedContent.sections?.executive_summary || '',
            project_understanding: generatedContent.sections?.project_understanding || '',
            proposed_solution: generatedContent.sections?.proposed_solution || '',
            deliverables: generatedContent.sections?.deliverables || '',
            timeline: generatedContent.sections?.timeline || '',
            investment: generatedContent.sections?.investment || '',
            why_choose_us: generatedContent.sections?.why_choose_us || '',
            next_steps: generatedContent.sections?.next_steps || ''
          },
          metadata: {
            wordCount: generatedContent.metadata?.wordCount || 0,
            estimatedReadingTime: generatedContent.metadata?.estimatedReadingTime || 2,
            language: request.userPreferences.language,
            tone: request.userPreferences.tone
          }
        },
        pricing: generatedContent.pricing
      }
    } catch (error) {
      console.error('Error generating proposal:', error)
      return {
        success: false,
        content: {} as any,
        error: 'Failed to generate proposal. Please try again.'
      }
    }
  }

  /**
   * Parse data from external sources
   */
  async parseExternalData(source: string, data: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const prompt = this.buildParsingPrompt(source, data)
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a data extraction expert. Parse and normalize project data from various sources into a standard format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: 'json_object' }
        })
      })

      const result = await response.json()
      return JSON.parse(result.choices[0].message.content)
    } catch (error) {
      console.error('Error parsing external data:', error)
      throw new Error('Failed to parse external data')
    }
  }

  /**
   * Process analytics and generate insights
   */
  async processAnalytics(data: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const prompt = this.buildAnalyticsPrompt(data)
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a business analytics expert. Analyze proposal engagement data and provide actionable insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        })
      })

      const result = await response.json()
      return JSON.parse(result.choices[0].message.content)
    } catch (error) {
      console.error('Error processing analytics:', error)
      throw new Error('Failed to process analytics')
    }
  }

  private buildProposalPrompt(request: OpenAIProposalRequest): string {
    const { projectData, userPreferences, templateType } = request
    
    return `Generate a complete, professional proposal in ${userPreferences.language} with a ${userPreferences.tone} tone.

Project Details:
- Title: ${projectData.title}
- Client: ${projectData.clientName}${projectData.clientCompany ? ` (${projectData.clientCompany})` : ''}
- Description: ${projectData.description}
- Budget: ${projectData.estimatedBudget ? `$${projectData.estimatedBudget}` : 'To be discussed'}
- Timeline: ${projectData.timeline ? `${projectData.timeline} weeks` : 'Flexible'}
- Industry: ${projectData.industry || 'General'}
- Template: ${templateType || 'custom'}

${userPreferences.brandVoice ? `Brand Voice: ${userPreferences.brandVoice}` : ''}
${userPreferences.customInstructions ? `Special Instructions: ${userPreferences.customInstructions}` : ''}

Return a JSON object with this structure:
{
  "title": "Proposal title",
  "sections": {
    "executive_summary": "Compelling 150-200 word summary",
    "project_understanding": "200-250 words showing deep understanding",
    "proposed_solution": "300-400 words detailing approach",
    "deliverables": "150-200 words listing specific outcomes",
    "timeline": "100-150 words with project phases",
    "investment": "100-150 words presenting pricing confidently",
    "why_choose_us": "150-200 words highlighting expertise",
    "next_steps": "50-100 words with clear call-to-action"
  },
  "metadata": {
    "wordCount": total_word_count,
    "estimatedReadingTime": reading_time_minutes
  },
  "pricing": {
    "total": estimated_total,
    "breakdown": {"phase1": amount, "phase2": amount},
    "currency": "USD"
  }
}`
  }

  private buildParsingPrompt(source: string, data: any): string {
    return `Extract and normalize project data from ${source} source.

Data to parse:
${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}

Return a JSON object with this structure:
{
  "success": true,
  "projects": [{
    "title": "Project title",
    "clientName": "Client name",
    "clientEmail": "email if found",
    "clientCompany": "company if found",
    "description": "Project description",
    "deliverables": ["list", "of", "deliverables"],
    "estimatedBudget": budget_number_or_null,
    "timeline": timeline_in_weeks_or_null,
    "industry": "industry if identified",
    "priority": "low|medium|high",
    "status": "discovery|proposal|active|completed",
    "tags": ["relevant", "tags"]
  }],
  "metadata": {
    "source": "${source}",
    "parsedAt": "${new Date().toISOString()}",
    "itemCount": number_of_projects,
    "language": "detected_language",
    "confidence": confidence_score_0_to_1
  }
}`
  }

  private buildAnalyticsPrompt(data: any): string {
    return `Analyze proposal engagement data and provide insights.

Analytics Data:
${JSON.stringify(data, null, 2)}

Return a JSON object with this structure:
{
  "success": true,
  "analytics": {
    "summary": {
      "totalViews": number,
      "uniqueVisitors": number,
      "avgTimeOnPage": seconds,
      "avgScrollDepth": percentage,
      "conversionRate": percentage
    },
    "insights": [{
      "type": "positive|negative|neutral",
      "category": "engagement|conversion|content|timing",
      "title": "Insight title",
      "description": "Detailed description",
      "impact": "high|medium|low",
      "actionable": true_or_false
    }],
    "recommendations": [{
      "priority": "high|medium|low",
      "category": "content|design|timing|follow-up",
      "title": "Recommendation title",
      "description": "What to do",
      "expectedImpact": "Expected improvement",
      "implementation": "How to implement"
    }]
  }
}`
  }
}

export const openaiService = new OpenAIService()
export type { OpenAIProposalRequest, OpenAIProposalResponse }