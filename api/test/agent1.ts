import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ParsingRequest {
  content: string
  source_type?: string
  language?: string
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
    const { content, source_type = 'mixed', language = 'en' } = req.body as ParsingRequest

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    const systemPrompt = `You are an expert data extraction agent specializing in parsing CRM data, project briefs, and client communications from various sources (Notion, HubSpot, Pipedrive, Airtable, emails, documents).

EXTRACTION CAPABILITIES:
- Client information (name, email, company, contact details)
- Project requirements and scope
- Budget information and constraints  
- Timeline requirements and deadlines
- Technical specifications and preferences
- Communication history and notes
- Deal stages and probability

SUPPORTED FORMATS:
- Notion database exports (CSV, JSON)
- HubSpot contact/deal exports
- Pipedrive deal data
- Airtable base exports
- Email threads and conversations
- Meeting notes and transcripts
- Plain text project briefs

CRITICAL REQUIREMENTS:
- Extract ALL relevant information
- Normalize data formats (emails, phone numbers, currencies)
- Validate and clean extracted data
- Provide confidence scores for each field
- Handle multiple languages (EN, UK, RU, PL)
- Flag incomplete or suspicious data

ALWAYS respond with valid JSON in this exact format:
{
  "client_info": {
    "name": "John Smith",
    "email": "john@example.com",
    "company": "Tech Startup Inc",
    "phone": "+1-555-0123",
    "location": "New York, USA",
    "confidence": 0.95
  },
  "project_details": {
    "title": "E-commerce Platform Development",
    "description": "Build modern e-commerce solution...",
    "requirements": ["User authentication", "Payment integration", "Admin panel"],
    "technologies": ["React", "Node.js", "PostgreSQL"],
    "scope": "full_development",
    "confidence": 0.88
  },
  "budget_info": {
    "total_budget": 25000,
    "currency": "USD",
    "budget_type": "fixed",
    "payment_terms": "50% upfront, 50% on completion",
    "confidence": 0.75
  },
  "timeline_info": {
    "deadline": "2024-12-31",
    "estimated_duration": "3 months",
    "start_date": "2024-10-01",
    "milestones": ["Design approval", "MVP delivery", "Final launch"],
    "urgency": "normal",
    "confidence": 0.82
  },
  "communication_context": {
    "source": "notion_database",
    "last_contact": "2024-09-15",
    "deal_stage": "proposal",
    "notes": ["Client prefers React", "Budget is flexible", "Needs by Q4"],
    "priority": "high"
  },
  "data_quality": {
    "completeness": 0.85,
    "accuracy": 0.92,
    "missing_fields": ["phone", "company_size"],
    "validation_errors": [],
    "suggestions": ["Request company size", "Confirm timeline flexibility"]
  }
}`

    const userPrompt = `Parse and extract structured data from this content:

Source Type: ${source_type}
Language: ${language}
Content: ${content}

Extract all client information, project details, budget, timeline, and communication context. Provide confidence scores and data quality assessment.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2500
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from OpenAI')
    }

    const parsedData = JSON.parse(responseContent)
    
    return res.status(200).json({
      success: true,
      agent: 'parser-notion-crm',
      parsed_data: parsedData,
      metadata: {
        source_type,
        language,
        processed_at: new Date().toISOString(),
        content_length: content.length
      }
    })

  } catch (error) {
    console.error('Agent 1 error:', error)
    return res.status(500).json({ 
      error: 'Parsing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}