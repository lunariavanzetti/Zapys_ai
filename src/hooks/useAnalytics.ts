import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AnalyticsResponse,
  AnalyticsFilter,
  AnalyticsAlert,
  AnalyticsSummary,
  AnalyticsInsight,
  AnalyticsRecommendation,
  AnalyticsMetrics
} from '../types/analytics';
import analyticsService from '../services/analyticsService';

// Hook for general analytics data
export const useAnalytics = (filter?: AnalyticsFilter) => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getDashboardData(filter);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

// Hook for proposal-specific analytics
export const useProposalAnalytics = (proposalId: string, timeframe?: { start: string; end: string }) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AnalyticsRecommendation[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposalData = useCallback(async () => {
    if (!proposalId) return;

    try {
      setLoading(true);
      setError(null);

      const filter: AnalyticsFilter = {
        proposalIds: [proposalId],
        dateRange: timeframe ? {
          start: new Date(timeframe.start),
          end: new Date(timeframe.end)
        } : undefined
      };

      const [summaryResponse, insightsResponse, recommendationsResponse, metricsResponse] = await Promise.all([
        analyticsService.getProposalAnalytics(proposalId, timeframe),
        analyticsService.getInsights(filter),
        analyticsService.getRecommendations(filter),
        analyticsService.getDashboardData(filter)
      ]);

      setSummary(summaryResponse.analytics.summary || null);
      setInsights(insightsResponse.analytics.insights || []);
      setRecommendations(recommendationsResponse.analytics.recommendations || []);
      setMetrics(metricsResponse.analytics.metrics || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proposal analytics');
    } finally {
      setLoading(false);
    }
  }, [proposalId, timeframe]);

  useEffect(() => {
    fetchProposalData();
  }, [fetchProposalData]);

  return {
    summary,
    insights,
    recommendations,
    metrics,
    loading,
    error,
    refetch: fetchProposalData
  };
};

// Hook for real-time analytics tracking
export const useAnalyticsTracking = (proposalId: string) => {
  const [isTracking, setIsTracking] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [visitorId, setVisitorId] = useState<string>('');
  const startTimeRef = useRef<number>(Date.now());
  const lastScrollDepthRef = useRef<number>(0);
  const trackingRef = useRef<any>(null);

  // Initialize tracking
  useEffect(() => {
    if (!proposalId) return;

    const tracking = analyticsService.initializeTracking(proposalId);
    trackingRef.current = tracking;
    setSessionId(tracking.sessionId);
    setVisitorId(tracking.visitorId);
    
    // Track initial view
    tracking.trackView();
    setIsTracking(true);

    return () => {
      // Track exit when component unmounts
      if (trackingRef.current) {
        const timeOnPage = (Date.now() - startTimeRef.current) / 1000;
        trackingRef.current.trackExit(undefined, timeOnPage);
      }
      setIsTracking(false);
    };
  }, [proposalId]);

  // Scroll tracking
  useEffect(() => {
    if (!isTracking || !trackingRef.current) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

      // Only track if scroll depth increased significantly
      if (scrollDepth > lastScrollDepthRef.current + 5) {
        lastScrollDepthRef.current = scrollDepth;
        trackingRef.current.trackScroll(scrollDepth);
      }
    };

    const throttledScroll = throttle(handleScroll, 1000); // Throttle to once per second
    window.addEventListener('scroll', throttledScroll);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [isTracking]);

  // Visibility change tracking (tab switching, etc.)
  useEffect(() => {
    if (!isTracking || !trackingRef.current) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const timeOnPage = (Date.now() - startTimeRef.current) / 1000;
        trackingRef.current.trackExit('visibility-change', timeOnPage);
      } else {
        // Reset start time when returning to tab
        startTimeRef.current = Date.now();
        trackingRef.current.trackView();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTracking]);

  const trackClick = useCallback((section: string, element: string, metadata?: Record<string, any>) => {
    if (trackingRef.current) {
      trackingRef.current.trackClick(section, element);
    }
  }, []);

  const trackDownload = useCallback((type: string = 'pdf') => {
    if (trackingRef.current) {
      trackingRef.current.trackDownload(type);
    }
  }, []);

  const trackSignature = useCallback(() => {
    if (trackingRef.current) {
      trackingRef.current.trackSignature();
    }
  }, []);

  const trackCustomEvent = useCallback(async (eventType: string, metadata?: Record<string, any>) => {
    if (!isTracking) return;

    await analyticsService.trackEvent({
      type: eventType as any, // Cast to allow custom event types
      proposalId,
      sessionId,
      visitorId,
      metadata
    });
  }, [isTracking, proposalId, sessionId, visitorId]);

  return {
    isTracking,
    sessionId,
    visitorId,
    trackClick,
    trackDownload,
    trackSignature,
    trackCustomEvent
  };
};

// Hook for real-time metrics
export const useRealTimeMetrics = (proposalId: string, refreshInterval: number = 30000) => {
  const [metrics, setMetrics] = useState<{
    currentViewers: number;
    totalViews: number;
    avgTimeOnPage: number;
    conversionRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!proposalId) return;

    const fetchMetrics = async () => {
      try {
        const data = await analyticsService.getRealTimeMetrics(proposalId);
        setMetrics(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch real-time metrics:', err);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchMetrics();

    // Set up interval for real-time updates
    const interval = setInterval(fetchMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [proposalId, refreshInterval]);

  return { metrics, loading };
};

// Hook for analytics alerts
export const useAnalyticsAlerts = () => {
  const [alerts, setAlerts] = useState<AnalyticsAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const alertsData = await analyticsService.getAlerts();
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      await analyticsService.dismissAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    
    // Set up periodic refresh for alerts
    const interval = setInterval(fetchAlerts, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    dismissAlert,
    refetch: fetchAlerts
  };
};

// Hook for analytics insights with filtering and sorting
export const useAnalyticsInsights = (filter?: AnalyticsFilter) => {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getInsights(filter);
      setInsights(response.analytics.insights || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getInsightsByCategory = useCallback((category: AnalyticsInsight['category']) => {
    return insights.filter(insight => insight.category === category);
  }, [insights]);

  const getInsightsByImpact = useCallback((impact: AnalyticsInsight['impact']) => {
    return insights.filter(insight => insight.impact === impact);
  }, [insights]);

  const getActionableInsights = useCallback(() => {
    return insights.filter(insight => insight.actionable);
  }, [insights]);

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights,
    getInsightsByCategory,
    getInsightsByImpact,
    getActionableInsights
  };
};

// Hook for analytics recommendations
export const useAnalyticsRecommendations = (filter?: AnalyticsFilter) => {
  const [recommendations, setRecommendations] = useState<AnalyticsRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getRecommendations(filter);
      setRecommendations(response.analytics.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const getRecommendationsByPriority = useCallback((priority: AnalyticsRecommendation['priority']) => {
    return recommendations.filter(rec => rec.priority === priority);
  }, [recommendations]);

  const getRecommendationsByCategory = useCallback((category: AnalyticsRecommendation['category']) => {
    return recommendations.filter(rec => rec.category === category);
  }, [recommendations]);

  const getHighPriorityRecommendations = useCallback(() => {
    return recommendations.filter(rec => rec.priority === 'high');
  }, [recommendations]);

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
    getRecommendationsByPriority,
    getRecommendationsByCategory,
    getHighPriorityRecommendations
  };
};

// Hook for analytics export functionality
export const useAnalyticsExport = () => {
  const [exporting, setExporting] = useState(false);

  const exportData = useCallback(async (format: 'json' | 'csv', filter?: AnalyticsFilter) => {
    try {
      setExporting(true);
      const data = await analyticsService.exportData(format, filter);
      
      // Create and trigger download
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exportData,
    exporting
  };
};

// Hook for performance benchmarks
export const useBenchmarks = () => {
  const [benchmarks] = useState(() => analyticsService.getBenchmarks());

  const compareToBenchmark = useCallback((metric: string, value: number) => {
    const benchmark = benchmarks[metric];
    if (!benchmark) return null;

    const difference = ((value - benchmark) / benchmark) * 100;
    const performance = Math.abs(difference) < 5 ? 'at' : difference > 0 ? 'above' : 'below';

    return {
      benchmark,
      difference: Math.round(difference * 100) / 100,
      performance
    };
  }, [benchmarks]);

  return {
    benchmarks,
    compareToBenchmark
  };
};

// Utility function for throttling
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}