import { useState, useEffect } from 'react';
import axios from 'axios';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, critical, warning, info, success

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://127.0.0.1:8000/alerts/');
      if (response.data.status === 'success') {
        setAlerts(response.data.alerts);
        setSummary(response.data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '📢';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return '📦';
      case 'profit_drop':
        return '📉';
      case 'profit_increase':
        return '📈';
      case 'sales_spike':
        return '🚀';
      case 'sales_drop':
        return '📉';
      case 'high_expense':
        return '💰';
      default:
        return '🔔';
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🔔 Business Alerts</h1>
        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Alert Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div 
            onClick={() => setFilter('critical')}
            className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-transform hover:scale-105 ${filter === 'critical' ? 'ring-2 ring-red-500' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{summary.critical}</p>
              </div>
              <span className="text-3xl">🚨</span>
            </div>
          </div>

          <div 
            onClick={() => setFilter('warning')}
            className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-transform hover:scale-105 ${filter === 'warning' ? 'ring-2 ring-yellow-500' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.warning}</p>
              </div>
              <span className="text-3xl">⚠️</span>
            </div>
          </div>

          <div 
            onClick={() => setFilter('info')}
            className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-transform hover:scale-105 ${filter === 'info' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Info</p>
                <p className="text-2xl font-bold text-blue-600">{summary.info}</p>
              </div>
              <span className="text-3xl">ℹ️</span>
            </div>
          </div>

          <div 
            onClick={() => setFilter('success')}
            className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-transform hover:scale-105 ${filter === 'success' ? 'ring-2 ring-green-500' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Good News</p>
                <p className="text-2xl font-bold text-green-600">{summary.success}</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            filter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            filter === 'critical' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Critical ({summary?.critical || 0})
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            filter === 'warning' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Warning ({summary?.warning || 0})
        </button>
        <button
          onClick={() => setFilter('success')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            filter === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Good News ({summary?.success || 0})
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alerts...</p>
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="space-y-4">
          {filteredAlerts.map((alert, index) => (
            <div
              key={index}
              className={`border rounded-lg p-5 shadow-md transition-all hover:shadow-lg ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">
                  {getTypeIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                    <span className="px-3 py-1 bg-white bg-opacity-70 rounded-full text-xs font-bold uppercase">
                      {alert.severity}
                    </span>
                    <span className="px-3 py-1 bg-white bg-opacity-70 rounded-full text-xs font-semibold">
                      {alert.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-lg font-semibold mb-3">{alert.message}</p>
                  
                  {/* Alert Details */}
                  {alert.details && (
                    <div className="bg-white bg-opacity-50 rounded-lg p-3 mt-3">
                      <p className="text-xs font-semibold mb-2 opacity-75">Details:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {Object.entries(alert.details).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs opacity-75 capitalize">
                              {key.replace('_', ' ')}
                            </p>
                            <p className="font-semibold">
                              {typeof value === 'number' ? value.toFixed(2) : value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product-specific info */}
                  {alert.product_name && (
                    <div className="mt-2 text-sm opacity-90">
                      <strong>Product:</strong> {alert.product_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No {filter !== 'all' ? filter : ''} Alerts
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "Everything looks good! No alerts to show."
              : `No ${filter} alerts at the moment.`}
          </p>
        </div>
      )}
    </div>
  );
}

export default Alerts;