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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(30, 58, 138, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(30, 58, 138, 0.5);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        
        .matte-navy {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%);
          position: relative;
        }
        
        .matte-navy::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%);
          pointer-events: none;
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
        }
        
        .btn-navy {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .btn-navy::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .btn-navy:hover::before {
          width: 300px;
          height: 300px;
        }
        
        .input-focus {
          transition: all 0.3s ease;
          border: 1px solid #cbd5e1;
        }
        
        .input-focus:focus {
          outline: none;
          border-color: #1e40af;
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
          transform: translateY(-1px);
        }
        
        .table-row-hover {
          transition: all 0.2s ease;
        }
        
        .table-row-hover:hover {
          background: linear-gradient(90deg, rgba(30, 64, 175, 0.04) 0%, rgba(30, 64, 175, 0.08) 50%, rgba(30, 64, 175, 0.04) 100%);
          transform: translateX(4px);
        }
        
        .stat-card {
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%);
          transform: rotate(45deg);
          transition: all 0.5s;
        }
        
        .stat-card:hover::after {
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fadeInUp">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-800 to-slate-800 mb-2" style={{ letterSpacing: '-0.02em' }}>
            Dashboard Analytics
          </h1>
          <div className="h-1.5 w-24 bg-gradient-to-r from-blue-800 to-blue-600 rounded-full"></div>
        </div>

        {/* Date Range Filter */}
        <div className="glass-morphism rounded-2xl shadow-xl p-6 mb-8 animate-fadeInUp stagger-1 border-l-4 border-blue-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl matte-navy flex items-center justify-center">
              <span className="text-xl">📅</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Date Range Filter</h2>
          </div>
          
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-slate-700 text-sm font-semibold mb-2 tracking-wide">
                Start Date
              </label>
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="w-full px-4 py-3 border rounded-xl input-focus bg-white/80 text-slate-800 font-medium"
              />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-slate-700 text-sm font-semibold mb-2 tracking-wide">
                End Date
              </label>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="w-full px-4 py-3 border rounded-xl input-focus bg-white/80 text-slate-800 font-medium"
              />
            </div>
            
            <button
              onClick={handleFilter}
              className="btn-navy text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all relative z-10 hover-lift"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Apply Filter
              </span>
            </button>
            
            <button
              onClick={exportToCSV}
              disabled={!dashboardData}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg hover-lift disabled:transform-none border border-emerald-500/30"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="glass-morphism rounded-2xl px-6 py-4 mb-6 border-l-4 border-red-500 shadow-lg animate-fadeInUp">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-red-700">Error</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fadeInUp">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-800 border-t-transparent absolute top-0"></div>
            </div>
            <p className="mt-6 text-slate-600 font-medium text-lg">Loading analytics...</p>
          </div>
        ) : dashboardData ? (
          <>
            {/* AI Insights Component */}
            <div className="animate-fadeInUp stagger-2">
              <AIInsights dashboardData={dashboardData} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeInUp stagger-3">
              {/* Total Sales Card */}
              <div className="stat-card matte-navy rounded-2xl shadow-2xl p-6 text-white hover-lift border border-blue-700/30">
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-90">Total Sales</h3>
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-3 relative z-10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ${dashboardData.metrics.total_sales.toFixed(2)}
                </p>
                <div className="flex items-center gap-2 text-sm opacity-80 relative z-10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{dashboardData.date_range.start} to {dashboardData.date_range.end}</span>
                </div>
              </div>

              {/* Total Profit Card */}
              <div className={`stat-card ${
                dashboardData.metrics.total_profit_or_loss >= 0
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
                  : 'bg-gradient-to-br from-rose-600 to-rose-700'
              } rounded-2xl shadow-2xl p-6 text-white hover-lift border ${
                dashboardData.metrics.total_profit_or_loss >= 0
                  ? 'border-emerald-500/30'
                  : 'border-rose-500/30'
              }`}>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-90">
                    Total Profit/Loss
                  </h3>
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-3 relative z-10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ${dashboardData.metrics.total_profit_or_loss.toFixed(2)}
                </p>
                <div className="flex items-center gap-2 text-sm opacity-90 relative z-10">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm font-semibold">
                    {dashboardData.metrics.total_profit_or_loss >= 0 ? '📈 Profit' : '📉 Loss'}
                  </span>
                </div>
              </div>

              {/* Products Sold Card */}
              <div className="stat-card bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl shadow-2xl p-6 text-white hover-lift border border-violet-500/30">
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-90">Products Sold</h3>
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-3 relative z-10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {dashboardData.metrics.product_wise_sales.reduce(
                    (sum, item) => sum + item.quantity_sold,
                    0
                  )}
                </p>
                <div className="flex items-center gap-2 text-sm opacity-80 relative z-10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Total units</span>
                </div>
              </div>
            </div>

            {/* Product-wise Sales Table */}
            <div className="glass-morphism rounded-2xl shadow-xl p-6 mb-8 border-l-4 border-blue-800 animate-fadeInUp stagger-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl matte-navy flex items-center justify-center">
                  <span className="text-xl">📦</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Product-wise Sales Summary</h2>
              </div>

              {dashboardData.metrics.product_wise_sales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-4 px-6 font-bold text-slate-700 text-sm uppercase tracking-wider bg-slate-50/50 rounded-tl-xl">
                          Product Name
                        </th>
                        <th className="text-right py-4 px-6 font-bold text-slate-700 text-sm uppercase tracking-wider bg-slate-50/50 rounded-tr-xl">
                          Quantity Sold
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.metrics.product_wise_sales.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 table-row-hover"
                        >
                          <td className="py-4 px-6 font-medium text-slate-700">{item.product}</td>
                          <td className="py-4 px-6 text-right font-bold text-slate-800" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {item.quantity_sold}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 bg-gradient-to-r from-blue-50 to-slate-50">
                        <td className="py-4 px-6 font-bold text-slate-800 rounded-bl-xl">Total</td>
                        <td className="py-4 px-6 text-right font-bold text-blue-900 text-lg rounded-br-xl" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {dashboardData.metrics.product_wise_sales.reduce(
                            (sum, item) => sum + item.quantity_sold,
                            0
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-slate-500 font-medium">No sales data for the selected date range</p>
                </div>
              )}
            </div>

            {/* Charts */}
            <Charts dashboardData={dashboardData} productStats={productStats} />

            {/* Insights */}
            <Insights dateRange={dateRange} />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default Dashboard;