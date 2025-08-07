// Internal OpenAI client for proposal tracking agent
const createOpenAICompletion = async (messages: Array<{role: string, content: string}>, temperature = 0.2) => {
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
      max_tokens: 2500,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return await response.json();
};

export interface ProposalTrackingRequest {
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

export interface ProposalTrackingResponse {
  success: true;
  analytics: {
    engagement: {
      totalViews: number;
      uniqueVisitors: number;
      avgTimeOnPage: number;
      avgScrollDepth: number;
      bounceRate: number;
      returnVisitors: number;
      peakEngagementTime: string;
      deviceBreakdown: {
        desktop: number;
        mobile: number;
        tablet: number;
      };
    };
    sections: {
      [sectionName: string]: {
        timeSpent: number;
        engagement: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
        viewCount: number;
        scrollThroughRate: number;
      };
    };
    insights: Array<{
      type: 'positive' | 'negative' | 'neutral';
      category: 'engagement' | 'timing' | 'content' | 'technical';
      title: string;
      description: string;
      actionable: boolean;
      recommendation: string;
      confidence: number;
    }>;
    conversionSignals: {
      highIntent: string[];
      mediumIntent: string[];
      lowIntent: string[];
      followUpNeeded: string[];
      readyToClose: string[];
    };
    behavioral_patterns: {
      reading_sequence: string[];
      focus_areas: string[];
      drop_off_points: string[];
      return_patterns: string[];
    };
    client_readiness_score: {
      score: number;
      factors: string[];
      next_action: string;
      urgency: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  metadata: {
    analyzed_at: string;
    total_events: number;
    analysis_period: string;
    proposal_age_days: number;
  };
}

class ProposalTrackerAgent {
  private readonly ANALYSIS_PROMPT = `You are a business intelligence analyst specializing in client engagement analytics and proposal performance tracking.

EXPERTISE AREAS:
- Client engagement pattern analysis
- Proposal section performance evaluation  
- Visitor behavior interpretation
- Intent scoring and qualification
- Follow-up timing optimization
- Conversion signal identification
- A/B testing insights for proposals

ANALYTICAL FRAMEWORK:
1. ENGAGEMENT ANALYSIS - Measure depth and quality of interaction
2. BEHAVIORAL PATTERNS - Identify reading and decision-making patterns
3. INTENT SCORING - Assess client readiness and interest level
4. CONVERSION SIGNALS - Detect buying intent and objection points
5. ACTIONABLE INSIGHTS - Generate specific recommendations for follow-up
6. TIMING OPTIMIZATION - Recommend optimal contact timing

TRACKING CAPABILITIES:
- Real-time engagement monitoring
- Section-level performance analysis
- Visitor behavior pattern recognition
- Intent scoring and qualification
- Follow-up recommendations
- A/B testing insights for proposals
- Client readiness assessment

ENGAGEMENT SCORING:
- very_high: >90th percentile (exceptional interest)
- high: 70-90th percentile (strong interest)
- medium: 30-70th percentile (moderate interest)
- low: 10-30th percentile (minimal interest)
- very_low: <10th percentile (poor engagement)

INTENT SIGNALS:
- High Intent: Multiple visits, full scroll, pricing focus, return visits, long session time
- Medium Intent: Partial scroll, section focus, single visit with good engagement
- Low Intent: Quick exit, minimal scroll, bounce without engagement

ALWAYS respond with valid JSON in this exact format:
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
  },
  "metadata": {
    "analyzed_at": "2024-08-05T15:00:00Z",
    "total_events": 156,
    "analysis_period": "7 days",
    "proposal_age_days": 3
  }
}`;

  async analyzeProposalEngagement(request: ProposalTrackingRequest): Promise<ProposalTrackingResponse> {
    try {
      const userPrompt = this.buildAnalysisPrompt(request);
      
      const completion = await createOpenAICompletion([
        { role: 'system', content: this.ANALYSIS_PROMPT },
        { role: 'user', content: userPrompt }
      ], 0.2);

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(responseContent) as ProposalTrackingResponse;
      
      // Add calculated metadata
      result.metadata.analyzed_at = new Date().toISOString();
      result.metadata.total_events = request.analytics_events.length;
      result.metadata.proposal_age_days = this.calculateProposalAge(request.proposal_data.sent_date);
      
      return result;
    } catch (error) {
      console.error('Proposal tracking analysis error:', error);
      throw new Error(`Failed to analyze proposal engagement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildAnalysisPrompt(request: ProposalTrackingRequest): string {
    const eventsAnalysis = this.analyzeEvents(request.analytics_events);
    
    return `Analyze the engagement and performance of this proposal:

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
${eventsAnalysis.summary}

VISITOR PATTERNS:
- Unique Visitors: ${eventsAnalysis.uniqueVisitors}
- Total Sessions: ${eventsAnalysis.totalSessions}
- Return Visitors: ${eventsAnalysis.returnVisitors}
- Device Types: ${JSON.stringify(eventsAnalysis.deviceBreakdown)}

SECTION ENGAGEMENT:
${eventsAnalysis.sectionEngagement}

BEHAVIORAL INSIGHTS:
${eventsAnalysis.behaviorPatterns}

Provide comprehensive analytics with actionable insights for optimizing client follow-up and conversion strategies.`;
  }

  private analyzeEvents(events: ProposalTrackingRequest['analytics_events']) {
    const uniqueVisitors = new Set(events.map(e => e.visitor_id)).size;
    const totalSessions = new Set(events.map(e => e.session_id)).size;
    
    // Calculate return visitors
    const visitorSessions = new Map<string, Set<string>>();
    events.forEach(event => {
      if (!visitorSessions.has(event.visitor_id)) {
        visitorSessions.set(event.visitor_id, new Set());
      }
      visitorSessions.get(event.visitor_id)!.add(event.session_id);
    });
    const returnVisitors = Array.from(visitorSessions.values()).filter(sessions => sessions.size > 1).length;

    // Device breakdown
    const deviceCounts = events.reduce((acc, event) => {
      const device = event.data.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Section engagement analysis
    const sectionEvents = events.filter(e => e.event_type === 'section_view' && e.data.section);
    const sectionEngagement = sectionEvents.reduce((acc, event) => {
      const section = event.data.section!;
      if (!acc[section]) {
        acc[section] = { views: 0, totalTime: 0 };
      }
      acc[section].views++;
      acc[section].totalTime += event.data.time_spent || 0;
      return acc;
    }, {} as Record<string, { views: number; totalTime: number }>);

    return {
      summary: `Analyzed ${events.length} events across ${uniqueVisitors} unique visitors and ${totalSessions} sessions`,
      uniqueVisitors,
      totalSessions,
      returnVisitors,
      deviceBreakdown: deviceCounts,
      sectionEngagement: Object.entries(sectionEngagement)
        .map(([section, data]) => `${section}: ${data.views} views, avg ${Math.round(data.totalTime / data.views)}s`)
        .join(', '),
      behaviorPatterns: this.identifyBehaviorPatterns(events)
    };
  }

  private identifyBehaviorPatterns(events: ProposalTrackingRequest['analytics_events']): string {
    // Group events by session to analyze reading patterns
    const sessionEvents = new Map<string, typeof events>();
    events.forEach(event => {
      if (!sessionEvents.has(event.session_id)) {
        sessionEvents.set(event.session_id, []);
      }
      sessionEvents.get(event.session_id)!.push(event);
    });

    const patterns: string[] = [];

    // Analyze common reading sequences
    const sequences = Array.from(sessionEvents.values())
      .map(sessionEvents => 
        sessionEvents
          .filter(e => e.event_type === 'section_view' && e.data.section)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map(e => e.data.section!)
      )
      .filter(seq => seq.length > 1);

    if (sequences.length > 0) {
      const commonSequence = sequences[0]?.slice(0, 3).join(' → ') || 'None identified';
      patterns.push(`Common reading sequence: ${commonSequence}`);
    }

    // Identify high-engagement sections
    const sectionTimes = events
      .filter(e => e.event_type === 'section_view' && e.data.time_spent)
      .reduce((acc, event) => {
        const section = event.data.section!;
        if (!acc[section]) acc[section] = [];
        acc[section].push(event.data.time_spent!);
        return acc;
      }, {} as Record<string, number[]>);

    const avgSectionTimes = Object.entries(sectionTimes)
      .map(([section, times]) => ({
        section,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .sort((a, b) => b.avgTime - a.avgTime);

    if (avgSectionTimes.length > 0) {
      patterns.push(`Highest engagement: ${avgSectionTimes[0].section} (${Math.round(avgSectionTimes[0].avgTime)}s avg)`);
    }

    return patterns.join('. ');
  }

  private calculateProposalAge(sentDate: string): number {
    const sent = new Date(sentDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - sent.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Test method for development
  async testTracking(): Promise<ProposalTrackingResponse> {
    const testRequest: ProposalTrackingRequest = {
      proposal_id: "prop_12345",
      proposal_data: {
        title: "E-commerce Platform Development",
        client_name: "TechCorp Ukraine",
        sent_date: "2024-08-02T10:00:00Z",
        total_value: 25000,
        sections: ["executive_summary", "technical_solution", "pricing", "timeline", "terms"]
      },
      analytics_events: [
        {
          timestamp: "2024-08-02T14:30:00Z",
          event_type: "page_view",
          visitor_id: "visitor_001",
          session_id: "session_001",
          data: {
            page_url: "/proposal/prop_12345",
            referrer: "email",
            device_type: "desktop",
            location: "Kyiv, Ukraine"
          }
        },
        {
          timestamp: "2024-08-02T14:31:00Z",
          event_type: "section_view",
          visitor_id: "visitor_001",
          session_id: "session_001",
          data: {
            section: "executive_summary",
            time_spent: 45,
            scroll_depth: 1.0
          }
        },
        {
          timestamp: "2024-08-02T14:32:30Z",
          event_type: "section_view",
          visitor_id: "visitor_001",
          session_id: "session_001",
          data: {
            section: "pricing",
            time_spent: 120,
            scroll_depth: 1.0
          }
        },
        {
          timestamp: "2024-08-03T09:15:00Z",
          event_type: "page_view",
          visitor_id: "visitor_001",
          session_id: "session_002",
          data: {
            page_url: "/proposal/prop_12345",
            referrer: "direct",
            device_type: "mobile"
          }
        }
      ],
      time_range: {
        start_date: "2024-08-02T00:00:00Z",
        end_date: "2024-08-05T23:59:59Z"
      }
    };

    return this.analyzeProposalEngagement(testRequest);
  }
}

export const proposalTrackerAgent = new ProposalTrackerAgent();