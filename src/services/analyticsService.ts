import {
  AnalyticsRequest,
  AnalyticsResponse,
  AnalyticsEvent,
  AnalyticsConfig,
  AnalyticsAlert,
  AnalyticsFilter
} from '../types/analytics';
import { AnalyticsEngine } from '../lib/analytics/engine';

class AnalyticsService {
  private engine: AnalyticsEngine;
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private alerts: AnalyticsAlert[] = [];

  constructor() {
    this.config = {
      trackingEnabled: true,
      anonymizeData: false,
      retentionDays: 365,
      alertThresholds: {
        bounceRate: 60,
        conversionRate: 1.0,
        avgTimeOnPage: 60,
        scrollDepth: 30
      },
      excludeInternalTraffic: true,
      enableRealTimeProcessing: true
    };

    this.engine = new AnalyticsEngine(this.config);
  }

  /**
   * Track a single analytics event
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    if (!this.config.trackingEnabled) return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    // Add to queue for batch processing
    this.eventQueue.push(fullEvent);

    // Process immediately if real-time processing is enabled
    if (this.config.enableRealTimeProcessing) {
      await this.processEventQueue();
    }

    // Check for alerts
    await this.checkAlerts([fullEvent]);
  }

  /**
   * Track multiple analytics events
   */
  async trackEvents(events: Omit<AnalyticsEvent, 'timestamp'>[]): Promise<void> {
    if (!this.config.trackingEnabled) return;

    const fullEvents: AnalyticsEvent[] = events.map(event => ({
      ...event,
      timestamp: new Date().toISOString()
    }));

    this.eventQueue.push(...fullEvents);

    if (this.config.enableRealTimeProcessing) {
      await this.processEventQueue();
    }

    await this.checkAlerts(fullEvents);
  }

  /**
   * Get analytics summary for a proposal
   */
  async getProposalAnalytics(proposalId: string, timeframe?: { start: string; end: string }): Promise<AnalyticsResponse> {
    const request: AnalyticsRequest = {
      type: 'summary',
      data: {
        proposalId,
        timeframe
      }
    };

    return this.engine.processAnalytics(request);
  }

  /**
   * Get insights for proposals
   */
  async getInsights(filter?: AnalyticsFilter): Promise<AnalyticsResponse> {
    const events = await this.getFilteredEvents(filter);
    
    const request: AnalyticsRequest = {
      type: 'insight',
      data: {
        events
      }
    };

    return this.engine.processAnalytics(request);
  }

  /**
   * Get optimization recommendations
   */
  async getRecommendations(filter?: AnalyticsFilter): Promise<AnalyticsResponse> {
    const events = await this.getFilteredEvents(filter);
    
    const request: AnalyticsRequest = {
      type: 'optimization',
      data: {
        events
      }
    };

    return this.engine.processAnalytics(request);
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardData(filter?: AnalyticsFilter): Promise<AnalyticsResponse> {
    const events = await this.getFilteredEvents(filter);
    
    const request: AnalyticsRequest = {
      type: 'summary',
      data: {
        events
      }
    };

    // Get full analytics including summary, insights, recommendations, and metrics
    const summaryResponse = await this.engine.processAnalytics({ ...request, type: 'summary' });
    const insightsResponse = await this.engine.processAnalytics({ ...request, type: 'insight' });
    const recommendationsResponse = await this.engine.processAnalytics({ ...request, type: 'optimization' });
    const metricsResponse = await this.engine.processAnalytics({ ...request, type: 'event' });

    return {
      success: true,
      analytics: {
        summary: summaryResponse.analytics.summary,
        insights: insightsResponse.analytics.insights,
        recommendations: recommendationsResponse.analytics.recommendations,
        metrics: metricsResponse.analytics.metrics
      }
    };
  }

  /**
   * Track proposal view event
   */
  async trackProposalView(proposalId: string, sessionId: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      type: 'view',
      proposalId,
      sessionId,
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Track scroll event with depth
   */
  async trackScroll(proposalId: string, sessionId: string, scrollDepth: number, section?: string): Promise<void> {
    await this.trackEvent({
      type: 'scroll',
      proposalId,
      sessionId,
      scrollDepth,
      section,
      metadata: {
        scrollDepth,
        windowHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight
      }
    });
  }

  /**
   * Track click event
   */
  async trackClick(proposalId: string, sessionId: string, section: string, element: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      type: 'click',
      proposalId,
      sessionId,
      section,
      metadata: {
        element,
        ...metadata
      }
    });
  }

  /**
   * Track download event
   */
  async trackDownload(proposalId: string, sessionId: string, downloadType: string = 'pdf', metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      type: 'download',
      proposalId,
      sessionId,
      metadata: {
        downloadType,
        ...metadata
      }
    });
  }

  /**
   * Track signature event
   */
  async trackSignature(proposalId: string, sessionId: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      type: 'signature',
      proposalId,
      sessionId,
      metadata: {
        signatureMethod: 'electronic',
        ...metadata
      }
    });
  }

  /**
   * Track exit/close event
   */
  async trackExit(proposalId: string, sessionId: string, section?: string, timeOnPage?: number): Promise<void> {
    await this.trackEvent({
      type: 'exit',
      proposalId,
      sessionId,
      section,
      timeOnPage,
      metadata: {
        exitType: 'close',
        timeOnPage
      }
    });
  }

  /**
   * Get real-time metrics for a proposal
   */
  async getRealTimeMetrics(proposalId: string): Promise<{
    currentViewers: number;
    totalViews: number;
    avgTimeOnPage: number;
    conversionRate: number;
  }> {
    // In a real implementation, this would query a real-time database
    // For now, return mock data based on recent events
    const recentEvents = this.eventQueue
      .filter(e => e.proposalId === proposalId)
      .filter(e => new Date(e.timestamp).getTime() > Date.now() - 5 * 60 * 1000); // Last 5 minutes

    const activeViewers = new Set(
      recentEvents
        .filter(e => e.type === 'view')
        .map(e => e.sessionId)
    ).size;

    const totalViews = this.eventQueue
      .filter(e => e.proposalId === proposalId && e.type === 'view')
      .length;

    const signatures = this.eventQueue
      .filter(e => e.proposalId === proposalId && e.type === 'signature')
      .length;

    return {
      currentViewers: activeViewers,
      totalViews,
      avgTimeOnPage: 0, // Would calculate from session data
      conversionRate: totalViews > 0 ? (signatures / totalViews) * 100 : 0
    };
  }

  /**
   * Get active alerts
   */
  async getAlerts(): Promise<AnalyticsAlert[]> {
    return this.alerts.filter(alert => 
      new Date(alert.triggeredAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
    );
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string): Promise<void> {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
  }

  /**
   * Update analytics configuration
   */
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.engine = new AnalyticsEngine(this.config);
  }

  /**
   * Export analytics data
   */
  async exportData(format: 'json' | 'csv', filter?: AnalyticsFilter): Promise<string> {
    const events = await this.getFilteredEvents(filter);
    
    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    } else {
      // Convert to CSV
      if (events.length === 0) return '';
      
      const headers = Object.keys(events[0]).join(',');
      const rows = events.map(event => 
        Object.values(event).map(value => 
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        ).join(',')
      );
      
      return [headers, ...rows].join('\n');
    }
  }

  /**
   * Get performance benchmarks
   */
  getBenchmarks(): Record<string, number> {
    return {
      bounceRate: 40,
      conversionRate: 2.5,
      avgTimeOnPage: 180,
      scrollDepth: 65,
      returnVisitorRate: 30,
      mobileConversionRate: 1.8,
      clickThroughRate: 15,
      downloadRate: 25
    };
  }

  /**
   * Generate session ID for tracking
   */
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate visitor ID for tracking
   */
  generateVisitorId(): string {
    // Check if visitor ID exists in localStorage
    let visitorId = localStorage.getItem('analytics_visitor_id');
    
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_visitor_id', visitorId);
    }
    
    return visitorId;
  }

  /**
   * Initialize tracking for a proposal view
   */
  initializeTracking(proposalId: string): {
    sessionId: string;
    visitorId: string;
    trackView: () => Promise<void>;
    trackScroll: (depth: number, section?: string) => Promise<void>;
    trackClick: (section: string, element: string) => Promise<void>;
    trackDownload: (type?: string) => Promise<void>;
    trackSignature: () => Promise<void>;
    trackExit: (section?: string, timeOnPage?: number) => Promise<void>;
  } {
    const sessionId = this.generateSessionId();
    const visitorId = this.generateVisitorId();

    return {
      sessionId,
      visitorId,
      trackView: () => this.trackProposalView(proposalId, sessionId),
      trackScroll: (depth: number, section?: string) => this.trackScroll(proposalId, sessionId, depth, section),
      trackClick: (section: string, element: string) => this.trackClick(proposalId, sessionId, section, element),
      trackDownload: (type?: string) => this.trackDownload(proposalId, sessionId, type),
      trackSignature: () => this.trackSignature(proposalId, sessionId),
      trackExit: (section?: string, timeOnPage?: number) => this.trackExit(proposalId, sessionId, section, timeOnPage)
    };
  }

  // Private helper methods

  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    // In a real implementation, this would send events to a backend service
    // For now, we'll just process them locally
    console.log(`Processing ${this.eventQueue.length} analytics events`);
    
    // Clear the queue after processing
    this.eventQueue = [];
  }

  private async getFilteredEvents(filter?: AnalyticsFilter): Promise<AnalyticsEvent[]> {
    // In a real implementation, this would query a database
    // For now, return events from the queue (limited for demo)
    let events = [...this.eventQueue];

    if (filter) {
      if (filter.proposalIds && filter.proposalIds.length > 0) {
        events = events.filter(e => e.proposalId && filter.proposalIds!.includes(e.proposalId));
      }

      if (filter.userIds && filter.userIds.length > 0) {
        events = events.filter(e => e.userId && filter.userIds!.includes(e.userId));
      }

      if (filter.dateRange) {
        events = events.filter(e => {
          const eventDate = new Date(e.timestamp);
          return eventDate >= filter.dateRange!.start && eventDate <= filter.dateRange!.end;
        });
      }

      if (filter.eventTypes && filter.eventTypes.length > 0) {
        events = events.filter(e => filter.eventTypes!.includes(e.type));
      }

      if (filter.deviceTypes && filter.deviceTypes.length > 0) {
        events = events.filter(e => e.deviceType && filter.deviceTypes!.includes(e.deviceType));
      }
    }

    return events;
  }

  private async checkAlerts(events: AnalyticsEvent[]): Promise<void> {
    // Check for threshold breaches and generate alerts
    const proposalGroups = events.reduce((groups, event) => {
      if (event.proposalId) {
        if (!groups[event.proposalId]) groups[event.proposalId] = [];
        groups[event.proposalId].push(event);
      }
      return groups;
    }, {} as Record<string, AnalyticsEvent[]>);

    for (const [proposalId, proposalEvents] of Object.entries(proposalGroups)) {
      await this.checkProposalAlerts(proposalId, proposalEvents);
    }
  }

  private async checkProposalAlerts(proposalId: string, events: AnalyticsEvent[]): Promise<void> {
    const viewEvents = events.filter(e => e.type === 'view');
    const exitEvents = events.filter(e => e.type === 'exit');
    
    if (viewEvents.length > 0) {
      const bounceRate = (exitEvents.length / viewEvents.length) * 100;
      
      if (bounceRate > this.config.alertThresholds.bounceRate) {
        const alert: AnalyticsAlert = {
          id: `alert_${Date.now()}_${proposalId}`,
          type: 'threshold',
          severity: bounceRate > 80 ? 'critical' : 'high',
          title: 'High Bounce Rate Alert',
          description: `Proposal ${proposalId} has a ${bounceRate.toFixed(1)}% bounce rate, exceeding the threshold of ${this.config.alertThresholds.bounceRate}%.`,
          triggeredAt: new Date(),
          proposalId,
          metric: 'bounceRate',
          currentValue: bounceRate,
          threshold: this.config.alertThresholds.bounceRate,
          actionRequired: true,
          suggestions: [
            'Review the opening content for engagement',
            'Check if the proposal is too long',
            'Ensure mobile optimization',
            'Consider adding more visual elements'
          ]
        };

        this.alerts.push(alert);
      }
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;