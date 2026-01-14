import { useState, useEffect } from 'react';
import axios from 'axios';

function Insights({ dateRange }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [dateRange]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/insights/', {
        params: {
          start: dateRange.start,
          end: dateRange.end
        }
      });
      setInsights(response.data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Loading insights...</p>
      </div>
    );
  }

  if (!insights) return null;

  const getMessageColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Insight Messages */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">💡 Business Insights</h2>
        <div className="space-y-3">
          {insights.messages.map((msg, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 ${getMessageColor(msg.type)}`}
            >
              <p className="font-medium">{msg.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Products by Profit */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">🏆 Top 5 Products by Profit</h2>
          {insights.top_products_by_profit.length > 0 ? (
            <div className="space-y-3">
              {insights.top_products_by_profit.map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <span className="font-semibold">{product.product_name}</span>
                  </div>
                  <span className="text-green-600 font-bold">${product.profit.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No profit data available</p>
          )}
        </div>

        {/* Declining Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">⚠️ Declining Sales Products</h2>
          {insights.declining_products.length > 0 ? (
            <div className="space-y-3">
              {insights.declining_products.map((product) => (
                <div key={product.product_id} className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">{product.product_name}</span>
                    <span className="text-red-600 font-bold">-{product.decline_percentage}%</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.previous_quantity} → {product.current_quantity} units
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No declining products detected</p>
          )}
        </div>
      </div>

      {/* Average Profit Margin */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">💰 Average Profit Margin</h2>
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold ${
            insights.average_profit_margin >= 40 ? 'text-green-600' :
            insights.average_profit_margin >= 20 ? 'text-blue-600' :
            'text-red-600'
          }`}>
            {insights.average_profit_margin.toFixed(1)}%
          </div>
          <div className="text-gray-600">
            {insights.average_profit_margin >= 40 && '🎉 Excellent!'}
            {insights.average_profit_margin >= 20 && insights.average_profit_margin < 40 && '👍 Good'}
            {insights.average_profit_margin < 20 && '⚠️ Needs improvement'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Insights;