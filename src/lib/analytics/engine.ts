import {
  AnalyticsEvent,
  AnalyticsRequest,
  AnalyticsResponse,
  AnalyticsInsight,
  AnalyticsRecommendation,
  AnalyticsSummary,
  AnalyticsMetrics,
  AnalyticsFilter,
  AnalyticsConfig,
  AnalyticsAlert,
  ProposalPerformance,
  TrendAnalysis,
  BenchmarkComparison
} from '../../types/analytics';
import { AnalyticsUtils } from './utils';

export class AnalyticsEngine {
  private config: AnalyticsConfig;
  private benchmarks: Record<string, number>;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.benchmarks = {
      bounceRate: 40, // Industry average bounce rate
      conversionRate: 2.5, // Average proposal conversion rate
      avgTimeOnPage: 180, // 3 minutes average
      scrollDepth: 65, // 65% average scroll depth
      returnVisitorRate: 30,
      mobileConversionRate: 1.8
    };
  }

  /**
   * Main processing method for analytics requests
   */
  async processAnalytics(request: AnalyticsRequest): Promise<AnalyticsResponse> {
    const startTime = Date.now();

    try {
      // Clean and validate input data
      const cleanEvents = request.data.events 
        ? AnalyticsUtils.cleanEvents(request.data.events, this.config)
        : [];

      // Apply filters if provided
      const filteredEvents = request.data.filters 
        ? this.applyFilters(cleanEvents, request.data.filters)
        : cleanEvents;

      // Process based on request type
      let analytics: AnalyticsResponse['analytics'] = {};

      switch (request.type) {
        case 'event':
          analytics = await this.processEvents(filteredEvents);
          break;
        case 'summary':
          analytics.summary = await this.generateSummary(filteredEvents);
          break;
        case 'insight':
          analytics.insights = await this.generateInsights(filteredEvents);
          break;
        case 'optimization':
          analytics.recommendations = await this.generateRecommendations(filteredEvents);
          analytics.insights = await this.generateInsights(filteredEvents);
          break;
        default:
          // Full analytics processing
          analytics = await this.processFullAnalytics(filteredEvents);
      }

      const processingTime = Date.now() - startTime;
      const dataQuality = this.assessDataQuality(filteredEvents);

      return {
        success: true,
        analytics,
        processingTime,
        dataQuality
      };

    } catch (error) {
      return {
        success: false,
        analytics: {},
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Apply filters to events
   */
  private applyFilters(events: AnalyticsEvent[], filters: any): AnalyticsEvent[] {
    // Convert filters to AnalyticsFilter format
    const analyticsFilter: AnalyticsFilter = {
      proposalIds: filters.proposalIds,
      userIds: filters.userIds,
      excludeBots: true
    };

    return AnalyticsUtils.filterEvents(events, analyticsFilter);
  }

  /**
   * Process events and return basic metrics
   */
  private async processEvents(events: AnalyticsEvent[]): Promise<AnalyticsResponse['analytics']> {
    const metrics = await this.calculateMetrics(events);
    
    return {
      metrics
    };
  }

  /**
   * Generate comprehensive analytics summary
   */
  private async generateSummary(events: AnalyticsEvent[]): Promise<AnalyticsSummary> {
    const viewEvents = events.filter(e => e.type === 'view');
    const signatureEvents = events.filter(e => e.type === 'signature');
    const uniqueVisitors = new Set(events.map(e => e.visitorId || e.sessionId)).size;

    // Group events by proposal to calculate proposal performance
    const proposalGroups = AnalyticsUtils.groupEvents(events, 'proposal');
    const topPerformingProposals: ProposalPerformance[] = Object.entries(proposalGroups)
      .map(([proposalId, proposalEvents]) => {
        const views = proposalEvents.filter(e => e.type === 'view').length;
        const signatures = proposalEvents.filter(e => e.type === 'signature').length;
        const uniqueProposalVisitors = new Set(proposalEvents.map(e => e.visitorId || e.sessionId)).size;
        const avgTimeOnPage = this.calculateAverageTimeOnPage(proposalEvents);
        const avgScrollDepth = AnalyticsUtils.calculateScrollDepth(proposalEvents);

        return {
          id: proposalId,
          title: `Proposal ${proposalId}`, // Would be fetched from database in real implementation
          views,
          uniqueVisitors: uniqueProposalVisitors,
          conversionRate: views > 0 ? (signatures / views) * 100 : 0,
          avgTimeOnPage,
          avgScrollDepth,
          signatureRate: views > 0 ? (signatures / views) * 100 : 0,
          downloadRate: this.calculateDownloadRate(proposalEvents)
        };
      })
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);

    return {
      totalViews: viewEvents.length,
      uniqueVisitors,
      avgTimeOnPage: this.calculateAverageTimeOnPage(events),
      avgScrollDepth: AnalyticsUtils.calculateScrollDepth(events),
      conversionRate: viewEvents.length > 0 ? (signatureEvents.length / viewEvents.length) * 100 : 0,
      topPerformingProposals
    };
  }

  /**
   * Generate actionable insights from analytics data
   */
  private async generateInsights(events: AnalyticsEvent[]): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];

    // Engagement insights
    insights.push(...this.analyzeEngagementPatterns(events));
    
    // Conversion insights
    insights.push(...this.analyzeConversionPatterns(events));
    
    // Content performance insights
    insights.push(...this.analyzeContentPerformance(events));
    
    // Timing insights
    insights.push(...this.analyzeTimingPatterns(events));

    // Sort by impact and confidence
    return insights.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      const aScore = impactWeight[a.impact] * a.confidence;
      const bScore = impactWeight[b.impact] * b.confidence;
      return bScore - aScore;
    });
  }

  /**
   * Generate optimization recommendations
   */
  private async generateRecommendations(events: AnalyticsEvent[]): Promise<AnalyticsRecommendation[]> {
    const recommendations: AnalyticsRecommendation[] = [];

    // Content optimization recommendations
    recommendations.push(...this.generateContentRecommendations(events));
    
    // Design optimization recommendations
    recommendations.push(...this.generateDesignRecommendations(events));
    
    // Timing optimization recommendations
    recommendations.push(...this.generateTimingRecommendations(events));
    
    // Follow-up recommendations
    recommendations.push(...this.generateFollowUpRecommendations(events));

    // Sort by priority and expected impact
    return recommendations.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }

  /**
   * Process full analytics with all components
   */
  private async processFullAnalytics(events: AnalyticsEvent[]): Promise<AnalyticsResponse['analytics']> {
    const [summary, insights, recommendations, metrics] = await Promise.all([
      this.generateSummary(events),
      this.generateInsights(events),
      this.generateRecommendations(events),
      this.calculateMetrics(events)
    ]);

    return {
      summary,
      insights,
      recommendations,
      metrics
    };
  }

  /**
   * Calculate comprehensive metrics
   */
  private async calculateMetrics(events: AnalyticsEvent[]): Promise<AnalyticsMetrics> {
    // Engagement metrics
    const viewsOverTime = AnalyticsUtils.aggregateByTime(events, 'day');
    const sectionGroups = AnalyticsUtils.groupEvents(events, 'section');
    const scrollHeatmap = Object.entries(sectionGroups).map(([section, sectionEvents]) => ({
      section,
      avgDepth: AnalyticsUtils.calculateScrollDepth(sectionEvents),
      visits: sectionEvents.filter(e => e.type === 'view').length
    }));

    const clickThroughRates = this.calculateClickThroughRates(events);
    const sectionEngagement = this.calculateSectionEngagement(events);

    // Conversion metrics
    const funnelSteps = AnalyticsUtils.calculateFunnelMetrics(events);
    const dropOffPoints = this.calculateDropOffPoints(events);
    const signatureFlow = this.calculateSignatureFlow(events);
    const conversionPaths = this.calculateConversionPaths(events);

    // Behavioral metrics
    const sessionGroups = AnalyticsUtils.groupEvents(events, 'user');
    const sessionDurations = Object.values(sessionGroups).map(sessionEvents => 
      AnalyticsUtils.calculateSessionDuration(sessionEvents)
    );
    const avgSessionDuration = sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length || 0;

    const bounceRate = this.calculateBounceRate(events);
    const returnVisitorRate = this.calculateReturnVisitorRate(events);
    const deviceBreakdown = this.calculateDeviceBreakdown(events);
    const timeOfDayPatterns = this.calculateTimeOfDayPatterns(events);
    const dayOfWeekPatterns = this.calculateDayOfWeekPatterns(events);
    const geographicDistribution = this.calculateGeographicDistribution(events);

    return {
      engagement: {
        viewsOverTime,
        scrollHeatmap,
        clickThroughRates,
        sectionEngagement
      },
      conversion: {
        funnelSteps,
        dropOffPoints,
        signatureFlow,
        conversionPaths
      },
      behavioral: {
        avgSessionDuration,
        bounceRate,
        returnVisitorRate,
        deviceBreakdown,
        timeOfDayPatterns,
        dayOfWeekPatterns,
        geographicDistribution
      }
    };
  }

  /**
   * Analyze engagement patterns for insights
   */
  private analyzeEngagementPatterns(events: AnalyticsEvent[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const avgScrollDepth = AnalyticsUtils.calculateScrollDepth(events);
    const avgTimeOnPage = this.calculateAverageTimeOnPage(events);
    const bounceRate = this.calculateBounceRate(events);

    // High engagement insight
    if (avgScrollDepth > 70 && avgTimeOnPage > 240) {
      insights.push({
        type: 'positive',
        category: 'engagement',
        title: 'Excellent Content Engagement',
        description: `Users are highly engaged with your proposals, with ${avgScrollDepth.toFixed(1)}% average scroll depth and ${Math.round(avgTimeOnPage)} seconds average time on page.`,
        impact: 'high',
        actionable: false,
        confidence: 0.9,
        dataPoints: events.length
      });
    }

    // Low engagement warning
    if (avgScrollDepth < 30 || bounceRate > 60) {
      insights.push({
        type: 'negative',
        category: 'engagement',
        title: 'Low Initial Engagement',
        description: `${bounceRate.toFixed(1)}% bounce rate and ${avgScrollDepth.toFixed(1)}% scroll depth suggest users aren't engaging with your content effectively.`,
        impact: 'high',
        actionable: true,
        confidence: 0.85,
        dataPoints: events.length
      });
    }

    // Mobile engagement analysis
    const mobileEvents = events.filter(e => e.deviceType === 'mobile');
    const desktopEvents = events.filter(e => e.deviceType === 'desktop');
    
    if (mobileEvents.length > 0 && desktopEvents.length > 0) {
      const mobileScrollDepth = AnalyticsUtils.calculateScrollDepth(mobileEvents);
      const desktopScrollDepth = AnalyticsUtils.calculateScrollDepth(desktopEvents);
      
      if (desktopScrollDepth - mobileScrollDepth > 20) {
        insights.push({
          type: 'negative',
          category: 'engagement',
          title: 'Mobile Experience Gap',
          description: `Mobile users scroll ${mobileScrollDepth.toFixed(1)}% vs ${desktopScrollDepth.toFixed(1)}% on desktop, indicating mobile optimization issues.`,
          impact: 'medium',
          actionable: true,
          confidence: 0.8,
          dataPoints: mobileEvents.length + desktopEvents.length
        });
      }
    }

    return insights;
  }

  /**
   * Analyze conversion patterns for insights
   */
  private analyzeConversionPatterns(events: AnalyticsEvent[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const viewEvents = events.filter(e => e.type === 'view');
    const signatureEvents = events.filter(e => e.type === 'signature');
    const downloadEvents = events.filter(e => e.type === 'download');
    
    const conversionRate = viewEvents.length > 0 ? (signatureEvents.length / viewEvents.length) * 100 : 0;
    const downloadToSignatureRate = downloadEvents.length > 0 ? (signatureEvents.length / downloadEvents.length) * 100 : 0;

    // High conversion rate
    if (conversionRate > this.benchmarks.conversionRate * 1.5) {
      insights.push({
        type: 'positive',
        category: 'conversion',
        title: 'Excellent Conversion Performance',
        description: `Your ${conversionRate.toFixed(1)}% conversion rate significantly exceeds the industry average of ${this.benchmarks.conversionRate}%.`,
        impact: 'high',
        actionable: false,
        confidence: 0.95,
        dataPoints: viewEvents.length
      });
    }

    // Low conversion rate
    if (conversionRate < this.benchmarks.conversionRate * 0.5) {
      insights.push({
        type: 'negative',
        category: 'conversion',
        title: 'Below Average Conversion Rate',
        description: `Your ${conversionRate.toFixed(1)}% conversion rate is below the industry average. Consider optimizing your proposal content and call-to-action placement.`,
        impact: 'high',
        actionable: true,
        confidence: 0.9,
        dataPoints: viewEvents.length
      });
    }

    // Download but no signature pattern
    if (downloadEvents.length > signatureEvents.length * 2 && downloadToSignatureRate < 30) {
      insights.push({
        type: 'negative',
        category: 'conversion',
        title: 'High Download, Low Signature Rate',
        description: `Many users download proposals but don't sign (${downloadToSignatureRate.toFixed(1)}% conversion). This suggests price shopping or decision delays.`,
        impact: 'medium',
        actionable: true,
        confidence: 0.8,
        dataPoints: downloadEvents.length
      });
    }

    return insights;
  }

  /**
   * Analyze content performance patterns
   */
  private analyzeContentPerformance(events: AnalyticsEvent[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const sectionGroups = AnalyticsUtils.groupEvents(events, 'section');
    
    // Find sections with high drop-off rates
    const sectionMetrics = Object.entries(sectionGroups).map(([section, sectionEvents]) => {
      const viewCount = sectionEvents.filter(e => e.type === 'view').length;
      const exitCount = sectionEvents.filter(e => e.type === 'exit').length;
      const dropOffRate = viewCount > 0 ? (exitCount / viewCount) * 100 : 0;
      const avgTimeSpent = this.calculateAverageTimeOnPage(sectionEvents);
      
      return { section, dropOffRate, viewCount, avgTimeSpent };
    });

    const highDropOffSections = sectionMetrics.filter(s => s.dropOffRate > 40 && s.viewCount > 5);
    
    if (highDropOffSections.length > 0) {
      const worstSection = highDropOffSections.sort((a, b) => b.dropOffRate - a.dropOffRate)[0];
      insights.push({
        type: 'negative',
        category: 'content',
        title: 'High Drop-off Section Identified',
        description: `The "${worstSection.section}" section has a ${worstSection.dropOffRate.toFixed(1)}% drop-off rate. Consider revising this content for better engagement.`,
        impact: 'medium',
        actionable: true,
        confidence: 0.85,
        dataPoints: worstSection.viewCount
      });
    }

    // Find high-performing sections
    const highEngagementSections = sectionMetrics.filter(s => s.avgTimeSpent > 60 && s.viewCount > 5);
    
    if (highEngagementSections.length > 0) {
      const bestSection = highEngagementSections.sort((a, b) => b.avgTimeSpent - a.avgTimeSpent)[0];
      insights.push({
        type: 'positive',
        category: 'content',
        title: 'High-Engagement Content Identified',
        description: `The "${bestSection.section}" section keeps users engaged for ${Math.round(bestSection.avgTimeSpent)} seconds on average. Consider applying similar approaches to other sections.`,
        impact: 'medium',
        actionable: true,
        confidence: 0.8,
        dataPoints: bestSection.viewCount
      });
    }

    return insights;
  }

  /**
   * Analyze timing patterns for insights
   */
  private analyzeTimingPatterns(events: AnalyticsEvent[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const timeOfDayPatterns = this.calculateTimeOfDayPatterns(events);
    const dayOfWeekPatterns = this.calculateDayOfWeekPatterns(events);

    // Find peak engagement times
    const peakHour = Object.entries(timeOfDayPatterns)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (peakHour && peakHour[1] > Object.values(timeOfDayPatterns).reduce((sum, val) => sum + val, 0) / 24 * 1.5) {
      insights.push({
        type: 'positive',
        category: 'timing',
        title: 'Peak Engagement Time Identified',
        description: `${peakHour[0]}:00 shows ${Math.round(peakHour[1])}% higher engagement than average. Consider timing your proposal sends around this hour.`,
        impact: 'medium',
        actionable: true,
        confidence: 0.75,
        dataPoints: Object.values(timeOfDayPatterns).reduce((sum, val) => sum + val, 0)
      });
    }

    // Find best days for engagement
    const peakDay = Object.entries(dayOfWeekPatterns)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (peakDay && peakDay[1] > Object.values(dayOfWeekPatterns).reduce((sum, val) => sum + val, 0) / 7 * 1.3) {
      insights.push({
        type: 'positive',
        category: 'timing',
        title: 'Optimal Day for Proposals',
        description: `${peakDay[0]} shows the highest engagement with ${Math.round(peakDay[1])}% of weekly activity. Consider sending proposals on this day.`,
        impact: 'low',
        actionable: true,
        confidence: 0.7,
        dataPoints: Object.values(dayOfWeekPatterns).reduce((sum, val) => sum + val, 0)
      });
    }

    return insights;
  }

  /**
   * Generate content optimization recommendations
   */
  private generateContentRecommendations(events: AnalyticsEvent[]): AnalyticsRecommendation[] {
    const recommendations: AnalyticsRecommendation[] = [];
    const avgScrollDepth = AnalyticsUtils.calculateScrollDepth(events);
    const bounceRate = this.calculateBounceRate(events);

    if (avgScrollDepth < 50) {
      recommendations.push({
        priority: 'high',
        category: 'content',
        title: 'Improve Opening Content Hook',
        description: 'Low scroll depth suggests users aren\'t engaged by your opening content. Consider starting with a compelling value proposition or client-specific benefit.',
        expectedImpact: 'Increase scroll depth by 20-30% and reduce bounce rate',
        implementation: 'Rewrite the first section to focus on client pain points and immediate value. Use bullet points and visuals to make it scannable.',
        estimatedEffort: 'medium',
        expectedTimeframe: '1-2 weeks'
      });
    }

    if (bounceRate > 50) {
      recommendations.push({
        priority: 'high',
        category: 'content',
        title: 'Optimize Proposal Length and Structure',
        description: 'High bounce rate indicates proposals may be too long or poorly structured for quick scanning.',
        expectedImpact: 'Reduce bounce rate by 15-25%',
        implementation: 'Use executive summary, clear headings, bullet points, and visual breaks. Consider progressive disclosure for detailed sections.',
        estimatedEffort: 'high',
        expectedTimeframe: '2-3 weeks'
      });
    }

    // Analyze section performance
    const sectionGroups = AnalyticsUtils.groupEvents(events, 'section');
    const lowPerformingSections = Object.entries(sectionGroups).filter(([, sectionEvents]) => {
      const avgTime = this.calculateAverageTimeOnPage(sectionEvents);
      return avgTime < 30 && sectionEvents.length > 5;
    });

    if (lowPerformingSections.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'content',
        title: 'Revise Low-Engagement Sections',
        description: `${lowPerformingSections.length} sections show low engagement times. These may need content revision or better visual presentation.`,
        expectedImpact: 'Improve overall engagement by 10-15%',
        implementation: 'Review sections with <30 second engagement. Add visuals, simplify language, or consider removing if not essential.',
        estimatedEffort: 'medium',
        expectedTimeframe: '1-2 weeks'
      });
    }

    return recommendations;
  }

  /**
   * Generate design optimization recommendations
   */
  private generateDesignRecommendations(events: AnalyticsEvent[]): AnalyticsRecommendation[] {
    const recommendations: AnalyticsRecommendation[] = [];
    const mobileEvents = events.filter(e => e.deviceType === 'mobile');
    const desktopEvents = events.filter(e => e.deviceType === 'desktop');

    if (mobileEvents.length > 0 && desktopEvents.length > 0) {
      const mobileScrollDepth = AnalyticsUtils.calculateScrollDepth(mobileEvents);
      const desktopScrollDepth = AnalyticsUtils.calculateScrollDepth(desktopEvents);

      if (desktopScrollDepth - mobileScrollDepth > 15) {
        recommendations.push({
          priority: 'high',
          category: 'design',
          title: 'Optimize Mobile Experience',
          description: `Mobile users scroll ${mobileScrollDepth.toFixed(1)}% vs ${desktopScrollDepth.toFixed(1)}% on desktop, indicating mobile usability issues.`,
          expectedImpact: 'Improve mobile conversion by 20-30%',
          implementation: 'Implement responsive design, larger touch targets, simplified navigation, and mobile-optimized content layout.',
          estimatedEffort: 'high',
          expectedTimeframe: '3-4 weeks'
        });
      }
    }

    const clickEvents = events.filter(e => e.type === 'click');
    const viewEvents = events.filter(e => e.type === 'view');
    const clickThroughRate = viewEvents.length > 0 ? (clickEvents.length / viewEvents.length) * 100 : 0;

    if (clickThroughRate < 10) {
      recommendations.push({
        priority: 'medium',
        category: 'design',
        title: 'Improve Call-to-Action Visibility',
        description: `Low click-through rate (${clickThroughRate.toFixed(1)}%) suggests CTAs may not be prominent enough or compelling.`,
        expectedImpact: 'Increase click-through rate by 15-25%',
        implementation: 'Use contrasting colors, clear action-oriented text, and strategic placement for CTAs. Consider multiple CTA placements.',
        estimatedEffort: 'low',
        expectedTimeframe: '1 week'
      });
    }

    return recommendations;
  }

  /**
   * Generate timing optimization recommendations
   */
  private generateTimingRecommendations(events: AnalyticsEvent[]): AnalyticsRecommendation[] {
    const recommendations: AnalyticsRecommendation[] = [];
    const timeOfDayPatterns = this.calculateTimeOfDayPatterns(events);
    const dayOfWeekPatterns = this.calculateDayOfWeekPatterns(events);

    // Find optimal sending times
    const peakHours = Object.entries(timeOfDayPatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (peakHours.length > 0 && peakHours[0][1] > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'timing',
        title: 'Optimize Proposal Send Times',
        description: `Data shows peak engagement at ${peakHours.map(([hour]) => hour + ':00').join(', ')}. Time your sends for maximum impact.`,
        expectedImpact: 'Increase initial view rates by 10-20%',
        implementation: 'Schedule proposal sends during peak hours. Set up automated sending for optimal times.',
        estimatedEffort: 'low',
        expectedTimeframe: '1 week'
      });
    }

    // Analyze signature timing patterns
    const signatureEvents = events.filter(e => e.type === 'signature');
    const viewEvents = events.filter(e => e.type === 'view');
    
    if (signatureEvents.length > 0 && viewEvents.length > 0) {
      // Calculate average time from view to signature
      const signatureTimes = signatureEvents.map(sigEvent => {
        const correspondingView = viewEvents.find(viewEvent => 
          viewEvent.sessionId === sigEvent.sessionId || viewEvent.proposalId === sigEvent.proposalId
        );
        if (correspondingView) {
          return new Date(sigEvent.timestamp).getTime() - new Date(correspondingView.timestamp).getTime();
        }
        return null;
      }).filter(time => time !== null) as number[];

      const avgTimeToSignature = signatureTimes.reduce((sum, time) => sum + time, 0) / signatureTimes.length;
      const avgDaysToSignature = avgTimeToSignature / (1000 * 60 * 60 * 24);

      if (avgDaysToSignature > 7) {
        recommendations.push({
          priority: 'medium',
          category: 'timing',
          title: 'Implement Follow-up Sequence',
          description: `Average time to signature is ${avgDaysToSignature.toFixed(1)} days. A structured follow-up sequence could accelerate decisions.`,
          expectedImpact: 'Reduce time to signature by 20-30%',
          implementation: 'Create automated follow-up emails at 3, 7, and 14 days with different angles (urgency, social proof, additional value).',
          estimatedEffort: 'medium',
          expectedTimeframe: '2 weeks'
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate follow-up optimization recommendations
   */
  private generateFollowUpRecommendations(events: AnalyticsEvent[]): AnalyticsRecommendation[] {
    const recommendations: AnalyticsRecommendation[] = [];
    const downloadEvents = events.filter(e => e.type === 'download');
    const signatureEvents = events.filter(e => e.type === 'signature');
    const viewEvents = events.filter(e => e.type === 'view');

    // High download, low signature rate
    if (downloadEvents.length > signatureEvents.length * 1.5) {
      recommendations.push({
        priority: 'high',
        category: 'follow-up',
        title: 'Target Download-Only Users',
        description: 'Many users download but don\'t sign. Create targeted follow-up campaigns for this segment.',
        expectedImpact: 'Convert 10-15% of download-only users to signatures',
        implementation: 'Set up automated follow-up for users who download but don\'t sign within 48 hours. Address common objections and offer consultation calls.',
        estimatedEffort: 'medium',
        expectedTimeframe: '2 weeks'
      });
    }

    // Return visitors analysis
    const returnVisitorRate = this.calculateReturnVisitorRate(events);
    if (returnVisitorRate > 30) {
      recommendations.push({
        priority: 'medium',
        category: 'follow-up',
        title: 'Nurture Return Visitors',
        description: `${returnVisitorRate.toFixed(1)}% of users return multiple times, indicating strong interest. Implement targeted nurturing for this segment.`,
        expectedImpact: 'Increase conversion rate of return visitors by 25-40%',
        implementation: 'Create personalized follow-up content for return visitors. Offer limited-time incentives or schedule consultation calls.',
        estimatedEffort: 'medium',
        expectedTimeframe: '2-3 weeks'
      });
    }

    return recommendations;
  }

  // Helper methods for metric calculations

  private calculateAverageTimeOnPage(events: AnalyticsEvent[]): number {
    const sessionGroups = AnalyticsUtils.groupEvents(events, 'user');
    const sessionDurations = Object.values(sessionGroups).map(sessionEvents => 
      AnalyticsUtils.calculateSessionDuration(sessionEvents)
    );
    return sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length || 0;
  }

  private calculateDownloadRate(events: AnalyticsEvent[]): number {
    const viewCount = events.filter(e => e.type === 'view').length;
    const downloadCount = events.filter(e => e.type === 'download').length;
    return viewCount > 0 ? (downloadCount / viewCount) * 100 : 0;
  }

  private calculateClickThroughRates(events: AnalyticsEvent[]): Record<string, number> {
    const clickEvents = events.filter(e => e.type === 'click');
    const viewEvents = events.filter(e => e.type === 'view');
    const totalViews = viewEvents.length;

    const ctrBySection: Record<string, number> = {};
    const sectionGroups = AnalyticsUtils.groupEvents(clickEvents, 'section');

    Object.entries(sectionGroups).forEach(([section, sectionClicks]) => {
      ctrBySection[section] = totalViews > 0 ? (sectionClicks.length / totalViews) * 100 : 0;
    });

    return ctrBySection;
  }

  private calculateSectionEngagement(events: AnalyticsEvent[]): Array<{
    section: string;
    avgTimeSpent: number;
    skipRate: number;
    interactionRate: number;
  }> {
    const sectionGroups = AnalyticsUtils.groupEvents(events, 'section');
    
    return Object.entries(sectionGroups).map(([section, sectionEvents]) => {
      const viewCount = sectionEvents.filter(e => e.type === 'view').length;
      const avgTimeSpent = this.calculateAverageTimeOnPage(sectionEvents);
      const interactionCount = sectionEvents.filter(e => e.type === 'click').length;
      const exitCount = sectionEvents.filter(e => e.type === 'exit').length;
      
      return {
        section,
        avgTimeSpent,
        skipRate: viewCount > 0 ? (exitCount / viewCount) * 100 : 0,
        interactionRate: viewCount > 0 ? (interactionCount / viewCount) * 100 : 0
      };
    });
  }

  private calculateDropOffPoints(events: AnalyticsEvent[]): Array<{ section: string; rate: number; reason?: string }> {
    const sectionGroups = AnalyticsUtils.groupEvents(events, 'section');
    
    return Object.entries(sectionGroups).map(([section, sectionEvents]) => {
      const viewCount = sectionEvents.filter(e => e.type === 'view').length;
      const exitCount = sectionEvents.filter(e => e.type === 'exit').length;
      const rate = viewCount > 0 ? (exitCount / viewCount) * 100 : 0;
      
      // Infer reason based on engagement patterns
      let reason: string | undefined;
      const avgTimeSpent = this.calculateAverageTimeOnPage(sectionEvents);
      if (avgTimeSpent < 15) {
        reason = 'Quick exit - content may be irrelevant or confusing';
      } else if (avgTimeSpent > 120 && rate > 30) {
        reason = 'Long engagement but high exit - content may be overwhelming';
      }
      
      return { section, rate, reason };
    }).filter(point => point.rate > 20); // Only return significant drop-off points
  }

  private calculateSignatureFlow(events: AnalyticsEvent[]): Array<{ stage: string; completion: number; avgTime: number }> {
    // This would be more sophisticated in a real implementation
    // For now, return a simplified signature flow
    const signatureEvents = events.filter(e => e.type === 'signature');
    const viewEvents = events.filter(e => e.type === 'view');
    const downloadEvents = events.filter(e => e.type === 'download');
    
    return [
      {
        stage: 'Initial View',
        completion: 100,
        avgTime: 0
      },
      {
        stage: 'Document Review',
        completion: viewEvents.length > 0 ? (downloadEvents.length / viewEvents.length) * 100 : 0,
        avgTime: this.calculateAverageTimeOnPage(events)
      },
      {
        stage: 'Signature Completion',
        completion: viewEvents.length > 0 ? (signatureEvents.length / viewEvents.length) * 100 : 0,
        avgTime: 0 // Would calculate actual signature completion time
      }
    ];
  }

  private calculateConversionPaths(events: AnalyticsEvent[]): Array<{
    path: string[];
    count: number;
    avgTime: number;
    conversionRate: number;
  }> {
    // Group events by session to analyze paths
    const sessionGroups = AnalyticsUtils.groupEvents(events, 'user');
    const paths: Record<string, { count: number; totalTime: number; conversions: number }> = {};

    Object.values(sessionGroups).forEach(sessionEvents => {
      const sortedEvents = sessionEvents.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const path = sortedEvents.map(e => e.type);
      const pathKey = path.join(' → ');
      const sessionTime = AnalyticsUtils.calculateSessionDuration(sessionEvents);
      const hasConversion = sortedEvents.some(e => e.type === 'signature');
      
      if (!paths[pathKey]) {
        paths[pathKey] = { count: 0, totalTime: 0, conversions: 0 };
      }
      
      paths[pathKey].count++;
      paths[pathKey].totalTime += sessionTime;
      if (hasConversion) paths[pathKey].conversions++;
    });

    return Object.entries(paths)
      .map(([pathKey, data]) => ({
        path: pathKey.split(' → '),
        count: data.count,
        avgTime: data.totalTime / data.count,
        conversionRate: (data.conversions / data.count) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 paths
  }

  private calculateBounceRate(events: AnalyticsEvent[]): number {
    const sessionGroups = AnalyticsUtils.groupEvents(events, 'user');
    const totalSessions = Object.keys(sessionGroups).length;
    
    const bouncedSessions = Object.values(sessionGroups).filter(sessionEvents => {
      const sessionDuration = AnalyticsUtils.calculateSessionDuration(sessionEvents);
      return sessionDuration < 30 || sessionEvents.length === 1; // Less than 30 seconds or single event
    }).length;

    return totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;
  }

  private calculateReturnVisitorRate(events: AnalyticsEvent[]): number {
    const visitorGroups = AnalyticsUtils.groupEvents(events, 'user');
    const totalVisitors = Object.keys(visitorGroups).length;
    
    const returnVisitors = Object.values(visitorGroups).filter(visitorEvents => {
      const uniqueDays = new Set(visitorEvents.map(e => e.timestamp.slice(0, 10)));
      return uniqueDays.size > 1;
    }).length;

    return totalVisitors > 0 ? (returnVisitors / totalVisitors) * 100 : 0;
  }

  private calculateDeviceBreakdown(events: AnalyticsEvent[]): Record<string, number> {
    const deviceCounts: Record<string, number> = {};
    const totalEvents = events.length;

    events.forEach(event => {
      const device = event.deviceType || 'unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    // Convert to percentages
    Object.keys(deviceCounts).forEach(device => {
      deviceCounts[device] = (deviceCounts[device] / totalEvents) * 100;
    });

    return deviceCounts;
  }

  private calculateTimeOfDayPatterns(events: AnalyticsEvent[]): Record<string, number> {
    const hourCounts: Record<string, number> = {};
    const totalEvents = events.length;

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourCounts[i.toString()] = 0;
    }

    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours().toString();
      hourCounts[hour]++;
    });

    // Convert to percentages
    Object.keys(hourCounts).forEach(hour => {
      hourCounts[hour] = (hourCounts[hour] / totalEvents) * 100;
    });

    return hourCounts;
  }

  private calculateDayOfWeekPatterns(events: AnalyticsEvent[]): Record<string, number> {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts: Record<string, number> = {};
    const totalEvents = events.length;

    // Initialize all days
    dayNames.forEach(day => {
      dayCounts[day] = 0;
    });

    events.forEach(event => {
      const dayOfWeek = new Date(event.timestamp).getDay();
      const dayName = dayNames[dayOfWeek];
      dayCounts[dayName]++;
    });

    // Convert to percentages
    Object.keys(dayCounts).forEach(day => {
      dayCounts[day] = (dayCounts[day] / totalEvents) * 100;
    });

    return dayCounts;
  }

  private calculateGeographicDistribution(events: AnalyticsEvent[]): Record<string, number> {
    const locationCounts: Record<string, number> = {};
    const totalEvents = events.length;

    events.forEach(event => {
      const location = event.location?.country || 'unknown';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    // Convert to percentages
    Object.keys(locationCounts).forEach(location => {
      locationCounts[location] = (locationCounts[location] / totalEvents) * 100;
    });

    return locationCounts;
  }

  private assessDataQuality(events: AnalyticsEvent[]): {
    completeness: number;
    accuracy: number;
    timeliness: number;
  } {
    if (events.length === 0) {
      return { completeness: 0, accuracy: 0, timeliness: 0 };
    }

    // Completeness: percentage of events with all required fields
    let completeEvents = 0;
    events.forEach(event => {
      if (event.type && event.timestamp && event.sessionId) {
        completeEvents++;
      }
    });
    const completeness = (completeEvents / events.length) * 100;

    // Accuracy: percentage of events with valid timestamps and reasonable values
    let accurateEvents = 0;
    events.forEach(event => {
      if (AnalyticsUtils.isValidTimestamp(event.timestamp) && 
          !AnalyticsUtils.isBotTraffic(event)) {
        accurateEvents++;
      }
    });
    const accuracy = (accurateEvents / events.length) * 100;

    // Timeliness: percentage of events from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let timelyEvents = 0;
    events.forEach(event => {
      if (new Date(event.timestamp) >= thirtyDaysAgo) {
        timelyEvents++;
      }
    });
    const timeliness = (timelyEvents / events.length) * 100;

    return {
      completeness: Math.round(completeness),
      accuracy: Math.round(accuracy),
      timeliness: Math.round(timeliness)
    };
  }
}