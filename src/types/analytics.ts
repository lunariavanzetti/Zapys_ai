// Analytics Types and Interfaces

export interface AnalyticsEvent {
  type: 'view' | 'scroll' | 'click' | 'download' | 'signature' | 'exit';
  timestamp: string;
  metadata: Record<string, any>;
  sessionId: string;
  visitorId?: string;
  proposalId?: string;
  userId?: string;
  section?: string;
  scrollDepth?: number;
  timeOnPage?: number;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browserType?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface AnalyticsRequest {
  type: 'event' | 'summary' | 'insight' | 'optimization';
  data: {
    proposalId?: string;
    userId?: string;
    events?: AnalyticsEvent[];
    timeframe?: {
      start: string;
      end: string;
    };
    filters?: {
      status?: string[];
      clientType?: string[];
      proposalType?: string[];
    };
  };
}

export interface ProposalPerformance {
  id: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  conversionRate: number;
  avgTimeOnPage: number;
  avgScrollDepth: number;
  signatureRate: number;
  downloadRate: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  avgScrollDepth: number;
  conversionRate: number;
  topPerformingProposals: ProposalPerformance[];
}

export interface AnalyticsInsight {
  type: 'positive' | 'negative' | 'neutral';
  category: 'engagement' | 'conversion' | 'content' | 'timing';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  confidence: number;
  dataPoints: number;
}

export interface AnalyticsRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'content' | 'design' | 'timing' | 'follow-up';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  expectedTimeframe: string;
}

export interface EngagementMetrics {
  viewsOverTime: Array<{ date: string; views: number; uniqueVisitors: number }>;
  scrollHeatmap: Array<{ section: string; avgDepth: number; visits: number }>;
  clickThroughRates: Record<string, number>;
  sectionEngagement: Array<{
    section: string;
    avgTimeSpent: number;
    skipRate: number;
    interactionRate: number;
  }>;
}

export interface ConversionMetrics {
  funnelSteps: Array<{ step: string; count: number; rate: number }>;
  dropOffPoints: Array<{ section: string; rate: number; reason?: string }>;
  signatureFlow: Array<{ stage: string; completion: number; avgTime: number }>;
  conversionPaths: Array<{
    path: string[];
    count: number;
    avgTime: number;
    conversionRate: number;
  }>;
}

export interface BehavioralMetrics {
  avgSessionDuration: number;
  bounceRate: number;
  returnVisitorRate: number;
  deviceBreakdown: Record<string, number>;
  timeOfDayPatterns: Record<string, number>;
  dayOfWeekPatterns: Record<string, number>;
  geographicDistribution: Record<string, number>;
}

export interface AnalyticsMetrics {
  engagement: EngagementMetrics;
  conversion: ConversionMetrics;
  behavioral: BehavioralMetrics;
}

export interface AnalyticsResponse {
  success: boolean;
  analytics: {
    summary?: AnalyticsSummary;
    insights?: AnalyticsInsight[];
    recommendations?: AnalyticsRecommendation[];
    metrics?: AnalyticsMetrics;
  };
  error?: string;
  processingTime?: number;
  dataQuality?: {
    completeness: number;
    accuracy: number;
    timeliness: number;
  };
}

export interface AnalyticsFilter {
  proposalIds?: string[];
  userIds?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  eventTypes?: AnalyticsEvent['type'][];
  deviceTypes?: ('desktop' | 'mobile' | 'tablet')[];
  minSessionDuration?: number;
  excludeBots?: boolean;
}

export interface AnalyticsAggregation {
  groupBy: 'hour' | 'day' | 'week' | 'month' | 'proposal' | 'user' | 'section';
  metrics: ('views' | 'conversions' | 'engagement' | 'time')[];
  timeframe: {
    start: Date;
    end: Date;
  };
}

export interface AnalyticsAlert {
  id: string;
  type: 'threshold' | 'anomaly' | 'opportunity' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  triggeredAt: Date;
  proposalId?: string;
  metric: string;
  currentValue: number;
  expectedValue?: number;
  threshold?: number;
  actionRequired: boolean;
  suggestions?: string[];
}

export interface AnalyticsConfig {
  trackingEnabled: boolean;
  anonymizeData: boolean;
  retentionDays: number;
  alertThresholds: {
    bounceRate: number;
    conversionRate: number;
    avgTimeOnPage: number;
    scrollDepth: number;
  };
  excludeInternalTraffic: boolean;
  enableRealTimeProcessing: boolean;
}

// Utility types for analytics processing
export type MetricTrend = 'increasing' | 'decreasing' | 'stable' | 'volatile';

export interface TrendAnalysis {
  metric: string;
  trend: MetricTrend;
  changePercent: number;
  significance: 'high' | 'medium' | 'low';
  timeframe: string;
}

export interface BenchmarkComparison {
  metric: string;
  currentValue: number;
  benchmarkValue: number;
  performance: 'above' | 'at' | 'below';
  percentageDifference: number;
  industry?: string;
}

export interface SegmentAnalysis {
  segment: string;
  metrics: Record<string, number>;
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
}