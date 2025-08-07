import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ProposalTranslationRequest {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const request = req.body as ProposalTranslationRequest

    if (!request.proposal_content || !request.target_language) {
      return res.status(400).json({ error: 'Proposal content and target language are required' })
    }

    // Add default values for missing fields
    if (!request.cultural_preferences) {
      request.cultural_preferences = {
        formality_level: 'business',
        business_culture: 'direct',
        communication_style: 'detailed'
      }
    }

    if (!request.market_context) {
      request.market_context = {
        country: 'international',
        industry: 'Technology',
        target_audience: 'Business decision makers',
        legal_requirements: ['Standard business compliance']
      }
    }

    if (!request.localization_options) {
      request.localization_options = {
        currency_conversion: true,
        date_localization: true,
        phone_formatting: true,
        include_legal_notes: true
      }
    }

    const getMarketInfo = (language: string, country: string): string => {
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
      }

      const info = marketData[language as keyof typeof marketData]
      if (!info) return 'Standard international business practices'

      return `Currency: ${info.currency}
Tax/Legal: ${info.vat}
Calendar: ${info.calendar}
Business Culture: ${info.culture}
Recommended Tone: ${info.tone}`
    }

    const systemPrompt = `You are a world-class localization expert specializing in culturally-adapted translation for business proposals in Eastern European, Western European, and Spanish markets.

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
}`

    const marketInfo = getMarketInfo(request.target_language, request.market_context.country)
    
    const userPrompt = `Translate and culturally adapt this business proposal:

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

Provide a complete translation with cultural adaptation, localization, and market-specific optimizations. Ensure native-level fluency and business appropriateness for the target market.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from OpenAI')
    }

    // Clean the response content of any markdown formatting
    let cleanContent = responseContent.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const result = JSON.parse(cleanContent)
    
    return res.status(200).json({
      success: true,
      agent: 'proposal-translator',
      translation: result,
      metadata: {
        translated_at: new Date().toISOString(),
        source_language: request.source_language || 'en',
        target_language: request.target_language,
        market_context: request.market_context.country,
        sections_translated: Object.keys(request.proposal_content.sections).length
      }
    })

  } catch (error) {
    console.error('Agent 6 error:', error)
    return res.status(500).json({ 
      error: 'Proposal translation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}