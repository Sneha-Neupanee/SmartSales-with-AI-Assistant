import { useState, useEffect } from 'react';
import axios from 'axios';
import SalesForm from '../components/SalesForm';

function Sales() {
  const [showForm, setShowForm] = useState(false);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('sale_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortSales();
  }, [sales, searchTerm, sortField, sortOrder, dateFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [salesRes, productsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/sales/'),
        axios.get('http://127.0.0.1:8000/product/all')
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError('Failed to load sales data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSales = () => {
    let filtered = [...sales];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sale => {
        const productName = getProductName(sale.product_id).toLowerCase();
        return productName.includes(searchTerm.toLowerCase()) ||
               sale.sale_date.includes(searchTerm);
      });
    }

    // Apply date filter
    const today = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        const diffTime = today - saleDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch(dateFilter) {
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'product_id') {
        aVal = getProductName(a.product_id);
        bVal = getProductName(b.product_id);
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredSales(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSuccess = (newSale) => {
    setSales([...sales, newSale]);
    setSuccessMessage('Sale recorded successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return sortOrder === 'asc' ? <span className="text-green-600">↑</span> : <span className="text-green-600">↓</span>;
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Product', 'Quantity', 'Price', 'Total', 'Date'],
      ...filteredSales.map(sale => [
        getProductName(sale.product_id),
        sale.quantity,
        sale.sale_price,
        (sale.sale_price * sale.quantity).toFixed(2),
        sale.sale_date
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">💰 Sales</h1>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={exportToCSV}
            disabled={filteredSales.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📥 Export CSV
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105"
          >
            + Record Sale
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4 shadow-md">
          <p className="font-bold">Success!</p>
          <p>{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filter Bar */}
      {!loading && sales.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="🔍 Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="min-w-[200px]">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">Showing:</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                {filteredSales.length} / {sales.length}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4"></div>
            <p className="text-gray-500">Loading sales...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg mb-4">No sales recorded yet</p>
            <p className="text-gray-400 mb-6">Start by recording your first sale!</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105"
            >
              + Record Your First Sale
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th 
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('product_id')}
                    >
                      <div className="flex items-center gap-2">
                        Product {getSortIcon('product_id')}
                      </div>
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('quantity')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Quantity {getSortIcon('quantity')}
                      </div>
                    </th>
                    <th 
                      className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('sale_price')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Price {getSortIcon('sale_price')}
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Total
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('sale_date')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Date {getSortIcon('sale_date')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map(sale => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-green-50 transition">
                      <td className="py-3 px-4 font-medium">{getProductName(sale.product_id)}</td>
                      <td className="py-3 px-4 text-center">{sale.quantity}</td>
                      <td className="py-3 px-4 text-right">${sale.sale_price}</td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">
                        ${(sale.sale_price * sale.quantity).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">{sale.sale_date}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 font-bold bg-gray-50">
                    <td className="py-3 px-4" colSpan="3">Total Revenue</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      ${filteredSales.reduce((sum, sale) => sum + (sale.sale_price * sale.quantity), 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {filteredSales.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No sales match your search criteria</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('all');
                  }}
                  className="mt-4 text-green-500 hover:text-green-600 font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <SalesForm 
          onClose={() => setShowForm(false)} 
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

export default Sales;