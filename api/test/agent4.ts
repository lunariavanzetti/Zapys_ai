import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ContentOptimizationRequest {
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
    const request = req.body as ContentOptimizationRequest

    if (!request.proposal_content) {
      return res.status(400).json({ error: 'Proposal content is required' })
    }

    // Add default values for missing fields
    if (!request.optimization_goals) {
      request.optimization_goals = {
        primary_objective: 'conversion',
        secondary_objectives: ['trust_building', 'differentiation']
      }
    }

    const systemPrompt = `You are an expert content optimization specialist focusing on software development proposals for Ukrainian, Polish, and Russian markets.

OPTIMIZATION FRAMEWORK:
1. CLARITY - Make complex technical concepts accessible
2. CREDIBILITY - Build trust through expertise demonstration
3. RELEVANCE - Align with specific market and cultural preferences
4. URGENCY - Create appropriate sense of urgency without being pushy
5. DIFFERENTIATION - Highlight unique value propositions
6. CONVERSION - Optimize for decision-making and action

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
    "market_specific_tips": ["Tip 1", "Tip 2"]
  }
}`

    const userPrompt = `Optimize this proposal content for maximum conversion:

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
- Cultural Preferences: ${request.market_context.cultural_preferences ? request.market_context.cultural_preferences.join(', ') : 'Cost-effectiveness, reliability, quality'}

OPTIMIZATION GOALS:
- Primary Objective: ${request.optimization_goals.primary_objective}
- Secondary Objectives: ${request.optimization_goals.secondary_objectives ? request.optimization_goals.secondary_objectives.join(', ') : 'trust_building, differentiation'}

Provide comprehensive optimization analysis with specific, actionable improvements.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(responseContent)
    
    return res.status(200).json({
      success: true,
      agent: 'content-optimizer',
      optimization: result,
      metadata: {
        processed_at: new Date().toISOString(),
        original_length: request.proposal_content.length,
        optimization_goals: request.optimization_goals.primary_objective
      }
    })

  } catch (error) {
    console.error('Agent 4 error:', error)
    return res.status(500).json({ 
      error: 'Content optimization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}