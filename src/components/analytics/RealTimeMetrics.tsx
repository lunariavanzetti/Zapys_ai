import React from 'react';
import { Eye, Users, Clock, TrendingUp, Activity } from 'lucide-react';
import { useRealTimeMetrics } from '../../hooks/useAnalytics';

interface RealTimeMetricsProps {
  proposalId: string;
  refreshInterval?: number;
  compact?: boolean;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  proposalId,
  refreshInterval = 30000,
  compact = false
}) => {
  const { metrics, loading } = useRealTimeMetrics(proposalId, refreshInterval);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${compact ? 'space-y-2' : 'space-y-4'}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No real-time data available</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Live Metrics</h3>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{metrics.currentViewers}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{metrics.conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Convert</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Real-Time Metrics</h3>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm text-gray-500">Updates every {refreshInterval / 1000}s</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RealTimeMetricCard
          title="Current Viewers"
          value={metrics.currentViewers}
          icon={<Users className="h-5 w-5" />}
          color="blue"
          subtitle="Active now"
        />
        <RealTimeMetricCard
          title="Total Views"
          value={metrics.totalViews}
          icon={<Eye className="h-5 w-5" />}
          color="green"
          subtitle="All time"
        />
        <RealTimeMetricCard
          title="Avg. Time"
          value={`${Math.round(metrics.avgTimeOnPage / 60)}m`}
          icon={<Clock className="h-5 w-5" />}
          color="yellow"
          subtitle="On page"
        />
        <RealTimeMetricCard
          title="Conversion"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="purple"
          subtitle="Rate"
        />
      </div>

      {metrics.currentViewers > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {metrics.currentViewers === 1 
                  ? '1 person is currently viewing this proposal'
                  : `${metrics.currentViewers} people are currently viewing this proposal`
                }
              </p>
              <p className="text-xs text-blue-700 mt-1">
                This is a great time to follow up or send additional information
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface RealTimeMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  subtitle?: string;
}

const RealTimeMetricCard: React.FC<RealTimeMetricCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};