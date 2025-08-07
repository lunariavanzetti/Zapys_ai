import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ProposalGenerationRequest {
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
    const request = req.body as ProposalGenerationRequest

    if (!request.client_data || !request.project_data) {
      return res.status(400).json({ error: 'Client data and project data are required' })
    }

    const systemPrompt = `You are an expert proposal writer specializing in creating winning proposals for software development projects targeting Ukrainian, Polish, and Russian markets.

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
}`

    const userPrompt = `Generate a winning proposal for this project:

CLIENT INFORMATION:
- Name: ${request.client_data.name}
- Company: ${request.client_data.company}
- Industry: ${request.client_data.industry}
- Location: ${request.client_data.location}
- Email: ${request.client_data.email}

PROJECT DETAILS:
- Title: ${request.project_data.title || 'Not specified'}
- Description: ${request.project_data.description || 'Not specified'}
- Requirements: ${request.project_data.requirements ? request.project_data.requirements.join(', ') : 'To be determined'}
- Technologies: ${request.project_data.technologies ? request.project_data.technologies.join(', ') : 'To be determined'}
- Timeline: ${request.project_data.timeline || 'To be determined'}
- Complexity: ${request.project_data.complexity || 'medium'}

PRICING INFORMATION:
- Total Budget: ${request.pricing_data?.total_budget || 'To be determined'} ${request.pricing_data?.currency || 'USD'}
- Phase Breakdown: ${request.pricing_data?.breakdown ? request.pricing_data.breakdown.map(p => `${p.phase}: ${p.cost} ${request.pricing_data.currency} (${p.duration_weeks} weeks)`).join(', ') : 'To be determined based on requirements'}

MARKET CONTEXT:
- Target Market: ${request.market_context.target_market}
- Language: ${request.market_context.language}
- Competitive Advantages: ${request.market_context.competitive_advantage ? request.market_context.competitive_advantage.join(', ') : 'Local expertise, proven track record'}

AGENCY PROFILE:
- Agency: ${request.agency_profile?.name || 'Zapys AI Solutions'}
- Specialization: ${request.agency_profile?.specialization ? request.agency_profile.specialization.join(', ') : 'Web Development, AI Solutions'}
- Experience: ${request.agency_profile?.experience_years || 5} years
- Portfolio Highlights: ${request.agency_profile?.portfolio_highlights ? request.agency_profile.portfolio_highlights.join(', ') : 'Successful project delivery, client satisfaction'}

Create a compelling, personalized proposal that converts this prospect into a client.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(responseContent)
    
    // Add actual metadata
    result.metadata.generated_at = new Date().toISOString()
    result.metadata.word_count = responseContent.split(/\s+/).length
    result.metadata.language = request.market_context.language
    result.metadata.market = request.market_context.target_market
    
    return res.status(200).json({
      success: true,
      agent: 'ai-proposal-generator',
      proposal: result,
      metadata: {
        processed_at: new Date().toISOString(),
        request_size: JSON.stringify(request).length
      }
    })

  } catch (error) {
    console.error('Agent 2 error:', error)
    return res.status(500).json({ 
      error: 'Proposal generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}