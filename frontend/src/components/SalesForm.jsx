import { useState, useEffect } from 'react';
import axios from 'axios';

function SalesForm({ onClose, onSuccess }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    sale_price: '',
    sale_date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/product/all');
        setProducts(response.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again.');
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_id) {
      newErrors.product_id = 'Please select a product';
    }

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(quantity) || quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    const salePrice = parseFloat(formData.sale_price);
    if (!formData.sale_price) {
      newErrors.sale_price = 'Sale price is required';
    } else if (isNaN(salePrice) || salePrice <= 0) {
      newErrors.sale_price = 'Sale price must be greater than 0';
    }

    if (!formData.sale_date) {
      newErrors.sale_date = 'Sale date is required';
    } else {
      const selectedDate = new Date(formData.sale_date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.sale_date = 'Sale date cannot be in the future';
      }
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
      const response = await axios.post('http://127.0.0.1:8000/sales/', {
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity),
        sale_price: parseFloat(formData.sale_price),
        sale_date: formData.sale_date
      });
      
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">💰 Record Sale</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Product Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Product *
            </label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.product_id 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-green-500'
              }`}
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.sell_price}
                </option>
              ))}
            </select>
            {errors.product_id && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.product_id}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.quantity 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-green-500'
              }`}
              placeholder="1"
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.quantity}</p>
            )}
          </div>

          {/* Sale Price */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Sale Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                step="0.01"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.sale_price 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-green-500'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.sale_price && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.sale_price}</p>
            )}
          </div>

          {/* Sale Date */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Sale Date *
            </label>
            <input
              type="date"
              name="sale_date"
              value={formData.sale_date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.sale_date 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-green-500'
              }`}
            />
            {errors.sale_date && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.sale_date}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recording...
                </span>
              ) : 'Record Sale'}
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

export default SalesForm;