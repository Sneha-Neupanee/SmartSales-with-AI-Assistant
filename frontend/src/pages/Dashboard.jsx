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
    <div className="min-h-screen bg-gradient-to-br from-[#0b132b] via-[#0f1c3f] to-[#0b132b] text-gray-200">
      <div className="container mx-auto px-6 py-10">

        <h1 className="text-4xl font-semibold mb-10 tracking-wide text-white">
          Dashboard Analytics
        </h1>

        {/* Date Range Filter */}
        <div className="bg-[#111b3c]/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-8 border border-white/10">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">
            Date Filters
          </h2>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-400 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="w-full bg-[#0b132b] text-gray-200 px-4 py-2 rounded-lg border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-400 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="w-full bg-[#0b132b] text-gray-200 px-4 py-2 rounded-lg border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              onClick={handleFilter}
              className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg font-medium shadow-lg transition"
            >
              Apply
            </button>

            <button
              onClick={exportToCSV}
              disabled={!dashboardData}
              className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium shadow-lg transition disabled:opacity-40"
            >
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-6 py-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-indigo-400"></div>
          </div>
        ) : dashboardData ? (
          <>
            <AIInsights dashboardData={dashboardData} />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

              <div className="bg-[#111b3c]/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Total Sales</p>
                <p className="text-4xl font-bold text-white">
                  ${dashboardData.metrics.total_sales.toFixed(2)}
                </p>
              </div>

              <div className="bg-[#111b3c]/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Profit / Loss</p>
                <p className={`text-4xl font-bold ${
                  dashboardData.metrics.total_profit_or_loss >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}>
                  ${dashboardData.metrics.total_profit_or_loss.toFixed(2)}
                </p>
              </div>

              <div className="bg-[#111b3c]/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Units Sold</p>
                <p className="text-4xl font-bold text-white">
                  {dashboardData.metrics.product_wise_sales.reduce(
                    (sum, item) => sum + item.quantity_sold, 0
                  )}
                </p>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-[#111b3c]/90 backdrop-blur-xl rounded-2xl p-6 mb-10 border border-white/10">
              <h2 className="text-lg font-semibold mb-4 text-white">
                Product-wise Sales
              </h2>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-3">Product</th>
                    <th className="py-3 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.metrics.product_wise_sales.map((item, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-3">{item.product}</td>
                      <td className="py-3 text-right">{item.quantity_sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Charts dashboardData={dashboardData} productStats={productStats} />
            <Insights dateRange={dateRange} />
          </>
        ) : null}

      </div>
    </div>
  );
}

export default Dashboard;
