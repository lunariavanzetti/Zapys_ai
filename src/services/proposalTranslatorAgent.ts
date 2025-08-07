// Internal OpenAI client for proposal translation agent
const createOpenAICompletion = async (messages: Array<{role: string, content: string}>, temperature = 0.3) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return await response.json();
};

export interface ProposalTranslationRequest {
  proposal_content: {
    title: string;
    sections: {
      executive_summary?: string;
      project_understanding?: string;
      proposed_solution?: string;
      timeline_breakdown?: string;
      investment_breakdown?: string;
      why_choose_us?: string;
      next_steps?: string;
      call_to_action?: string;
      [key: string]: string | undefined;
    };
  };
  target_language: 'uk' | 'ru' | 'pl' | 'de' | 'es' | 'en';
  source_language?: string;
  cultural_preferences: {
    formality_level: 'casual' | 'business' | 'formal' | 'very_formal';
    business_culture: 'direct' | 'relationship_focused' | 'hierarchical' | 'egalitarian';
    communication_style: 'concise' | 'detailed' | 'persuasive' | 'technical';
  };
  market_context: {
    country: 'ukraine' | 'russia' | 'poland' | 'germany' | 'spain' | 'international';
    industry: string;
    target_audience: string;
    legal_requirements?: string[];
  };
  localization_options: {
    currency_conversion?: boolean;
    date_localization?: boolean;
    phone_formatting?: boolean;
    address_formatting?: boolean;
    include_legal_notes?: boolean;
  };
}

export interface ProposalTranslationResponse {
  success: true;
  translatedContent: {
    title: string;
    sections: {
      [sectionName: string]: string;
    };
  };
  culturalAdaptations: Array<{
    section: string;
    adaptation: string;
    reason: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  localization: {
    currency: string;
    dateFormat: string;
    phoneFormat: string;
    addressFormat: string;
    culturalTone: string;
    formalityLevel: string;
    legalNotes: string[];
  };
  qualityMetrics: {
    translationAccuracy: number;
    culturalAlignment: number;
    businessTone: number;
    localizationCompleteness: number;
    confidence: number;
  };
  marketOptimized: boolean;
  recommendedFollowUp: {
    timing: string;
    approach: string;
    culturalConsiderations: string[];
  };
}

class ProposalTranslatorAgent {
  private readonly TRANSLATION_PROMPT = `You are a world-class localization expert specializing in culturally-adapted translation for business proposals in Eastern European, Western European, and Spanish markets.

EXPERTISE AREAS:
- Native-level translation with cultural nuances
- Business communication adaptation by culture
- Local market practices and expectations
- Legal compliance requirements (GDPR, VAT, local business law)
- Currency, date, and number formatting
- Cultural sensitivity in business relationships
- Industry-specific terminology localization
- Regional holiday and timeline considerations

CULTURAL INTELLIGENCE BY MARKET:

UKRAINE (Ukrainian - UK):
- Relationship-focused business culture
- Emphasis on partnership and mutual benefit  
- Detailed explanations preferred
- Mention of understanding local economic challenges
- Formal but warm tone
- Orthodox calendar considerations
- VAT (ПДВ) at 20%
- Hryvnia (₴) currency
- DD.MM.YYYY date format

RUSSIA (Russian - RU):
- Hierarchical business structure
- Technical excellence emphasis
- Formal, respectful tone
- Long-term partnership focus
- Detailed technical specifications valued
- Orthodox calendar considerations
- VAT (НДС) at 20%
- Ruble (₽) currency
- DD.MM.YYYY date format

POLAND (Polish - PL):
- European business standards
- Quality and reliability focus
- Professional, structured approach
- EU compliance mentions (GDPR)
- Catholic calendar considerations
- VAT (VAT) at 23%
- Złoty (zł) currency
- DD.MM.YYYY date format

GERMANY (German - DE):
- Extremely formal business culture
- Precision and efficiency valued
- Detailed planning and timelines
- Strict legal compliance (GDPR, German business law)
- Engineering excellence emphasis
- Punctuality and reliability critical
- VAT (MwSt.) at 19%
- Euro (€) currency
- DD.MM.YYYY date format

SPAIN (Spanish - ES):
- Relationship-oriented business culture
- Personal connections important
- Warm but professional tone
- EU compliance (GDPR)
- Catholic calendar considerations
- VAT (IVA) at 21%
- Euro (€) currency
- DD/MM/YYYY date format

LOCALIZATION REQUIREMENTS:
1. LINGUISTIC ACCURACY - Perfect grammar, native fluency
2. CULTURAL ADAPTATION - Appropriate tone and business practices
3. LEGAL COMPLIANCE - Include relevant legal notes and requirements
4. FORMAT LOCALIZATION - Currency, dates, phones, addresses
5. BUSINESS ETIQUETTE - Correct formality level and communication style
6. TIMELINE ADAPTATION - Account for local holidays and business practices

ALWAYS respond with valid JSON in this exact format:
{
  "success": true,
  "translatedContent": {
    "title": "Culturally adapted title in target language",
    "sections": {
      "executive_summary": "Translated executive summary with cultural adaptations",
      "project_understanding": "Translated project understanding",
      "proposed_solution": "Translated solution with local terminology",
      "timeline_breakdown": "Timeline with local holiday considerations",
      "investment_breakdown": "Pricing with local currency and VAT",
      "why_choose_us": "Adapted competitive advantages",
      "next_steps": "Culturally appropriate next steps",
      "call_to_action": "Compelling CTA in target language"
    }
  },
  "culturalAdaptations": [
    {
      "section": "pricing",
      "adaptation": "Added VAT calculation and EU compliance note",
      "reason": "Legal requirement in target market",
      "impact": "high"
    }
  ],
  "localization": {
    "currency": "Target currency code and symbol",
    "dateFormat": "Local date format preference",
    "phoneFormat": "Country code and formatting",
    "addressFormat": "Local address structure",
    "culturalTone": "Adaptation description",
    "formalityLevel": "Formality level used",
    "legalNotes": ["Relevant legal requirements"]
  },
  "qualityMetrics": {
    "translationAccuracy": 0.95,
    "culturalAlignment": 0.92,
    "businessTone": 0.88,
    "localizationCompleteness": 0.90,
    "confidence": 0.94
  },
  "marketOptimized": true,
  "recommendedFollowUp": {
    "timing": "Culturally appropriate follow-up timing",
    "approach": "Recommended communication approach",
    "culturalConsiderations": ["Key cultural factors for follow-up"]
  }
}`;

  async translateProposal(request: ProposalTranslationRequest): Promise<ProposalTranslationResponse> {
    try {
      const userPrompt = this.buildTranslationPrompt(request);
      
      const completion = await createOpenAICompletion([
        { role: 'system', content: this.TRANSLATION_PROMPT },
        { role: 'user', content: userPrompt }
      ], 0.3);

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      // Clean the response content of any markdown formatting
      let cleanContent = responseContent.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const result = JSON.parse(cleanContent) as ProposalTranslationResponse;
      
      return result;
    } catch (error) {
      console.error('Proposal translation error:', error);
      throw new Error(`Failed to translate proposal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildTranslationPrompt(request: ProposalTranslationRequest): string {
    const marketInfo = this.getMarketInfo(request.target_language, request.market_context.country);
    
    return `Translate and culturally adapt this business proposal:

TARGET LANGUAGE: ${request.target_language.toUpperCase()}
SOURCE LANGUAGE: ${request.source_language || 'English'}

ORIGINAL PROPOSAL:
Title: ${request.proposal_content.title}

Sections:
${Object.entries(request.proposal_content.sections)
  .filter(([_, content]) => content)
  .map(([section, content]) => `${section}: ${content}`)
  .join('\n\n')}

CULTURAL PREFERENCES:
- Formality Level: ${request.cultural_preferences.formality_level}
- Business Culture: ${request.cultural_preferences.business_culture}
- Communication Style: ${request.cultural_preferences.communication_style}

MARKET CONTEXT:
- Country: ${request.market_context.country}
- Industry: ${request.market_context.industry}
- Target Audience: ${request.market_context.target_audience}
- Legal Requirements: ${request.market_context.legal_requirements?.join(', ') || 'Standard business compliance'}

LOCALIZATION OPTIONS:
- Currency Conversion: ${request.localization_options.currency_conversion ? 'Yes' : 'No'}
- Date Localization: ${request.localization_options.date_localization ? 'Yes' : 'No'}
- Phone Formatting: ${request.localization_options.phone_formatting ? 'Yes' : 'No'}
- Legal Notes: ${request.localization_options.include_legal_notes ? 'Yes' : 'No'}

MARKET-SPECIFIC REQUIREMENTS:
${marketInfo}

Provide a complete translation with cultural adaptation, localization, and market-specific optimizations. Ensure native-level fluency and business appropriateness for the target market.`;
  }

  private getMarketInfo(language: string, country: string): string {
    const marketData = {
      'uk': {
        currency: 'Ukrainian Hryvnia (₴)',
        vat: '20% VAT (ПДВ)',
        calendar: 'Orthodox calendar considerations',
        culture: 'Relationship-focused, emphasis on partnership',
        tone: 'Formal but warm, understanding of local challenges'
      },
      'ru': {
        currency: 'Russian Ruble (₽)',
        vat: '20% VAT (НДС)',
        calendar: 'Orthodox calendar considerations',
        culture: 'Hierarchical, technical excellence focus',
        tone: 'Formal and respectful, long-term partnership emphasis'
      },
      'pl': {
        currency: 'Polish Złoty (zł)',
        vat: '23% VAT, EU compliance (GDPR)',
        calendar: 'Catholic calendar, EU business practices',
        culture: 'European standards, quality and reliability focus',
        tone: 'Professional and structured'
      },
      'de': {
        currency: 'Euro (€)',
        vat: '19% MwSt., strict German business law compliance',
        calendar: 'German business calendar, punctuality critical',
        culture: 'Extremely formal, precision and efficiency valued',
        tone: 'Very formal, engineering excellence emphasis'
      },
      'es': {
        currency: 'Euro (€)',
        vat: '21% IVA, EU compliance (GDPR)',
        calendar: 'Catholic calendar, Spanish business practices',
        culture: 'Relationship-oriented, personal connections important',
        tone: 'Warm but professional'
      }
    };

    const info = marketData[language as keyof typeof marketData];
    if (!info) return 'Standard international business practices';

    return `Currency: ${info.currency}
Tax/Legal: ${info.vat}
Calendar: ${info.calendar}
Business Culture: ${info.culture}
Recommended Tone: ${info.tone}`;
  }

  // Test method for development
  async testTranslation(): Promise<ProposalTranslationResponse> {
    const testRequest: ProposalTranslationRequest = {
      proposal_content: {
        title: "E-commerce Platform Development Proposal",
        sections: {
          executive_summary: "We propose to develop a modern e-commerce platform that will transform your online business. Our solution combines cutting-edge technology with user-centric design to deliver exceptional results.",
          project_understanding: "We understand that your business needs a reliable, scalable e-commerce solution that can handle growth and provide excellent user experience.",
          proposed_solution: "Our technical approach involves React frontend, Node.js backend, and PostgreSQL database with secure payment integration.",
          investment_breakdown: "Total project cost: $25,000 USD. Payment structure: 50% upfront, 50% on completion.",
          timeline_breakdown: "Project duration: 12 weeks. Milestones: Week 4 - Design approval, Week 8 - Development complete, Week 12 - Launch.",
          call_to_action: "Let's schedule a meeting to discuss your requirements and move forward with this exciting project."
        }
      },
      target_language: 'pl',
      source_language: 'en',
      cultural_preferences: {
        formality_level: 'business',
        business_culture: 'direct',
        communication_style: 'detailed'
      },
      market_context: {
        country: 'poland',
        industry: 'E-commerce',
        target_audience: 'Medium-sized business owners',
        legal_requirements: ['GDPR compliance', 'EU VAT requirements']
      },
      localization_options: {
        currency_conversion: true,
        date_localization: true,
        phone_formatting: true,
        include_legal_notes: true
      }
    };

    return this.translateProposal(testRequest);
  }
}

export const proposalTranslatorAgent = new ProposalTranslatorAgent();