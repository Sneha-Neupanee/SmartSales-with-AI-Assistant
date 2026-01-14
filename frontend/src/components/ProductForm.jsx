import { useState } from 'react';
import axios from 'axios';

function ProductForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cost_price: '',
    sell_price: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Product name must be at least 2 characters';
    }

    // Validate category
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    // Validate cost price
    const costPrice = parseFloat(formData.cost_price);
    if (!formData.cost_price) {
      newErrors.cost_price = 'Cost price is required';
    } else if (isNaN(costPrice) || costPrice <= 0) {
      newErrors.cost_price = 'Cost price must be greater than 0';
    }

    // Validate sell price
    const sellPrice = parseFloat(formData.sell_price);
    if (!formData.sell_price) {
      newErrors.sell_price = 'Selling price is required';
    } else if (isNaN(sellPrice) || sellPrice <= 0) {
      newErrors.sell_price = 'Selling price must be greater than 0';
    } else if (sellPrice < costPrice) {
      newErrors.sell_price = 'Selling price should be greater than cost price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/product/', {
        name: formData.name.trim(),
        category: formData.category.trim(),
        cost_price: parseFloat(formData.cost_price),
        sell_price: parseFloat(formData.sell_price)
      });
      
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📦 Add Product</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="e.g., iPhone 15 Pro"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Category *
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.category 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="e.g., Electronics"
            />
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.category}</p>
            )}
          </div>

          {/* Cost Price */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Cost Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                step="0.01"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.cost_price 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.cost_price && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.cost_price}</p>
            )}
          </div>

          {/* Selling Price */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Selling Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                name="sell_price"
                value={formData.sell_price}
                onChange={handleChange}
                step="0.01"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.sell_price 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.sell_price && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.sell_price}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;