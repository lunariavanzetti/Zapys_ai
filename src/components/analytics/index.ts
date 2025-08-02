// Analytics Components
export { AnalyticsDashboard } from './AnalyticsDashboard';
export { AnalyticsTracker, withAnalyticsTracking, useManualTracking } from './AnalyticsTracker';
export { RealTimeMetrics } from './RealTimeMetrics';

// Re-export hooks for convenience
export {
  useAnalytics,
  useProposalAnalytics,
  useAnalyticsTracking,
  useRealTimeMetrics,
  useAnalyticsAlerts,
  useAnalyticsInsights,
  useAnalyticsRecommendations,
  useAnalyticsExport,
  useBenchmarks
} from '../../hooks/useAnalytics';

// Re-export types for convenience
export type {
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
  ProposalPerformance
} from '../../types/analytics';