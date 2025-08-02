import { 
  AnalyticsEvent, 
  AnalyticsFilter,
  MetricTrend,
  TrendAnalysis,
  BenchmarkComparison,
  AnalyticsConfig
} from '../../types/analytics';

// Data Processing Utilities
export class AnalyticsUtils {
  /**
   * Clean and validate analytics events
   */
  static cleanEvents(events: AnalyticsEvent[], config: AnalyticsConfig): AnalyticsEvent[] {
    return events.filter(event => {
      // Remove bot traffic if configured
      if (config.excludeInternalTraffic && this.isBotTraffic(event)) {
        return false;
      }

      // Validate timestamp
      if (!this.isValidTimestamp(event.timestamp)) {
        return false;
      }

      // Remove duplicate events
      return true;
    }).map(event => {
      // Anonymize data if configured
      if (config.anonymizeData) {
        return this.anonymizeEvent(event);
      }
      return event;
    });
  }

  /**
   * Detect bot traffic based on patterns
   */
  static isBotTraffic(event: AnalyticsEvent): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /headless/i
    ];

    const userAgent = event.metadata?.userAgent || '';
    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Validate timestamp format and range
   */
  static isValidTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    return !isNaN(date.getTime()) && date <= now && date >= oneYearAgo;
  }

  /**
   * Anonymize sensitive event data
   */
  static anonymizeEvent(event: AnalyticsEvent): AnalyticsEvent {
    return {
      ...event,
      visitorId: event.visitorId ? this.hashString(event.visitorId) : undefined,
      userId: event.userId ? this.hashString(event.userId) : undefined,
      metadata: {
        ...event.metadata,
        ip: undefined,
        userAgent: event.metadata?.userAgent ? this.anonymizeUserAgent(event.metadata.userAgent) : undefined
      }
    };
  }

  /**
   * Simple hash function for anonymization
   */
  static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Anonymize user agent string
   */
  static anonymizeUserAgent(userAgent: string): string {
    // Keep browser and OS info, remove version details
    return userAgent.replace(/\d+\.\d+\.\d+/g, 'x.x.x');
  }

  /**
   * Filter events based on criteria
   */
  static filterEvents(events: AnalyticsEvent[], filter: AnalyticsFilter): AnalyticsEvent[] {
    return events.filter(event => {
      // Filter by proposal IDs
      if (filter.proposalIds && filter.proposalIds.length > 0) {
        if (!event.proposalId || !filter.proposalIds.includes(event.proposalId)) {
          return false;
        }
      }

      // Filter by user IDs
      if (filter.userIds && filter.userIds.length > 0) {
        if (!event.userId || !filter.userIds.includes(event.userId)) {
          return false;
        }
      }

      // Filter by date range
      if (filter.dateRange) {
        const eventDate = new Date(event.timestamp);
        if (eventDate < filter.dateRange.start || eventDate > filter.dateRange.end) {
          return false;
        }
      }

      // Filter by event types
      if (filter.eventTypes && filter.eventTypes.length > 0) {
        if (!filter.eventTypes.includes(event.type)) {
          return false;
        }
      }

      // Filter by device types
      if (filter.deviceTypes && filter.deviceTypes.length > 0) {
        if (!event.deviceType || !filter.deviceTypes.includes(event.deviceType)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Group events by specified criteria
   */
  static groupEvents(
    events: AnalyticsEvent[], 
    groupBy: 'hour' | 'day' | 'week' | 'month' | 'proposal' | 'user' | 'section'
  ): Record<string, AnalyticsEvent[]> {
    const groups: Record<string, AnalyticsEvent[]> = {};

    events.forEach(event => {
      let key: string;

      switch (groupBy) {
        case 'hour':
          key = new Date(event.timestamp).toISOString().slice(0, 13);
          break;
        case 'day':
          key = new Date(event.timestamp).toISOString().slice(0, 10);
          break;
        case 'week':
          const date = new Date(event.timestamp);
          const week = this.getWeekNumber(date);
          key = `${date.getFullYear()}-W${week}`;
          break;
        case 'month':
          key = new Date(event.timestamp).toISOString().slice(0, 7);
          break;
        case 'proposal':
          key = event.proposalId || 'unknown';
          break;
        case 'user':
          key = event.userId || event.visitorId || 'anonymous';
          break;
        case 'section':
          key = event.section || 'unknown';
          break;
        default:
          key = 'all';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
    });

    return groups;
  }

  /**
   * Get week number for date
   */
  static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Calculate session duration from events
   */
  static calculateSessionDuration(events: AnalyticsEvent[]): number {
    if (events.length === 0) return 0;

    const sortedEvents = events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstEvent = new Date(sortedEvents[0].timestamp);
    const lastEvent = new Date(sortedEvents[sortedEvents.length - 1].timestamp);

    return (lastEvent.getTime() - firstEvent.getTime()) / 1000; // Return in seconds
  }

  /**
   * Calculate scroll depth from scroll events
   */
  static calculateScrollDepth(events: AnalyticsEvent[]): number {
    const scrollEvents = events.filter(e => e.type === 'scroll' && e.scrollDepth);
    if (scrollEvents.length === 0) return 0;

    const maxScroll = Math.max(...scrollEvents.map(e => e.scrollDepth || 0));
    return Math.min(maxScroll, 100); // Cap at 100%
  }

  /**
   * Detect user behavior patterns
   */
  static detectBehaviorPattern(events: AnalyticsEvent[]): {
    isSequentialReader: boolean;
    isScanner: boolean;
    isReturnVisitor: boolean;
    engagementLevel: 'high' | 'medium' | 'low';
  } {
    const sortedEvents = events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const scrollEvents = sortedEvents.filter(e => e.type === 'scroll');
    const clickEvents = sortedEvents.filter(e => e.type === 'click');
    const sessionDuration = this.calculateSessionDuration(events);
    const scrollDepth = this.calculateScrollDepth(events);

    // Sequential reader: scroll events increase progressively
    const isSequentialReader = scrollEvents.length > 2 && 
      scrollEvents.every((event, index) => 
        index === 0 || (event.scrollDepth || 0) >= (scrollEvents[index - 1].scrollDepth || 0)
      );

    // Scanner: many quick scroll events with low average depth
    const isScanner = scrollEvents.length > 5 && scrollDepth < 50;

    // Return visitor: multiple view events on different days
    const viewEvents = events.filter(e => e.type === 'view');
    const uniqueDays = new Set(viewEvents.map(e => e.timestamp.slice(0, 10)));
    const isReturnVisitor = uniqueDays.size > 1;

    // Engagement level based on session duration, scroll depth, and interactions
    let engagementLevel: 'high' | 'medium' | 'low' = 'low';
    if (sessionDuration > 300 && scrollDepth > 70 && clickEvents.length > 2) {
      engagementLevel = 'high';
    } else if (sessionDuration > 120 && scrollDepth > 40) {
      engagementLevel = 'medium';
    }

    return {
      isSequentialReader,
      isScanner,
      isReturnVisitor,
      engagementLevel
    };
  }

  /**
   * Calculate conversion funnel metrics
   */
  static calculateFunnelMetrics(events: AnalyticsEvent[]): Array<{
    step: string;
    count: number;
    rate: number;
  }> {
    const funnelSteps = ['view', 'scroll', 'click', 'download', 'signature'];
    const stepCounts = new Map<string, Set<string>>();

    // Count unique sessions for each step
    events.forEach(event => {
      const step = event.type;
      if (funnelSteps.includes(step)) {
        if (!stepCounts.has(step)) {
          stepCounts.set(step, new Set());
        }
        stepCounts.get(step)!.add(event.sessionId);
      }
    });

    const totalSessions = stepCounts.get('view')?.size || 0;
    
    return funnelSteps.map(step => {
      const count = stepCounts.get(step)?.size || 0;
      const rate = totalSessions > 0 ? (count / totalSessions) * 100 : 0;
      
      return {
        step,
        count,
        rate
      };
    });
  }

  /**
   * Analyze metric trends over time
   */
  static analyzeTrend(values: number[]): TrendAnalysis {
    if (values.length < 2) {
      return {
        metric: 'unknown',
        trend: 'stable',
        changePercent: 0,
        significance: 'low',
        timeframe: 'insufficient-data'
      };
    }

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const changePercent = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    // Calculate trend using linear regression
    const trend = this.calculateLinearTrend(values);
    
    let trendDirection: MetricTrend = 'stable';
    if (Math.abs(changePercent) > 10) {
      if (trend > 0.1) trendDirection = 'increasing';
      else if (trend < -0.1) trendDirection = 'decreasing';
      else trendDirection = 'volatile';
    }

    const significance = Math.abs(changePercent) > 20 ? 'high' : 
                       Math.abs(changePercent) > 10 ? 'medium' : 'low';

    return {
      metric: 'analyzed',
      trend: trendDirection,
      changePercent: Math.round(changePercent * 100) / 100,
      significance,
      timeframe: `${values.length} periods`
    };
  }

  /**
   * Calculate linear trend coefficient
   */
  static calculateLinearTrend(values: number[]): number {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  /**
   * Compare metrics against benchmarks
   */
  static compareToBenchmark(
    currentValue: number, 
    benchmarkValue: number, 
    metric: string,
    industry?: string
  ): BenchmarkComparison {
    const percentageDifference = benchmarkValue !== 0 
      ? ((currentValue - benchmarkValue) / benchmarkValue) * 100 
      : 0;

    let performance: 'above' | 'at' | 'below' = 'at';
    if (Math.abs(percentageDifference) > 5) {
      performance = percentageDifference > 0 ? 'above' : 'below';
    }

    return {
      metric,
      currentValue,
      benchmarkValue,
      performance,
      percentageDifference: Math.round(percentageDifference * 100) / 100,
      industry
    };
  }

  /**
   * Calculate statistical significance
   */
  static calculateSignificance(sampleA: number[], sampleB: number[]): {
    significant: boolean;
    pValue: number;
    confidenceLevel: number;
  } {
    // Simplified t-test implementation
    const meanA = sampleA.reduce((sum, val) => sum + val, 0) / sampleA.length;
    const meanB = sampleB.reduce((sum, val) => sum + val, 0) / sampleB.length;
    
    const varianceA = sampleA.reduce((sum, val) => sum + Math.pow(val - meanA, 2), 0) / (sampleA.length - 1);
    const varianceB = sampleB.reduce((sum, val) => sum + Math.pow(val - meanB, 2), 0) / (sampleB.length - 1);
    
    const pooledVariance = ((sampleA.length - 1) * varianceA + (sampleB.length - 1) * varianceB) / 
                          (sampleA.length + sampleB.length - 2);
    
    const standardError = Math.sqrt(pooledVariance * (1/sampleA.length + 1/sampleB.length));
    const tStat = Math.abs(meanA - meanB) / standardError;
    
    // Simplified p-value calculation (approximation)
    const pValue = Math.max(0.001, 2 * (1 - this.normalCDF(tStat)));
    const significant = pValue < 0.05;
    const confidenceLevel = (1 - pValue) * 100;

    return {
      significant,
      pValue: Math.round(pValue * 1000) / 1000,
      confidenceLevel: Math.round(confidenceLevel * 100) / 100
    };
  }

  /**
   * Normal cumulative distribution function approximation
   */
  static normalCDF(x: number): number {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * Generate time-based aggregations
   */
  static aggregateByTime(
    events: AnalyticsEvent[],
    interval: 'hour' | 'day' | 'week' | 'month'
  ): Array<{ date: string; views: number; uniqueVisitors: number }> {
    const groups = this.groupEvents(events, interval);
    
    return Object.entries(groups).map(([date, groupEvents]) => {
      const uniqueVisitors = new Set(
        groupEvents.map(e => e.visitorId || e.sessionId)
      ).size;
      
      return {
        date,
        views: groupEvents.filter(e => e.type === 'view').length,
        uniqueVisitors
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }
}