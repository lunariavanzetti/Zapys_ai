import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ProposalTrackingRequest {
  proposal_id: string;
  proposal_data: {
    title: string;
    client_name: string;
    sent_date: string;
    total_value: number;
    sections: string[];
  };
  analytics_events: Array<{
    timestamp: string;
    event_type: 'page_view' | 'scroll' | 'section_view' | 'click' | 'exit';
    visitor_id: string;
    session_id: string;
    data: {
      section?: string;
      scroll_depth?: number;
      time_spent?: number;
      page_url?: string;
      referrer?: string;
      device_type?: string;
      location?: string;
    };
  }>;
  time_range: {
    start_date: string;
    end_date: string;
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
    const request = req.body as ProposalTrackingRequest

    if (!request.proposal_id || !request.analytics_events) {
      return res.status(400).json({ error: 'Proposal ID and analytics events are required' })
    }

    // Add default values for missing fields
    if (!request.proposal_data) {
      request.proposal_data = {
        title: 'Untitled Proposal',
        client_name: 'Unknown Client',
        sent_date: new Date().toISOString(),
        total_value: 0,
        sections: ['executive_summary', 'pricing', 'timeline']
      }
    }

    if (!request.time_range) {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      request.time_range = {
        start_date: weekAgo.toISOString(),
        end_date: now.toISOString()
      }
    }

    const systemPrompt = `You are a business intelligence analyst specializing in client engagement analytics and proposal performance tracking.

ANALYTICAL FRAMEWORK:
1. ENGAGEMENT ANALYSIS - Measure depth and quality of interaction
2. BEHAVIORAL PATTERNS - Identify reading and decision-making patterns
3. INTENT SCORING - Assess client readiness and interest level
4. CONVERSION SIGNALS - Detect buying intent and objection points
5. ACTIONABLE INSIGHTS - Generate specific recommendations for follow-up
6. TIMING OPTIMIZATION - Recommend optimal contact timing

ENGAGEMENT SCORING:
- very_high: >90th percentile (exceptional interest)
- high: 70-90th percentile (strong interest)
- medium: 30-70th percentile (moderate interest)
- low: 10-30th percentile (minimal interest)
- very_low: <10th percentile (poor engagement)

CRITICAL: Respond ONLY with valid JSON. No markdown, no code blocks, no explanations. Just pure JSON in this exact format:
{
  "success": true,
  "analytics": {
    "engagement": {
      "totalViews": 47,
      "uniqueVisitors": 23,
      "avgTimeOnPage": 180,
      "avgScrollDepth": 0.78,
      "bounceRate": 0.31,
      "returnVisitors": 8,
      "peakEngagementTime": "2024-08-05T14:30:00Z",
      "deviceBreakdown": {"desktop": 65, "mobile": 30, "tablet": 5}
    },
    "sections": {
      "executive_summary": {"timeSpent": 45, "engagement": "high", "viewCount": 23, "scrollThroughRate": 0.85},
      "pricing": {"timeSpent": 67, "engagement": "very_high", "viewCount": 20, "scrollThroughRate": 0.95}
    },
    "insights": [
      {
        "type": "positive",
        "category": "engagement",
        "title": "High pricing section engagement",
        "description": "Clients spend 40% more time on pricing than average",
        "actionable": true,
        "recommendation": "Consider scheduling a pricing discussion call",
        "confidence": 0.85
      }
    ],
    "conversionSignals": {
      "highIntent": ["multiple visits", "full scroll", "pricing focus"],
      "mediumIntent": ["partial engagement", "section focus"],
      "lowIntent": ["quick exit"],
      "followUpNeeded": ["pricing skip", "no return visit"],
      "readyToClose": ["multiple pricing views", "timeline section focus"]
    },
    "behavioral_patterns": {
      "reading_sequence": ["executive_summary", "pricing", "timeline"],
      "focus_areas": ["pricing", "technical_solution"],
      "drop_off_points": ["terms_conditions"],
      "return_patterns": ["pricing_revisit", "timeline_check"]
    },
    "client_readiness_score": {
      "score": 78,
      "factors": ["high pricing engagement", "multiple visits", "full proposal review"],
      "next_action": "Schedule follow-up call within 24 hours",
      "urgency": "high"
    }
  }
}`

    // Analyze events to provide context
    const uniqueVisitors = new Set(request.analytics_events.map(e => e.visitor_id)).size
    const totalSessions = new Set(request.analytics_events.map(e => e.session_id)).size
    
    // Calculate return visitors
    const visitorSessions = new Map<string, Set<string>>()
    request.analytics_events.forEach(event => {
      if (!visitorSessions.has(event.visitor_id)) {
        visitorSessions.set(event.visitor_id, new Set())
      }
      visitorSessions.get(event.visitor_id)!.add(event.session_id)
    })
    const returnVisitors = Array.from(visitorSessions.values()).filter(sessions => sessions.size > 1).length

    // Section engagement analysis
    const sectionEvents = request.analytics_events.filter(e => e.event_type === 'section_view' && e.data.section)
    const sectionEngagement = sectionEvents.reduce((acc, event) => {
      const section = event.data.section!
      if (!acc[section]) {
        acc[section] = { views: 0, totalTime: 0 }
      }
      acc[section].views++
      acc[section].totalTime += event.data.time_spent || 0
      return acc
    }, {} as Record<string, { views: number; totalTime: number }>)

    const userPrompt = `Analyze the engagement and performance of this proposal:

PROPOSAL INFORMATION:
- ID: ${request.proposal_id}
- Title: ${request.proposal_data.title}
- Client: ${request.proposal_data.client_name}
- Sent Date: ${request.proposal_data.sent_date}
- Total Value: $${request.proposal_data.total_value}
- Sections: ${request.proposal_data.sections.join(', ')}

ANALYTICS PERIOD:
- Start: ${request.time_range.start_date}
- End: ${request.time_range.end_date}
- Total Events: ${request.analytics_events.length}

EVENT ANALYSIS:
- Unique Visitors: ${uniqueVisitors}
- Total Sessions: ${totalSessions}
- Return Visitors: ${returnVisitors}

SECTION ENGAGEMENT:
${Object.entries(sectionEngagement)
  .map(([section, data]) => `${section}: ${data.views} views, avg ${Math.round(data.totalTime / data.views || 0)}s`)
  .join(', ') || 'No section engagement data'}

RECENT EVENTS:
${request.analytics_events.slice(-5).map(e => 
  `${e.event_type} at ${e.timestamp} (${e.data.section || e.data.device_type || 'general'})`
).join(', ')}

Provide comprehensive analytics with actionable insights for optimizing client follow-up and conversion strategies.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2500,
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
    
    // Add calculated metadata
    const sentDate = new Date(request.proposal_data.sent_date)
    const now = new Date()
    const proposalAge = Math.ceil((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24))
    
    return res.status(200).json({
      success: true,
      agent: 'proposal-tracker',
      analytics: result.analytics,
      metadata: {
        analyzed_at: new Date().toISOString(),
        total_events: request.analytics_events.length,
        analysis_period: `${Math.ceil((new Date(request.time_range.end_date).getTime() - new Date(request.time_range.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`,
        proposal_age_days: proposalAge,
        unique_visitors: uniqueVisitors,
        total_sessions: totalSessions
      }
    })

  } catch (error) {
    console.error('Agent 5 error:', error)
    return res.status(500).json({ 
      error: 'Proposal tracking analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}