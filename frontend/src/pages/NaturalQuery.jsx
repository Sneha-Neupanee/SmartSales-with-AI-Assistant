import { useState } from 'react';
import axios from 'axios';

function NaturalQuery() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);

  // Example queries for suggestions
  const exampleQueries = [
    "Show me top selling products",
    "What's my profit this month?",
    "Show expenses this week",
    "How is my business performing?",
    "Which products are declining?",
    "Show me all products"
  ];

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setAiExplanation('');

    try {
      const response = await axios.post(`http://127.0.0.1:8000/insights/query?query=${encodeURIComponent(query)}`);
      
      if (response.data.status === 'success') {
        setResult(response.data);
      } else {
        setError('Failed to process query');
      }
    } catch (err) {
      console.error('Query Error:', err);
      setError(err.response?.data?.detail || 'Failed to process query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainWithAI = async () => {
    if (!result) return;

    setExplainLoading(true);
    setAiExplanation('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/insights/explain', {
        stats: result.data
      });

      if (response.data.status === 'success') {
        setAiExplanation(response.data.explanation);
      }
    } catch (err) {
      console.error('AI Explanation Error:', err);
      setAiExplanation('Failed to generate AI explanation. Please check your OpenAI API key.');
    } finally {
      setExplainLoading(false);
    }
  };

  const useExampleQuery = (example) => {
    setQuery(example);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">💬 Ask Your Business Questions</h1>
      
      {/* Query Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleQuery}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Ask a question about your business
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Show me top selling products this month"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Searching...
                  </span>
                ) : (
                  '🔍 Search'
                )}
              </button>
            </div>
          </div>

          {/* Example Queries */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => useExampleQuery(example)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{result.interpreted_as}</h2>
              <p className="text-sm text-gray-500">
                Date Range: {result.date_range.start} to {result.date_range.end}
              </p>
            </div>
            <button
              onClick={handleExplainWithAI}
              disabled={explainLoading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {explainLoading ? '🔄 Analyzing...' : '🤖 Explain with AI'}
            </button>
          </div>

          {/* Top Products */}
          {result.data.top_products && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-3">Top Selling Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Product</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-700">Quantity Sold</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-700">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.top_products.map((product, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 px-3">{product.name}</td>
                        <td className="py-2 px-3 text-right font-semibold">{product.quantity_sold}</td>
                        <td className="py-2 px-3 text-right text-green-600 font-semibold">${product.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          {result.data.financial_summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">${result.data.financial_summary.total_revenue}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                <p className="text-2xl font-bold text-red-600">${result.data.financial_summary.total_cost}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Profit</p>
                <p className="text-2xl font-bold text-green-600">${result.data.financial_summary.total_profit}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
                <p className="text-2xl font-bold text-purple-600">{result.data.financial_summary.profit_margin}%</p>
              </div>
            </div>
          )}

          {/* Performance */}
          {result.data.performance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Transactions</p>
                <p className="text-xl font-bold">{result.data.performance.total_transactions}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Items Sold</p>
                <p className="text-xl font-bold">{result.data.performance.total_items_sold}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Revenue</p>
                <p className="text-xl font-bold text-green-600">${result.data.performance.total_revenue}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Expenses</p>
                <p className="text-xl font-bold text-red-600">${result.data.performance.total_expenses}</p>
              </div>
            </div>
          )}

          {/* Expenses */}
          {result.data.expenses && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-3">
                Expenses (Total: ${result.data.expenses.total_expenses})
              </h3>
              <div className="space-y-2">
                {result.data.expenses.expense_list.map((expense, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-xs text-gray-500">{expense.date}</p>
                    </div>
                    <p className="font-bold text-red-600">${expense.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Performing Products */}
          {result.data.low_performing && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-3">Low Performing Products</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {result.data.low_performing.map((product, index) => (
                  <div key={index} className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-orange-600 font-bold">{product.quantity_sold} sold</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory */}
          {result.data.inventory && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-3">Product Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.data.inventory.map((product, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.category}</p>
                    <div className="flex justify-between mt-2 text-sm">
                      <span>Cost: ${product.cost_price}</span>
                      <span className="text-green-600">Sell: ${product.sell_price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          {result.data.message && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">{result.data.message}</p>
            </div>
          )}
        </div>
      )}

      {/* AI Explanation */}
      {aiExplanation && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🤖</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-3 text-purple-900">AI Analysis</h3>
              <div className="prose prose-sm max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {aiExplanation}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NaturalQuery;