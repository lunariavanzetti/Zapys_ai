// Internal OpenAI client for content optimization agent
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
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return await response.json();
};

export interface ContentOptimizationRequest {
  proposal_content: string;
  target_audience: {
    industry: string;
    company_size: 'startup' | 'small' | 'medium' | 'enterprise';
    decision_maker_role: string;
    technical_level: 'basic' | 'intermediate' | 'advanced';
  };
  market_context: {
    country: 'ukraine' | 'poland' | 'russia' | 'international';
    language: 'en' | 'uk' | 'ru' | 'pl';
    cultural_preferences: string[];
  };
  optimization_goals: {
    primary_objective: 'conversion' | 'trust_building' | 'differentiation' | 'urgency';
    secondary_objectives: string[];
    key_metrics: string[];
  };
  competitive_context: {
    main_competitors: string[];
    price_positioning: 'premium' | 'competitive' | 'budget';
    unique_selling_points: string[];
  };
}

export interface ContentOptimizationResponse {
  optimized_content: {
    executive_summary: string;
    key_improvements: string[];
    persuasive_elements: {
      emotional_triggers: string[];
      logical_arguments: string[];
      social_proof: string[];
      urgency_factors: string[];
    };
  };
  optimization_analysis: {
    readability_score: number;
    persuasion_score: number;
    cultural_alignment: number;
    technical_accuracy: number;
    conversion_potential: number;
  };
  recommendations: {
    content_adjustments: Array<{
      section: string;
      current_issue: string;
      suggested_improvement: string;
      impact_level: 'high' | 'medium' | 'low';
    }>;
    market_specific_tips: string[];
    call_to_action_variants: string[];
  };
  ab_test_suggestions: {
    headline_variants: string[];
    pricing_presentations: string[];
    closing_statements: string[];
  };
}

class ContentOptimizerAgent {
  private readonly OPTIMIZATION_PROMPT = `You are an expert content optimization specialist focusing on software development proposals for Ukrainian, Polish, and Russian markets.

EXPERTISE AREAS:
- Cross-cultural communication and localization
- Conversion rate optimization for B2B proposals  
- Technical content simplification and clarification
- Trust-building and credibility enhancement
- Competitive positioning and differentiation
- Market-specific cultural adaptation

OPTIMIZATION FRAMEWORK:
1. CLARITY - Make complex technical concepts accessible
2. CREDIBILITY - Build trust through expertise demonstration
3. RELEVANCE - Align with specific market and cultural preferences
4. URGENCY - Create appropriate sense of urgency without being pushy
5. DIFFERENTIATION - Highlight unique value propositions
6. CONVERSION - Optimize for decision-making and action

MARKET-SPECIFIC CONSIDERATIONS:
- Ukraine: Focus on reliability, partnership, understanding of economic challenges
- Poland: Emphasize European standards, quality processes, professional approach  
- Russia: Highlight technical excellence, scalability, proven methodologies

CULTURAL ADAPTATIONS:
- Communication style (direct vs indirect)
- Trust-building mechanisms (credentials vs relationships)
- Decision-making patterns (individual vs collective)
- Risk tolerance and security concerns
- Value perception and pricing sensitivity

ALWAYS respond with valid JSON in this exact format:
{
  "optimized_content": {
    "executive_summary": "Improved executive summary...",
    "key_improvements": ["Improvement 1", "Improvement 2"],
    "persuasive_elements": {
      "emotional_triggers": ["Trigger 1", "Trigger 2"],
      "logical_arguments": ["Argument 1", "Argument 2"],
      "social_proof": ["Proof 1", "Proof 2"],
      "urgency_factors": ["Factor 1", "Factor 2"]
    }
  },
  "optimization_analysis": {
    "readability_score": 85,
    "persuasion_score": 78,
    "cultural_alignment": 82,
    "technical_accuracy": 90,
    "conversion_potential": 80
  },
  "recommendations": {
    "content_adjustments": [
      {
        "section": "Section name",
        "current_issue": "What needs fixing",
        "suggested_improvement": "How to fix it",
        "impact_level": "high"
      }
    ],
    "market_specific_tips": ["Tip 1", "Tip 2"],
    "call_to_action_variants": ["CTA 1", "CTA 2"]
  },
  "ab_test_suggestions": {
    "headline_variants": ["Headline 1", "Headline 2"],
    "pricing_presentations": ["Price format 1", "Price format 2"],
    "closing_statements": ["Close 1", "Close 2"]
  }
}`;

  async optimizeContent(request: ContentOptimizationRequest): Promise<ContentOptimizationResponse> {
    try {
      const userPrompt = this.buildOptimizationPrompt(request);
      
      const completion = await createOpenAICompletion([
        { role: 'system', content: this.OPTIMIZATION_PROMPT },
        { role: 'user', content: userPrompt }
      ], 0.3);

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(responseContent) as ContentOptimizationResponse;
      
      return result;
    } catch (error) {
      console.error('Content optimization error:', error);
      throw new Error(`Failed to optimize content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildOptimizationPrompt(request: ContentOptimizationRequest): string {
    return `Optimize this proposal content for maximum conversion:

ORIGINAL PROPOSAL CONTENT:
${request.proposal_content}

TARGET AUDIENCE:
- Industry: ${request.target_audience.industry}
- Company Size: ${request.target_audience.company_size}
- Decision Maker: ${request.target_audience.decision_maker_role}
- Technical Level: ${request.target_audience.technical_level}

MARKET CONTEXT:
- Country: ${request.market_context.country}
- Language: ${request.market_context.language}
- Cultural Preferences: ${request.market_context.cultural_preferences.join(', ')}

OPTIMIZATION GOALS:
- Primary Objective: ${request.optimization_goals.primary_objective}
- Secondary Objectives: ${request.optimization_goals.secondary_objectives.join(', ')}
- Key Metrics: ${request.optimization_goals.key_metrics.join(', ')}

COMPETITIVE CONTEXT:
- Main Competitors: ${request.competitive_context.main_competitors.join(', ')}
- Price Positioning: ${request.competitive_context.price_positioning}
- Unique Selling Points: ${request.competitive_context.unique_selling_points.join(', ')}

Provide comprehensive optimization analysis with specific, actionable improvements that will increase conversion rates while maintaining cultural sensitivity and technical accuracy.`;
  }

  // Test method for development
  async testOptimization(): Promise<ContentOptimizationResponse> {
    const testRequest: ContentOptimizationRequest = {
      proposal_content: `We propose to build a modern e-commerce platform using React and Node.js. Our team has experience in building scalable solutions. The project will take 3 months and cost $25,000. We use agile methodology and provide ongoing support.`,
      target_audience: {
        industry: "E-commerce",
        company_size: "medium",
        decision_maker_role: "CTO",
        technical_level: "advanced"
      },
      market_context: {
        country: "ukraine",
        language: "en",
        cultural_preferences: ["Cost-effectiveness", "Reliability", "Partnership approach"]
      },
      optimization_goals: {
        primary_objective: "conversion",
        secondary_objectives: ["trust_building", "differentiation"],
        key_metrics: ["response_rate", "meeting_requests", "contract_signing"]
      },
      competitive_context: {
        main_competitors: ["Local development agencies", "Freelancer platforms"],
        price_positioning: "competitive",
        unique_selling_points: ["AI-powered solutions", "Local market expertise", "Proven track record"]
      }
    };

    return this.optimizeContent(testRequest);
  }
}

export const contentOptimizerAgent = new ContentOptimizerAgent();