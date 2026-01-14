import { useState } from 'react';
import axios from 'axios';

function ExpenseForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
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
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date = 'Expense date cannot be in the future';
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
      const response = await axios.post('http://127.0.0.1:8000/expenses/', {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        date: formData.date
      });
      
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">💸 Add Expense</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.description 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-red-500'
              }`}
              placeholder="e.g., Office supplies, Rent, Utilities"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.amount 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-red-500'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.amount}</p>
            )}
          </div>

          {/* Date */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.date 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-red-500'
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.date}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : 'Add Expense'}
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

export default ExpenseForm;