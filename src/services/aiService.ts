// AI Service Integration
// Connects AI Proposal Generator with the existing application

import { 
  aiProposalGenerator, 
  ProposalGenerationRequest, 
  ProposalGenerationResponse 
} from './aiProposalGenerator';

export interface AIServiceConfig {
  anthropicApiKey?: string;
  defaultTone?: 'professional' | 'friendly' | 'premium' | 'casual';
  defaultLanguage?: 'en' | 'uk' | 'ru' | 'pl';
}

class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      defaultTone: 'professional',
      defaultLanguage: 'en',
      ...config
    };
  }

  /**
   * Generate a complete proposal using AI
   */
  async generateProposal(request: ProposalGenerationRequest): Promise<ProposalGenerationResponse> {
    try {
      // Add default preferences if not provided
      const requestWithDefaults: ProposalGenerationRequest = {
        ...request,
        userPreferences: {
          tone: this.config.defaultTone!,
          language: this.config.defaultLanguage!,
          ...request.userPreferences
        }
      };

      return await aiProposalGenerator.generateProposal(requestWithDefaults);
    } catch (error) {
      console.error('Error in AI service:', error);
      throw error;
    }
  }

  /**
   * Generate proposal from existing project data
   */
  async generateProposalFromProject(
    project: {
      title: string;
      clientName: string;
      clientEmail?: string;
      clientCompany?: string;
      description: string;
      estimatedBudget?: number;
      timeline?: number;
      industry?: string;
      deliverables?: string[];
    },
    preferences: {
      tone?: 'professional' | 'friendly' | 'premium' | 'casual';
      language?: 'en' | 'uk' | 'ru' | 'pl';
      templateType?: 'web_design' | 'development' | 'branding' | 'marketing' | 'custom';
      brandVoice?: string;
      customInstructions?: string;
    } = {}
  ): Promise<ProposalGenerationResponse> {
    const request: ProposalGenerationRequest = {
      projectData: project,
      userPreferences: {
        tone: preferences.tone || this.config.defaultTone!,
        language: preferences.language || this.config.defaultLanguage!,
        brandVoice: preferences.brandVoice,
        customInstructions: preferences.customInstructions
      },
      templateType: preferences.templateType
    };

    return this.generateProposal(request);
  }

  /**
   * Quick proposal generation with minimal data
   */
  async generateQuickProposal(
    title: string,
    clientName: string,
    description: string,
    options: {
      budget?: number;
      timeline?: number;
      tone?: 'professional' | 'friendly' | 'premium' | 'casual';
      language?: 'en' | 'uk' | 'ru' | 'pl';
      templateType?: 'web_design' | 'development' | 'branding' | 'marketing' | 'custom';
    } = {}
  ): Promise<ProposalGenerationResponse> {
    const request: ProposalGenerationRequest = {
      projectData: {
        title,
        clientName,
        description,
        estimatedBudget: options.budget,
        timeline: options.timeline
      },
      userPreferences: {
        tone: options.tone || this.config.defaultTone!,
        language: options.language || this.config.defaultLanguage!
      },
      templateType: options.templateType
    };

    return this.generateProposal(request);
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): Array<{
    id: string;
    name: string;
    industry: string;
    description: string;
  }> {
    return [
      {
        id: 'web_design',
        name: 'Web Design & Development',
        industry: 'Web Design & Development',
        description: 'Perfect for website design, development, and digital transformation projects'
      },
      {
        id: 'development',
        name: 'Software Development',
        industry: 'Software Development',
        description: 'Ideal for custom software, mobile apps, and technical development projects'
      },
      {
        id: 'branding',
        name: 'Brand Design & Strategy',
        industry: 'Brand Design & Strategy',
        description: 'Great for brand identity, logo design, and brand strategy projects'
      },
      {
        id: 'marketing',
        name: 'Marketing & Advertising',
        industry: 'Marketing & Advertising',
        description: 'Excellent for marketing campaigns, digital marketing, and advertising projects'
      },
      {
        id: 'custom',
        name: 'Custom Solutions',
        industry: 'Custom Solutions',
        description: 'Flexible template for any type of project or service offering'
      }
    ];
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Array<{
    code: string;
    name: string;
    nativeName: string;
  }> {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'pl', name: 'Polish', nativeName: 'Polski' }
    ];
  }

  /**
   * Get available tones
   */
  getAvailableTones(): Array<{
    id: string;
    name: string;
    description: string;
  }> {
    return [
      {
        id: 'professional',
        name: 'Professional',
        description: 'Formal language, industry terminology, structured approach'
      },
      {
        id: 'friendly',
        name: 'Friendly',
        description: 'Conversational tone, personal touches, warm language'
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Sophisticated vocabulary, luxury positioning, exclusive feel'
      },
      {
        id: 'casual',
        name: 'Casual',
        description: 'Relaxed language, approachable style, informal structure'
      }
    ];
  }

  /**
   * Validate proposal request
   */
  validateProposalRequest(request: Partial<ProposalGenerationRequest>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.projectData?.title) {
      errors.push('Project title is required');
    }

    if (!request.projectData?.clientName) {
      errors.push('Client name is required');
    }

    if (!request.projectData?.description || request.projectData.description.length < 10) {
      errors.push('Project description is required and must be at least 10 characters');
    }

    if (request.userPreferences?.tone && 
        !['professional', 'friendly', 'premium', 'casual'].includes(request.userPreferences.tone)) {
      errors.push('Invalid tone preference');
    }

    if (request.userPreferences?.language && 
        !['en', 'uk', 'ru', 'pl'].includes(request.userPreferences.language)) {
      errors.push('Invalid language preference');
    }

    if (request.templateType && 
        !['web_design', 'development', 'branding', 'marketing', 'custom'].includes(request.templateType)) {
      errors.push('Invalid template type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  /**
   * Check if AI service is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.anthropicApiKey || !!import.meta.env.VITE_ANTHROPIC_API_KEY;
  }

  /**
   * Get service status
   */
  getStatus(): {
    configured: boolean;
    defaultTone: string;
    defaultLanguage: string;
    availableTemplates: number;
  } {
    return {
      configured: this.isConfigured(),
      defaultTone: this.config.defaultTone!,
      defaultLanguage: this.config.defaultLanguage!,
      availableTemplates: this.getAvailableTemplates().length
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default AIService;