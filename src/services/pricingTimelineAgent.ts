// Internal OpenAI client for pricing agent
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
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return await response.json();
};

export interface PricingTimelineRequest {
  projectScope: string;
  clientBudget?: string;
  projectType: 'web-development' | 'mobile-app' | 'ai-integration' | 'consulting' | 'design' | 'other';
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  timeline?: string;
  teamSize?: number;
  clientProfile: {
    industry: string;
    company_size: 'startup' | 'small' | 'medium' | 'enterprise';
    location: string;
    previous_projects?: string;
  };
  requirements: {
    features: string[];
    integrations?: string[];
    platforms?: string[];
    technologies?: string[];
  };
}

export interface PricingTimelineResponse {
  pricing: {
    base_price: number;
    hourly_rate: number;
    total_hours: number;
    price_breakdown: {
      development: number;
      design: number;
      testing: number;
      project_management: number;
      deployment: number;
    };
    pricing_rationale: string;
    currency: 'USD' | 'EUR' | 'UAH';
  };
  timeline: {
    total_duration_weeks: number;
    phases: Array<{
      phase_name: string;
      duration_weeks: number;
      deliverables: string[];
      dependencies?: string[];
    }>;
    critical_path: string[];
    risk_factors: string[];
    timeline_rationale: string;
  };
  recommendations: {
    pricing_strategy: string;
    timeline_optimization: string;
    risk_mitigation: string[];
    value_proposition: string;
  };
  competitive_analysis: {
    market_rate_comparison: string;
    positioning_strategy: string;
    unique_value_points: string[];
  };
}

class PricingTimelineAgent {
  private static readonly PRICING_PROMPT = `
You are an expert pricing and timeline analyst for software development projects. Your task is to provide accurate, competitive, and profitable pricing estimates along with realistic project timelines.

PRICING ANALYSIS FRAMEWORK:
1. Market Research: Analyze current market rates for similar projects
2. Complexity Assessment: Evaluate technical complexity and resource requirements
3. Value-Based Pricing: Consider client value and ROI potential
4. Competitive Positioning: Position pricing strategically against competitors
5. Risk Assessment: Factor in project risks and uncertainties

TIMELINE ESTIMATION METHODOLOGY:
1. Work Breakdown Structure: Break project into manageable phases
2. Resource Allocation: Consider team size and skill requirements
3. Dependencies Mapping: Identify critical path and blockers
4. Buffer Management: Include realistic buffers for unknowns
5. Client Feedback Cycles: Account for review and iteration periods

REGIONAL CONSIDERATIONS:
- Ukrainian market: $25-60/hour, focus on value and quality
- Polish market: $30-80/hour, emphasize European standards
- Russian market: $20-50/hour, competitive pricing strategies
- International: $50-150/hour, premium positioning

RESPONSE REQUIREMENTS:
- Provide detailed pricing breakdown with rationale
- Create realistic timeline with clear milestones
- Include risk assessment and mitigation strategies
- Offer strategic recommendations for proposal positioning
- Consider client budget constraints and optimize accordingly

FORMAT: Return valid JSON matching PricingTimelineResponse interface exactly.
`;

  async analyzePricingTimeline(request: PricingTimelineRequest): Promise<PricingTimelineResponse> {
    try {
      const systemPrompt = this.PRICING_PROMPT;
      
      const userPrompt = `
PRICING & TIMELINE ANALYSIS REQUEST:

PROJECT DETAILS:
- Scope: ${request.projectScope}
- Type: ${request.projectType}
- Complexity: ${request.complexity}
- Client Budget: ${request.clientBudget || 'Not specified'}
- Requested Timeline: ${request.timeline || 'Flexible'}
- Team Size: ${request.teamSize || 'To be determined'}

CLIENT PROFILE:
- Industry: ${request.clientProfile.industry}
- Company Size: ${request.clientProfile.company_size}
- Location: ${request.clientProfile.location}
- Previous Projects: ${request.clientProfile.previous_projects || 'None specified'}

REQUIREMENTS:
- Features: ${request.requirements.features.join(', ')}
- Integrations: ${request.requirements.integrations?.join(', ') || 'None specified'}
- Platforms: ${request.requirements.platforms?.join(', ') || 'Not specified'}
- Technologies: ${request.requirements.technologies?.join(', ') || 'To be determined'}

ANALYSIS REQUIREMENTS:
1. Provide competitive pricing analysis for ${request.clientProfile.location} market
2. Create detailed timeline with realistic milestones
3. Break down costs by development phases
4. Assess project risks and provide mitigation strategies
5. Recommend optimal pricing strategy for client retention and profitability

Please analyze this project and provide comprehensive pricing and timeline recommendations.
`;

      const completion = await createOpenAICompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], 0.3);

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI API');
      }

      return JSON.parse(response) as PricingTimelineResponse;
    } catch (error) {
      console.error('Error in pricing timeline analysis:', error);
      throw new Error(`Pricing analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async optimizePricing(
    baseAnalysis: PricingTimelineResponse,
    constraints: {
      max_budget?: number;
      max_timeline_weeks?: number;
      priority: 'cost' | 'time' | 'quality';
    }
  ): Promise<PricingTimelineResponse> {
    try {
      const optimizationPrompt = `
PRICING OPTIMIZATION REQUEST:

CURRENT ANALYSIS:
${JSON.stringify(baseAnalysis, null, 2)}

CONSTRAINTS:
- Maximum Budget: ${constraints.max_budget ? `$${constraints.max_budget}` : 'None'}
- Maximum Timeline: ${constraints.max_timeline_weeks ? `${constraints.max_timeline_weeks} weeks` : 'None'}
- Priority: ${constraints.priority}

Please optimize the pricing and timeline while maintaining quality standards. 
If budget constraints require scope reduction, suggest specific features to postpone to MVP v2.
If timeline constraints require acceleration, suggest resource scaling options.

Return optimized PricingTimelineResponse with clear explanations of changes made.
`;

      const completion = await createOpenAICompletion([
        { role: 'system', content: this.PRICING_PROMPT },
        { role: 'user', content: optimizationPrompt }
      ], 0.2);

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from pricing optimization');
      }

      return JSON.parse(response) as PricingTimelineResponse;
    } catch (error) {
      console.error('Error in pricing optimization:', error);
      throw error;
    }
  }

  async generatePricingVariants(request: PricingTimelineRequest): Promise<{
    budget_friendly: PricingTimelineResponse;
    recommended: PricingTimelineResponse;
    premium: PricingTimelineResponse;
  }> {
    try {
      const baseAnalysis = await this.analyzePricingTimeline(request);
      
      const [budgetFriendly, premium] = await Promise.all([
        this.optimizePricing(baseAnalysis, { priority: 'cost' }),
        this.optimizePricing(baseAnalysis, { priority: 'quality' })
      ]);

      return {
        budget_friendly: budgetFriendly,
        recommended: baseAnalysis,
        premium: premium
      };
    } catch (error) {
      console.error('Error generating pricing variants:', error);
      throw error;
    }
  }
}

export const pricingTimelineAgent = new PricingTimelineAgent();