import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  Clock, 
  MousePointer,
  Download,
  FileSignature,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { useAnalytics, useAnalyticsAlerts, useBenchmarks } from '../../hooks/useAnalytics';
import { AnalyticsFilter } from '../../types/analytics';

interface AnalyticsDashboardProps {
  filter?: AnalyticsFilter;
  onFilterChange?: (filter: AnalyticsFilter) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  filter,
  onFilterChange
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  
  const { data, loading, error } = useAnalytics(filter);
  const { alerts } = useAnalyticsAlerts();
  const { benchmarks, compareToBenchmark } = useBenchmarks();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">Error loading analytics: {error}</span>
        </div>
      </div>
    );
  }

  const summary = data?.analytics?.summary;
  const insights = data?.analytics?.insights || [];
  const recommendations = data?.analytics?.recommendations || [];
  const metrics = data?.analytics?.metrics;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track proposal performance and optimize for better results</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="font-medium text-yellow-800">Active Alerts ({alerts.length})</h3>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="text-sm text-yellow-700">
                <span className="font-medium">{alert.title}:</span> {alert.description}
              </div>
            ))}
            {alerts.length > 3 && (
              <div className="text-sm text-yellow-600">
                +{alerts.length - 3} more alerts
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Views"
          value={summary?.totalViews || 0}
          icon={<Eye className="h-5 w-5" />}
          trend={12.5}
          benchmark={compareToBenchmark('totalViews', summary?.totalViews || 0)}
        />
        <MetricCard
          title="Unique Visitors"
          value={summary?.uniqueVisitors || 0}
          icon={<Users className="h-5 w-5" />}
          trend={8.3}
          benchmark={compareToBenchmark('uniqueVisitors', summary?.uniqueVisitors || 0)}
        />
        <MetricCard
          title="Avg. Time on Page"
          value={`${Math.round((summary?.avgTimeOnPage || 0) / 60)}m`}
          icon={<Clock className="h-5 w-5" />}
          trend={-5.2}
          benchmark={compareToBenchmark('avgTimeOnPage', summary?.avgTimeOnPage || 0)}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${(summary?.conversionRate || 0).toFixed(1)}%`}
          icon={<FileSignature className="h-5 w-5" />}
          trend={15.7}
          benchmark={compareToBenchmark('conversionRate', summary?.conversionRate || 0)}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Views Over Time</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics?.engagement?.viewsOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
              <Line 
                type="monotone" 
                dataKey="uniqueVisitors" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics?.conversion?.funnelSteps || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Device Breakdown</h3>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(metrics?.behavioral?.deviceBreakdown || {}).map(([device, percentage]) => ({
                  name: device,
                  value: percentage
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(metrics?.behavioral?.deviceBreakdown || {}).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Scroll Heatmap */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Section Engagement</h3>
            <MousePointer className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics?.engagement?.scrollHeatmap || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="section" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgDepth" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-4">
            {insights.slice(0, 5).map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                  insight.type === 'positive' ? 'bg-green-500' :
                  insight.type === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.impact} impact
                    </span>
                    {insight.actionable && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Actionable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-4">
            {recommendations.slice(0, 5).map((rec, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {rec.priority} priority
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                <div className="text-xs text-gray-500">
                  <div>Expected Impact: {rec.expectedImpact}</div>
                  <div>Effort: {rec.estimatedEffort} • Timeline: {rec.expectedTimeframe}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Proposals */}
      {summary?.topPerformingProposals && summary.topPerformingProposals.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Proposals</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proposal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scroll Depth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.topPerformingProposals.map((proposal) => (
                  <tr key={proposal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {proposal.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proposal.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proposal.conversionRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.round(proposal.avgTimeOnPage / 60)}m
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proposal.avgScrollDepth.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  benchmark?: {
    benchmark: number;
    difference: number;
    performance: 'above' | 'at' | 'below';
  } | null;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, benchmark }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
            <div className="text-blue-600">{icon}</div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        {trend !== undefined && (
          <div className="flex items-center">
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
        
        {benchmark && (
          <div className="flex items-center">
            {benchmark.performance === 'above' ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            ) : benchmark.performance === 'below' ? (
              <XCircle className="h-4 w-4 text-red-500 mr-1" />
            ) : (
              <div className="h-4 w-4 bg-gray-400 rounded-full mr-1" />
            )}
            <span className="text-xs text-gray-500">
              vs benchmark
            </span>
          </div>
        )}
      </div>
    </div>
  );
};