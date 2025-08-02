/**
 * TypeScript interfaces for Analytics Engine
 * Based on the comprehensive specification in cursor-agents/agent-analytics-engine.md
 */

export interface AnalyticsEvent {
  type: 'view' | 'scroll' | 'click' | 'download' | 'signature' | 'exit'
  timestamp: string
  metadata: Record<string, any>
  sessionId: string
  visitorId?: string
}

export interface AnalyticsRequest {
  type: 'event' | 'summary' | 'insight' | 'optimization'
  data: {
    proposalId?: string
    userId?: string
    events?: AnalyticsEvent[]
    timeframe?: {
      start: string
      end: string
    }
    filters?: {
      status?: string[]
      clientType?: string[]
      proposalType?: string[]
    }
  }
}

export interface ProposalPerformance {
  id: string
  title: string
  views: number
  conversionRate: number
}

export interface AnalyticsSummary {
  totalViews: number
  uniqueVisitors: number
  avgTimeOnPage: number
  avgScrollDepth: number
  conversionRate: number
  topPerformingProposals: ProposalPerformance[]
}

export interface AnalyticsInsight {
  type: 'positive' | 'negative' | 'neutral'
  category: 'engagement' | 'conversion' | 'content' | 'timing'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
}

export interface AnalyticsRecommendation {
  priority: 'high' | 'medium' | 'low'
  category: 'content' | 'design' | 'timing' | 'follow-up'
  title: string
  description: string
  expectedImpact: string
  implementation: string
}

export interface EngagementMetrics {
  viewsOverTime: Array<{ date: string; views: number }>
  scrollHeatmap: Array<{ section: string; avgDepth: number }>
  clickThroughRates: Record<string, number>
}

export interface ConversionMetrics {
  funnelSteps: Array<{ step: string; count: number; rate: number }>
  dropOffPoints: Array<{ section: string; rate: number }>
  signatureFlow: Array<{ stage: string; completion: number }>
}

export interface BehavioralMetrics {
  avgSessionDuration: number
  bounceRate: number
  returnVisitorRate: number
  deviceBreakdown: Record<string, number>
}

export interface AnalyticsMetrics {
  engagement: EngagementMetrics
  conversion: ConversionMetrics
  behavioral: BehavioralMetrics
}

export interface AnalyticsResponse {
  success: boolean
  analytics: {
    summary?: AnalyticsSummary
    insights?: AnalyticsInsight[]
    recommendations?: AnalyticsRecommendation[]
    metrics?: AnalyticsMetrics
  }
  error?: string
}

// Additional types for internal processing
export interface ProcessedSession {
  sessionId: string
  visitorId?: string
  proposalId?: string
  events: AnalyticsEvent[]
  duration: number
  scrollDepth: number
  bounced: boolean
  converted: boolean
  device: string
}

export interface ProposalAnalytics {
  proposalId: string
  totalViews: number
  uniqueVisitors: number
  sessions: ProcessedSession[]
  avgTimeOnPage: number
  avgScrollDepth: number
  conversionRate: number
  bounceRate: number
}

export interface AnalyticsConfiguration {
  bounceThreshold: number // seconds
  highEngagementScrollThreshold: number // percentage
  lowEngagementScrollThreshold: number // percentage
  quickSignatureThreshold: number // hours
  considerationPeriodThreshold: number // hours
}

export interface PatternAnalysis {
  positiveIndicators: string[]
  warningSignals: string[]
  behavioralInsights: string[]
  decisionIndicators: string[]
}

export interface OptimizationSuggestion {
  type: 'structure' | 'messaging' | 'timing' | 'conversion'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  implementation: string
  expectedImpact: string
  confidence: number
}