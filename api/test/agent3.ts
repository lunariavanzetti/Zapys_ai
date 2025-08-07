import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface PricingTimelineRequest {
  content: string
  language?: string
  market?: string
  client_context?: any
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
    const { content, language = 'en', market = 'ukraine', client_context } = req.body as PricingTimelineRequest

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    const systemPrompt = `You are an expert pricing and timeline analyst for software development projects targeting Ukrainian, Polish, and Russian markets. 

CRITICAL REQUIREMENTS:
- Provide realistic pricing in USD for the target market
- Consider local market rates and purchasing power
- Include detailed timeline estimates in weeks/months
- Account for project complexity and scope
- Be conservative with estimates to ensure deliverability

Market Context:
- Ukraine: Budget-conscious, prefer value-driven solutions, typical project range $5K-50K
- Poland: Mid-tier European market, willing to pay for quality, range $10K-100K  
- Russia: Varies widely, but generally cost-sensitive, range $3K-30K

ALWAYS respond with valid JSON in this exact format:
{
  "pricing_analysis": {
    "total_estimate": 15000,
    "breakdown": [
      {"phase": "Planning & Design", "cost": 3000, "duration_weeks": 2},
      {"phase": "Development", "cost": 10000, "duration_weeks": 8},
      {"phase": "Testing & Deployment", "cost": 2000, "duration_weeks": 2}
    ],
    "currency": "USD",
    "confidence_level": 0.85
  },
  "timeline_analysis": {
    "total_duration_weeks": 12,
    "total_duration_months": 3,
    "milestones": [
      {"name": "Project Kickoff", "week": 1},
      {"name": "Design Approval", "week": 2},
      {"name": "MVP Ready", "week": 8},
      {"name": "Final Delivery", "week": 12}
    ],
    "critical_path": ["Design Approval", "Core Development", "Testing"]
  },
  "risk_factors": [
    {"factor": "Technical complexity", "impact": "medium", "mitigation": "Use proven tech stack"},
    {"factor": "Scope creep", "impact": "high", "mitigation": "Clear requirements document"}
  ],
  "recommendations": [
    "Start with MVP approach",
    "Plan for 20% buffer time",
    "Consider phased delivery"
  ]
}`

    const userPrompt = `Analyze this project for pricing and timeline:

Project: ${content}
Target Market: ${market}
Language: ${language}
Client Context: ${JSON.stringify(client_context || {})}

Provide detailed pricing and timeline analysis with market-appropriate rates.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from OpenAI')
    }

    const analysis = JSON.parse(responseContent)
    
    return res.status(200).json({
      success: true,
      agent: 'pricing-timeline',
      analysis,
      metadata: {
        market,
        language,
        processed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Agent 3 error:', error)
    return res.status(500).json({ 
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}