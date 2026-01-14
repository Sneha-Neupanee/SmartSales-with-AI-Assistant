import { useState } from 'react';
import axios from 'axios';

function AIInsights({ dashboardData }) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAskAI = async () => {
    if (!dashboardData) {
      setError('No dashboard data available');
      return;
    }

    setLoading(true);
    setError('');
    setExplanation('');
    setShowExplanation(true);

    try {
      // Prepare stats for AI analysis
      const stats = {
        date_range: dashboardData.date_range,
        total_sales: dashboardData.metrics.total_sales,
        total_profit_or_loss: dashboardData.metrics.total_profit_or_loss,
        product_wise_sales: dashboardData.metrics.product_wise_sales,
        total_products_sold: dashboardData.metrics.product_wise_sales.reduce(
          (sum, item) => sum + item.quantity_sold, 0
        )
      };

      const response = await axios.post('http://127.0.0.1:8000/insights/explain', {
        stats: stats
      });

      if (response.data.status === 'success') {
        setExplanation(response.data.explanation);
      } else {
        setError('Failed to generate AI insights');
      }
    } catch (err) {
      console.error('AI Insights Error:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to generate AI insights. Please check your OpenAI API key in .env file.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">🤖 AI Business Analyst</h2>
          <p className="text-sm text-gray-600">Get AI-powered insights about your business performance</p>
        </div>
        <button
          onClick={handleAskAI}
          disabled={loading || !dashboardData}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            '✨ Ask AI for Insights'
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
            <p className="text-gray-600 font-medium">AI is analyzing your business data...</p>
            <p className="text-sm text-gray-500">This may take a few seconds</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-1">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
              {error.includes('API key') && (
                <div className="mt-3 bg-red-100 rounded p-3 text-xs">
                  <p className="font-semibold mb-1">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-red-800">
                    <li>Create a <code className="bg-red-200 px-1 rounded">.env</code> file in your project root</li>
                    <li>Add: <code className="bg-red-200 px-1 rounded">OPENAI_API_KEY=your-key-here</code></li>
                    <li>Get your key from: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a></li>
                    <li>Restart your backend server</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Explanation */}
      {explanation && !loading && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🤖</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-3 text-purple-900">AI Analysis & Recommendations</h3>
              <div className="prose prose-sm max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {explanation}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span>⚡</span>
                  <span>Powered by OpenAI GPT-4o-mini</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!showExplanation && !loading && !error && (
        <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Ready to Get AI-Powered Insights?
          </h3>
          <p className="text-gray-600 text-sm">
            Click the button above to get personalized business recommendations based on your data
          </p>
        </div>
      )}
    </div>
  );
}

export default AIInsights;