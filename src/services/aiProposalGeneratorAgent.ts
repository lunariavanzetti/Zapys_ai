// Internal OpenAI client for proposal generation agent
const createOpenAICompletion = async (messages: Array<{role: string, content: string}>, temperature = 0.7) => {
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

export interface ProposalGenerationRequest {
  client_data: {
    name: string;
    company: string;
    email: string;
    industry: string;
    location: string;
  };
  project_data: {
    title: string;
    description: string;
    requirements: string[];
    technologies: string[];
    timeline: string;
    complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  };
  pricing_data: {
    total_budget: number;
    currency: string;
    breakdown: Array<{
      phase: string;
      cost: number;
      duration_weeks: number;
    }>;
  };
  market_context: {
    target_market: 'ukraine' | 'poland' | 'russia' | 'international';
    language: 'en' | 'uk' | 'ru' | 'pl';
    competitive_advantage: string[];
  };
  agency_profile: {
    name: string;
    specialization: string[];
    experience_years: number;
    portfolio_highlights: string[];
  };
}

export interface ProposalGenerationResponse {
  proposal: {
    executive_summary: string;
    project_understanding: string;
    proposed_solution: {
      approach: string;
      key_features: string[];
      technical_architecture: string;
      deliverables: string[];
    };
    timeline_breakdown: {
      phases: Array<{
        name: string;
        duration: string;
        description: string;
        milestones: string[];
      }>;
    };
    investment_breakdown: {
      total_investment: string;
      payment_structure: string;
      value_proposition: string;
      roi_projection: string;
    };
    why_choose_us: {
      unique_advantages: string[];
      relevant_experience: string[];
      success_stories: string[];
    };
    next_steps: string[];
    call_to_action: string;
  };
  metadata: {
    generated_at: string;
    word_count: number;
    language: string;
    market: string;
    confidence_score: number;
  };
}

class AIProposalGeneratorAgent {
  private readonly GENERATION_PROMPT = `You are an expert proposal writer specializing in creating winning proposals for software development projects targeting Ukrainian, Polish, and Russian markets.

CRITICAL REQUIREMENTS:
- Create compelling, personalized proposals that convert prospects to clients
- Adapt language tone and cultural nuances for the target market
- Focus on value proposition and ROI rather than just features
- Include specific technical details that demonstrate expertise
- Structure for easy scanning and decision-making
- Optimize for trust-building and credibility

MARKET-SPECIFIC ADAPTATIONS:
- Ukraine: Emphasize cost-effectiveness, reliable partnerships, understanding of local business challenges
- Poland: Focus on European standards, quality assurance, professional approach
- Russia: Highlight technical excellence, scalability, long-term value

PROPOSAL STRUCTURE:
1. Executive Summary (hook them immediately)
2. Project Understanding (show you "get it")
3. Proposed Solution (technical approach)
4. Timeline & Milestones (realistic planning)
5. Investment Breakdown (clear value)
6. Why Choose Us (competitive advantage)
7. Next Steps (clear call to action)

WRITING PRINCIPLES:
- Use active voice and confident language
- Include specific numbers and timelines
- Address potential concerns proactively
- Show expertise through technical depth
- Create urgency without being pushy
- Use social proof and credibility indicators

ALWAYS respond with valid JSON in this exact format:
{
  "proposal": {
    "executive_summary": "Compelling opening that hooks the client...",
    "project_understanding": "Demonstrate deep understanding of their needs...",
    "proposed_solution": {
      "approach": "Our strategic approach to solving their problem...",
      "key_features": ["Feature 1", "Feature 2", "Feature 3"],
      "technical_architecture": "Technical overview of our solution...",
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    },
    "timeline_breakdown": {
      "phases": [
        {
          "name": "Phase Name",
          "duration": "X weeks",
          "description": "What happens in this phase",
          "milestones": ["Milestone 1", "Milestone 2"]
        }
      ]
    },
    "investment_breakdown": {
      "total_investment": "Total cost with currency",
      "payment_structure": "How payments are structured",
      "value_proposition": "Why this investment makes sense",
      "roi_projection": "Expected return on investment"
    },
    "why_choose_us": {
      "unique_advantages": ["Advantage 1", "Advantage 2"],
      "relevant_experience": ["Experience 1", "Experience 2"],
      "success_stories": ["Story 1", "Story 2"]
    },
    "next_steps": ["Step 1", "Step 2", "Step 3"],
    "call_to_action": "Compelling call to action"
  },
  "metadata": {
    "generated_at": "ISO timestamp",
    "word_count": 1500,
    "language": "language_code",
    "market": "target_market",
    "confidence_score": 0.95
  }
}`;

  async generateProposal(request: ProposalGenerationRequest): Promise<ProposalGenerationResponse> {
    try {
      const userPrompt = this.buildGenerationPrompt(request);
      
      const completion = await createOpenAICompletion([
        { role: 'system', content: this.GENERATION_PROMPT },
        { role: 'user', content: userPrompt }
      ], 0.7);

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(responseContent) as ProposalGenerationResponse;
      
      // Add actual metadata
      result.metadata.generated_at = new Date().toISOString();
      result.metadata.word_count = this.countWords(JSON.stringify(result.proposal));
      result.metadata.language = request.market_context.language;
      result.metadata.market = request.market_context.target_market;
      
      return result;
    } catch (error) {
      console.error('Proposal generation error:', error);
      throw new Error(`Failed to generate proposal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildGenerationPrompt(request: ProposalGenerationRequest): string {
    return `Generate a winning proposal for this project:

CLIENT INFORMATION:
- Name: ${request.client_data.name}
- Company: ${request.client_data.company}
- Industry: ${request.client_data.industry}
- Location: ${request.client_data.location}
- Email: ${request.client_data.email}

PROJECT DETAILS:
- Title: ${request.project_data.title}
- Description: ${request.project_data.description}
- Requirements: ${request.project_data.requirements.join(', ')}
- Technologies: ${request.project_data.technologies.join(', ')}
- Timeline: ${request.project_data.timeline}
- Complexity: ${request.project_data.complexity}

PRICING INFORMATION:
- Total Budget: ${request.pricing_data.total_budget} ${request.pricing_data.currency}
- Phase Breakdown: ${request.pricing_data.breakdown.map(p => `${p.phase}: ${p.cost} ${request.pricing_data.currency} (${p.duration_weeks} weeks)`).join(', ')}

MARKET CONTEXT:
- Target Market: ${request.market_context.target_market}
- Language: ${request.market_context.language}
- Competitive Advantages: ${request.market_context.competitive_advantage.join(', ')}

AGENCY PROFILE:
- Agency: ${request.agency_profile.name}
- Specialization: ${request.agency_profile.specialization.join(', ')}
- Experience: ${request.agency_profile.experience_years} years
- Portfolio Highlights: ${request.agency_profile.portfolio_highlights.join(', ')}

Create a compelling, personalized proposal that converts this prospect into a client. Focus on their specific needs and demonstrate clear value.`;
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Test method for development
  async testGeneration(): Promise<ProposalGenerationResponse> {
    const testRequest: ProposalGenerationRequest = {
      client_data: {
        name: "Alexei Petrov",
        company: "TechStart Ukraine",
        email: "alexei@techstart.ua",
        industry: "E-commerce",
        location: "Kyiv, Ukraine"
      },
      project_data: {
        title: "Modern E-commerce Platform",
        description: "Build a comprehensive e-commerce platform with payment integration, inventory management, and admin dashboard",
        requirements: ["User authentication", "Product catalog", "Shopping cart", "Payment integration", "Admin panel", "Mobile responsive"],
        technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
        timeline: "3 months",
        complexity: "medium"
      },
      pricing_data: {
        total_budget: 25000,
        currency: "USD",
        breakdown: [
          { phase: "Planning & Design", cost: 5000, duration_weeks: 2 },
          { phase: "Development", cost: 15000, duration_weeks: 8 },
          { phase: "Testing & Launch", cost: 5000, duration_weeks: 2 }
        ]
      },
      market_context: {
        target_market: "ukraine",
        language: "en",
        competitive_advantage: ["Local market expertise", "Cost-effective solutions", "Agile development"]
      },
      agency_profile: {
        name: "Zapys AI Solutions",
        specialization: ["React Development", "E-commerce Solutions", "AI Integration"],
        experience_years: 5,
        portfolio_highlights: ["50+ successful e-commerce projects", "Ukrainian market leader", "AI-powered solutions"]
      }
    };

    return this.generateProposal(testRequest);
  }
}

export const aiProposalGeneratorAgent = new AIProposalGeneratorAgent();