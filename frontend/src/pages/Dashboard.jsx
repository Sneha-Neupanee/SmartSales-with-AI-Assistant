import { useState, useEffect } from 'react';
import axios from 'axios';
import Charts from '../components/Charts';
import Insights from '../components/Insights';
import AIInsights from '../components/AIInsights';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: new Date().toISOString().split('T')[0]
  });

  const fetchProductStats = async (productId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/product/${productId}/stats`, {
        params: {
          start: dateRange.start,
          end: dateRange.end
        }
      });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch product stats:', err);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://127.0.0.1:8000/dashboard/', {
        params: {
          start: dateRange.start,
          end: dateRange.end
        }
      });
      setDashboardData(response.data);

      if (response.data.metrics.product_wise_sales.length > 0) {
        const stats = await fetchProductStats(1);
        setProductStats(stats);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const handleFilter = () => {
    fetchDashboardData();
  };

  const exportToCSV = () => {
    if (!dashboardData) return;

    const csvContent = [
      ['Product', 'Quantity Sold'],
      ...dashboardData.metrics.product_wise_sales.map(item => [
        item.product,
        item.quantity_sold
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">📊 Dashboard</h1>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-700">📅 Date Range Filter</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              End Date
            </label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <button
            onClick={handleFilter}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            Apply Filter
          </button>
          <button
            onClick={exportToCSV}
            disabled={!dashboardData}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
        </div>
      ) : dashboardData ? (
        <>
          {/* AI Insights Component */}
          <AIInsights dashboardData={dashboardData} />

          {/* Summary Cards - POLISHED VERSION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Sales Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Total Sales</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold mb-2">
                ${dashboardData.metrics.total_sales.toFixed(2)}
              </p>
              <p className="text-sm opacity-80">
                {dashboardData.date_range.start} to {dashboardData.date_range.end}
              </p>
            </div>
            
            {/* Total Profit Card */}
            <div className={`${
              dashboardData.metrics.total_profit_or_loss >= 0 
                ? 'bg-gradient-to-br from-green-500 to-green-600' 
                : 'bg-gradient-to-br from-red-500 to-red-600'
            } rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">
                  Total Profit/Loss
                </h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-4xl font-bold mb-2">
                ${dashboardData.metrics.total_profit_or_loss.toFixed(2)}
              </p>
              <p className="text-sm opacity-80">
                {dashboardData.metrics.total_profit_or_loss >= 0 ? 'Profit 📈' : 'Loss 📉'}
              </p>
            </div>
            
            {/* Products Sold Card */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Products Sold</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-4xl font-bold mb-2">
                {dashboardData.metrics.product_wise_sales.reduce(
                  (sum, item) => sum + item.quantity_sold, 0
                )}
              </p>
              <p className="text-sm opacity-80">Total units</p>
            </div>
          </div>

          {/* Product-wise Sales Table */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-700">📦 Product-wise Sales Summary</h2>
            {dashboardData.metrics.product_wise_sales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Product Name</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.metrics.product_wise_sales.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-blue-50 transition">
                        <td className="py-3 px-4">{item.product}</td>
                        <td className="py-3 px-4 text-right font-semibold">{item.quantity_sold}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 font-bold bg-gray-50">
                      <td className="py-3 px-4">Total</td>
                      <td className="py-3 px-4 text-right">
                        {dashboardData.metrics.product_wise_sales.reduce(
                          (sum, item) => sum + item.quantity_sold, 0
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No sales data for the selected date range</p>
            )}
          </div>

          {/* Charts */}
          <Charts dashboardData={dashboardData} productStats={productStats} />

          {/* Insights */}
          <Insights dateRange={dateRange} />
        </>
      ) : null}
    </div>
  );
}

export default Dashboard;