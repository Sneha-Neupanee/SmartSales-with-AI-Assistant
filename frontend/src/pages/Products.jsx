import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductForm from '../components/ProductForm';

function Products() {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortField, sortOrder, categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://127.0.0.1:8000/product/all');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

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

    setFilteredProducts(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSuccess = (newProduct) => {
    setProducts([...products, newProduct]);
    setSuccessMessage('Product added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getUniqueCategories = () => {
    return [...new Set(products.map(p => p.category))];
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return sortOrder === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">📦 Products</h1>
        <div className="flex gap-3">
          <button 
            onClick={fetchProducts}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105"
          >
            + Add Product
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
      {!loading && products.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="min-w-[200px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">Showing:</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                {filteredProducts.length} / {products.length}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500 text-lg mb-4">No products yet</p>
            <p className="text-gray-400 mb-6">Click "Add Product" to get started!</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105"
            >
              + Add Your First Product
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
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Product Name {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-2">
                        Category {getSortIcon('category')}
                      </div>
                    </th>
                    <th 
                      className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('cost_price')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Cost Price {getSortIcon('cost_price')}
                      </div>
                    </th>
                    <th 
                      className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('sell_price')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Sell Price {getSortIcon('sell_price')}
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Profit Margin
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                      <td className="py-3 px-4 font-medium">{product.name}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">${product.cost_price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">${product.sell_price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-600">
                        {((product.sell_price - product.cost_price) / product.sell_price * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No products match your search criteria</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                  }}
                  className="mt-4 text-blue-500 hover:text-blue-600 font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <ProductForm 
          onClose={() => setShowForm(false)} 
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

export default Products;