/**
 * Analytics Service for Zapys AI
 * Comprehensive analytics engine for proposal performance tracking and optimization
 */

import { 
  AnalyticsRequest, 
  AnalyticsResponse, 
  AnalyticsEvent,
  ProcessedSession,
  ProposalAnalytics,
  AnalyticsConfiguration,
  AnalyticsInsight,
  AnalyticsRecommendation,
  PatternAnalysis,
  OptimizationSuggestion,
  AnalyticsSummary,
  AnalyticsMetrics
} from './analyticsTypes'

class AnalyticsService {
  private config: AnalyticsConfiguration = {
    bounceThreshold: 30, // 30 seconds
    highEngagementScrollThreshold: 70, // 70%
    lowEngagementScrollThreshold: 30, // 30%
    quickSignatureThreshold: 24, // 24 hours
    considerationPeriodThreshold: 168 // 7 days
  }

  /**
   * Main analytics processing method
   */
  async processAnalytics(request: AnalyticsRequest): Promise<AnalyticsResponse> {
    try {
      const { type, data } = request

      switch (type) {
        case 'event':
          return await this.processEvents(data.events || [], data.proposalId)
        case 'summary':
          return await this.generateSummary(data)
        case 'insight':
          return await this.generateInsights(data)
        case 'optimization':
          return await this.generateOptimizations(data)
        default:
          throw new Error(`Unknown analytics type: ${type}`)
      }
    } catch (error) {
      console.error('Analytics processing error:', error)
      return {
        success: false,
        analytics: {},
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Process raw events into structured analytics data
   */
  private async processEvents(events: AnalyticsEvent[], proposalId?: string): Promise<AnalyticsResponse> {
    const sessions = this.groupEventsBySessions(events)
    const processedSessions = sessions.map(sessionEvents => this.processSession(sessionEvents))
    
    const analytics: ProposalAnalytics = {
      proposalId: proposalId || 'unknown',
      totalViews: this.calculateTotalViews(processedSessions),
      uniqueVisitors: this.calculateUniqueVisitors(processedSessions),
      sessions: processedSessions,
      avgTimeOnPage: this.calculateAverageTimeOnPage(processedSessions),
      avgScrollDepth: this.calculateAverageScrollDepth(processedSessions),
      conversionRate: this.calculateConversionRate(processedSessions),
      bounceRate: this.calculateBounceRate(processedSessions)
    }

    return {
      success: true,
      analytics: {
        summary: this.buildSummary(analytics),
        metrics: this.buildMetrics(analytics)
      }
    }
  }

  /**
   * Generate comprehensive analytics summary
   */
  private async generateSummary(_data: any): Promise<AnalyticsResponse> {
    // Mock data for development - in production this would query the database
    const mockData = this.generateMockAnalyticsData()
    
    const summary: AnalyticsSummary = {
      totalViews: mockData.totalViews,
      uniqueVisitors: mockData.uniqueVisitors,
      avgTimeOnPage: mockData.avgTimeOnPage,
      avgScrollDepth: mockData.avgScrollDepth,
      conversionRate: mockData.conversionRate,
      topPerformingProposals: mockData.topPerformingProposals
    }

    return {
      success: true,
      analytics: { summary }
    }
  }

  /**
   * Generate actionable insights from analytics data
   */
  private async generateInsights(data: any): Promise<AnalyticsResponse> {
    const patterns = this.analyzePatterns(data)
    const insights = this.generateInsightsFromPatterns(patterns)

    return {
      success: true,
      analytics: { insights }
    }
  }

  /**
   * Generate optimization recommendations
   */
  private async generateOptimizations(data: any): Promise<AnalyticsResponse> {
    const suggestions = this.generateOptimizationSuggestions(data)
    const recommendations = this.convertSuggestionsToRecommendations(suggestions)

    return {
      success: true,
      analytics: { recommendations }
    }
  }

  /**
   * Group events by session ID
   */
  private groupEventsBySessions(events: AnalyticsEvent[]): AnalyticsEvent[][] {
    const sessionMap = new Map<string, AnalyticsEvent[]>()
    
    events.forEach(event => {
      if (!sessionMap.has(event.sessionId)) {
        sessionMap.set(event.sessionId, [])
      }
      sessionMap.get(event.sessionId)!.push(event)
    })

    return Array.from(sessionMap.values())
  }

  /**
   * Process a single session's events
   */
  private processSession(events: AnalyticsEvent[]): ProcessedSession {
    const sortedEvents = events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    const firstEvent = sortedEvents[0]
    const lastEvent = sortedEvents[sortedEvents.length - 1]
    
    const duration = this.calculateSessionDuration(firstEvent, lastEvent)
    const scrollDepth = this.calculateMaxScrollDepth(events)
    const bounced = duration < this.config.bounceThreshold
    const converted = events.some(e => e.type === 'signature')
    const device = this.detectDevice(events)

    return {
      sessionId: firstEvent.sessionId,
      visitorId: firstEvent.visitorId,
      proposalId: firstEvent.metadata?.proposalId,
      events: sortedEvents,
      duration,
      scrollDepth,
      bounced,
      converted,
      device
    }
  }

  /**
   * Calculate session duration in seconds
   */
  private calculateSessionDuration(firstEvent: AnalyticsEvent, lastEvent: AnalyticsEvent): number {
    const start = new Date(firstEvent.timestamp).getTime()
    const end = new Date(lastEvent.timestamp).getTime()
    return Math.max(0, (end - start) / 1000)
  }

  /**
   * Calculate maximum scroll depth for a session
   */
  private calculateMaxScrollDepth(events: AnalyticsEvent[]): number {
    const scrollEvents = events.filter(e => e.type === 'scroll')
    if (scrollEvents.length === 0) return 0
    
    return Math.max(...scrollEvents.map(e => e.metadata?.scrollDepth || 0))
  }

  /**
   * Detect device type from events
   */
  private detectDevice(events: AnalyticsEvent[]): string {
    const deviceInfo = events[0]?.metadata?.device
    if (!deviceInfo) return 'unknown'
    
    if (deviceInfo.mobile) return 'mobile'
    if (deviceInfo.tablet) return 'tablet'
    return 'desktop'
  }

  /**
   * Calculate total views across all sessions
   */
  private calculateTotalViews(sessions: ProcessedSession[]): number {
    return sessions.filter(s => s.events.some(e => e.type === 'view')).length
  }

  /**
   * Calculate unique visitors
   */
  private calculateUniqueVisitors(sessions: ProcessedSession[]): number {
    const uniqueVisitors = new Set(sessions.map(s => s.visitorId || s.sessionId))
    return uniqueVisitors.size
  }

  /**
   * Calculate average time on page
   */
  private calculateAverageTimeOnPage(sessions: ProcessedSession[]): number {
    const validSessions = sessions.filter(s => !s.bounced && s.duration > 0)
    if (validSessions.length === 0) return 0
    
    const totalTime = validSessions.reduce((sum, s) => sum + s.duration, 0)
    return Math.round(totalTime / validSessions.length)
  }

  /**
   * Calculate average scroll depth
   */
  private calculateAverageScrollDepth(sessions: ProcessedSession[]): number {
    const validSessions = sessions.filter(s => s.scrollDepth > 0)
    if (validSessions.length === 0) return 0
    
    const totalScrollDepth = validSessions.reduce((sum, s) => sum + s.scrollDepth, 0)
    return Math.round((totalScrollDepth / validSessions.length) * 10) / 10
  }

  /**
   * Calculate conversion rate
   */
  private calculateConversionRate(sessions: ProcessedSession[]): number {
    if (sessions.length === 0) return 0
    
    const conversions = sessions.filter(s => s.converted).length
    return Math.round((conversions / sessions.length) * 1000) / 10 // One decimal place
  }

  /**
   * Calculate bounce rate
   */
  private calculateBounceRate(sessions: ProcessedSession[]): number {
    if (sessions.length === 0) return 0
    
    const bounces = sessions.filter(s => s.bounced).length
    return Math.round((bounces / sessions.length) * 1000) / 10 // One decimal place
  }

  /**
   * Build summary object from analytics data
   */
  private buildSummary(analytics: ProposalAnalytics): AnalyticsSummary {
    return {
      totalViews: analytics.totalViews,
      uniqueVisitors: analytics.uniqueVisitors,
      avgTimeOnPage: analytics.avgTimeOnPage,
      avgScrollDepth: analytics.avgScrollDepth,
      conversionRate: analytics.conversionRate,
      topPerformingProposals: [] // Would be populated from database query
    }
  }

  /**
   * Build detailed metrics object
   */
  private buildMetrics(analytics: ProposalAnalytics): AnalyticsMetrics {
    return {
      engagement: {
        viewsOverTime: this.calculateViewsOverTime(analytics.sessions),
        scrollHeatmap: this.calculateScrollHeatmap(analytics.sessions),
        clickThroughRates: this.calculateClickThroughRates(analytics.sessions)
      },
      conversion: {
        funnelSteps: this.calculateFunnelSteps(analytics.sessions),
        dropOffPoints: this.calculateDropOffPoints(analytics.sessions),
        signatureFlow: this.calculateSignatureFlow(analytics.sessions)
      },
      behavioral: {
        avgSessionDuration: analytics.avgTimeOnPage,
        bounceRate: analytics.bounceRate,
        returnVisitorRate: this.calculateReturnVisitorRate(analytics.sessions),
        deviceBreakdown: this.calculateDeviceBreakdown(analytics.sessions)
      }
    }
  }

  /**
   * Calculate views over time
   */
  private calculateViewsOverTime(sessions: ProcessedSession[]): Array<{ date: string; views: number }> {
    const viewsByDate = new Map<string, number>()
    
    sessions.forEach(session => {
      const viewEvents = session.events.filter(e => e.type === 'view')
      viewEvents.forEach(event => {
        const date = new Date(event.timestamp).toISOString().split('T')[0]
        viewsByDate.set(date, (viewsByDate.get(date) || 0) + 1)
      })
    })

    return Array.from(viewsByDate.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Calculate scroll heatmap data
   */
  private calculateScrollHeatmap(_sessions: ProcessedSession[]): Array<{ section: string; avgDepth: number }> {
    // Mock implementation - in production this would analyze actual scroll positions
    return [
      { section: 'Header', avgDepth: 95 },
      { section: 'Executive Summary', avgDepth: 87 },
      { section: 'Project Understanding', avgDepth: 73 },
      { section: 'Proposed Solution', avgDepth: 68 },
      { section: 'Deliverables', avgDepth: 62 },
      { section: 'Timeline', avgDepth: 55 },
      { section: 'Investment', avgDepth: 48 },
      { section: 'Why Choose Us', avgDepth: 35 },
      { section: 'Next Steps', avgDepth: 28 }
    ]
  }

  /**
   * Calculate click-through rates
   */
  private calculateClickThroughRates(sessions: ProcessedSession[]): Record<string, number> {
    const clickEvents = sessions.flatMap(s => s.events.filter(e => e.type === 'click'))
    const totalSessions = sessions.length
    
    if (totalSessions === 0) return {}

    const clicksByElement = new Map<string, number>()
    clickEvents.forEach(event => {
      const element = event.metadata?.element || 'unknown'
      clicksByElement.set(element, (clicksByElement.get(element) || 0) + 1)
    })

    const ctr: Record<string, number> = {}
    clicksByElement.forEach((clicks, element) => {
      ctr[element] = Math.round((clicks / totalSessions) * 1000) / 10
    })

    return ctr
  }

  /**
   * Calculate conversion funnel steps
   */
  private calculateFunnelSteps(sessions: ProcessedSession[]): Array<{ step: string; count: number; rate: number }> {
    const totalSessions = sessions.length
    if (totalSessions === 0) return []

    const steps = [
      { step: 'View', count: sessions.filter(s => s.events.some(e => e.type === 'view')).length },
      { step: 'Scroll >50%', count: sessions.filter(s => s.scrollDepth > 50).length },
      { step: 'Download', count: sessions.filter(s => s.events.some(e => e.type === 'download')).length },
      { step: 'Signature', count: sessions.filter(s => s.converted).length }
    ]

    return steps.map(step => ({
      ...step,
      rate: Math.round((step.count / totalSessions) * 1000) / 10
    }))
  }

  /**
   * Calculate drop-off points
   */
  private calculateDropOffPoints(_sessions: ProcessedSession[]): Array<{ section: string; rate: number }> {
    // Mock implementation - would analyze actual exit points
    return [
      { section: 'Investment', rate: 32.5 },
      { section: 'Timeline', rate: 18.7 },
      { section: 'Deliverables', rate: 15.2 },
      { section: 'Why Choose Us', rate: 12.8 }
    ]
  }

  /**
   * Calculate signature flow completion
   */
  private calculateSignatureFlow(sessions: ProcessedSession[]): Array<{ stage: string; completion: number }> {
    const signatureSessions = sessions.filter(s => s.converted)
    const totalSignatures = signatureSessions.length
    
    if (totalSignatures === 0) return []

    // Mock implementation
    return [
      { stage: 'Started', completion: 100 },
      { stage: 'Contact Info', completion: 87 },
      { stage: 'Legal Review', completion: 73 },
      { stage: 'E-Signature', completion: 68 },
      { stage: 'Completed', completion: 65 }
    ]
  }

  /**
   * Calculate return visitor rate
   */
  private calculateReturnVisitorRate(sessions: ProcessedSession[]): number {
    const visitorSessions = new Map<string, number>()
    
    sessions.forEach(session => {
      const visitorId = session.visitorId || session.sessionId
      visitorSessions.set(visitorId, (visitorSessions.get(visitorId) || 0) + 1)
    })

    const returnVisitors = Array.from(visitorSessions.values()).filter(count => count > 1).length
    const totalVisitors = visitorSessions.size
    
    return totalVisitors > 0 ? Math.round((returnVisitors / totalVisitors) * 1000) / 10 : 0
  }

  /**
   * Calculate device breakdown
   */
  private calculateDeviceBreakdown(sessions: ProcessedSession[]): Record<string, number> {
    const deviceCounts = new Map<string, number>()
    
    sessions.forEach(session => {
      deviceCounts.set(session.device, (deviceCounts.get(session.device) || 0) + 1)
    })

    const total = sessions.length
    const breakdown: Record<string, number> = {}
    
    deviceCounts.forEach((count, device) => {
      breakdown[device] = total > 0 ? Math.round((count / total) * 1000) / 10 : 0
    })

    return breakdown
  }

  /**
   * Analyze patterns in the data
   */
  private analyzePatterns(_data: any): PatternAnalysis {
    // Mock implementation - would analyze actual patterns
    return {
      positiveIndicators: [
        'High scroll depth (>70%) in most sessions',
        'Multiple return visits from same visitors',
        'Strong engagement with deliverables section',
        'Quick signatures within 24 hours'
      ],
      warningSignals: [
        'High drop-off rate at pricing section',
        'Low mobile engagement',
        'Extended time between view and signature',
        'Multiple downloads without conversion'
      ],
      behavioralInsights: [
        'Sequential readers show higher conversion rates',
        'Mobile users prefer shorter proposals',
        'Pricing transparency increases trust',
        'Visual elements improve engagement'
      ],
      decisionIndicators: [
        'Immediate signatures indicate strong interest',
        'Multiple proposal reviews suggest comparison shopping',
        'Quick downloads followed by communication indicate decision readiness'
      ]
    }
  }

  /**
   * Generate insights from pattern analysis
   */
  private generateInsightsFromPatterns(patterns: PatternAnalysis): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = []

    // Positive insights
    patterns.positiveIndicators.forEach(indicator => {
      insights.push({
        type: 'positive',
        category: 'engagement',
        title: 'Strong Engagement Detected',
        description: indicator,
        impact: 'high',
        actionable: false
      })
    })

    // Warning insights
    patterns.warningSignals.forEach(signal => {
      insights.push({
        type: 'negative',
        category: 'conversion',
        title: 'Potential Issue Identified',
        description: signal,
        impact: 'medium',
        actionable: true
      })
    })

    return insights
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(_data: any): OptimizationSuggestion[] {
    return [
      {
        type: 'structure',
        title: 'Optimize Pricing Section Placement',
        description: 'Move pricing information higher in the proposal to reduce drop-off',
        priority: 'high',
        implementation: 'Restructure proposal template to place pricing after project understanding',
        expectedImpact: '15-20% improvement in conversion rate',
        confidence: 0.85
      },
      {
        type: 'messaging',
        title: 'Strengthen Value Proposition',
        description: 'Enhance the value proposition section based on low engagement patterns',
        priority: 'medium',
        implementation: 'Add more specific benefits and ROI calculations',
        expectedImpact: '10-15% increase in scroll depth',
        confidence: 0.75
      },
      {
        type: 'timing',
        title: 'Optimize Send Times',
        description: 'Send proposals during peak engagement hours for better response',
        priority: 'medium',
        implementation: 'Schedule proposals for Tuesday-Thursday, 9-11 AM',
        expectedImpact: '8-12% increase in initial view rate',
        confidence: 0.70
      },
      {
        type: 'conversion',
        title: 'Simplify Signature Process',
        description: 'Reduce friction in the e-signature flow',
        priority: 'high',
        implementation: 'Implement one-click signature with pre-filled client information',
        expectedImpact: '25-30% improvement in signature completion',
        confidence: 0.90
      }
    ]
  }

  /**
   * Convert suggestions to recommendations format
   */
  private convertSuggestionsToRecommendations(suggestions: OptimizationSuggestion[]): AnalyticsRecommendation[] {
    return suggestions.map(suggestion => ({
      priority: suggestion.priority,
      category: suggestion.type as any,
      title: suggestion.title,
      description: suggestion.description,
      expectedImpact: suggestion.expectedImpact,
      implementation: suggestion.implementation
    }))
  }

  /**
   * Generate mock analytics data for development
   */
  private generateMockAnalyticsData() {
    return {
      totalViews: 247,
      uniqueVisitors: 189,
      avgTimeOnPage: 298,
      avgScrollDepth: 67.8,
      conversionRate: 18.7,
      topPerformingProposals: [
        { id: '1', title: 'E-commerce Website Redesign', views: 45, conversionRate: 28.9 },
        { id: '2', title: 'Mobile App Development', views: 38, conversionRate: 26.3 },
        { id: '3', title: 'Brand Identity Package', views: 32, conversionRate: 21.9 },
        { id: '4', title: 'Digital Marketing Strategy', views: 29, conversionRate: 17.2 },
        { id: '5', title: 'SEO Optimization Project', views: 26, conversionRate: 15.4 }
      ]
    }
  }
}

export const analyticsService = new AnalyticsService()
export { AnalyticsService }