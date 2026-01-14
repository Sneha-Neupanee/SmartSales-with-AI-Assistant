import { useState, useEffect } from 'react';
import axios from 'axios';
import ExpenseForm from '../components/ExpenseForm';

function Expenses() {
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    filterAndSortExpenses();
  }, [expenses, searchTerm, sortField, sortOrder, dateFilter]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://127.0.0.1:8000/expenses/');
      setExpenses(response.data);
    } catch (err) {
      setError('Failed to load expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortExpenses = () => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.date.includes(searchTerm)
      );
    }

    // Apply date filter
    const today = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        const diffTime = today - expenseDate;
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

    setFilteredExpenses(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSuccess = (newExpense) => {
    setExpenses([...expenses, newExpense]);
    setSuccessMessage('Expense added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return sortOrder === 'asc' ? <span className="text-red-600">↑</span> : <span className="text-red-600">↓</span>;
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Description', 'Amount', 'Date'],
      ...filteredExpenses.map(expense => [
        expense.description,
        expense.amount,
        expense.date
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">💸 Expenses</h1>
        <div className="flex gap-3">
          <button 
            onClick={fetchExpenses}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={exportToCSV}
            disabled={filteredExpenses.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📥 Export CSV
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105"
          >
            + Add Expense
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
      {!loading && expenses.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="🔍 Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="min-w-[200px]">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">Showing:</span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold">
                {filteredExpenses.length} / {expenses.length}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mb-4"></div>
            <p className="text-gray-500">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-lg mb-4">No expenses recorded yet</p>
            <p className="text-gray-400 mb-6">Track your business expenses here!</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105"
            >
              + Add Your First Expense
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
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center gap-2">
                        Description {getSortIcon('description')}
                      </div>
                    </th>
                    <th 
                      className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Amount {getSortIcon('amount')}
                      </div>
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Date {getSortIcon('date')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(expense => (
                    <tr key={expense.id} className="border-b border-gray-100 hover:bg-red-50 transition">
                      <td className="py-3 px-4 font-medium">{expense.description}</td>
                      <td className="py-3 px-4 text-right font-bold text-red-600">${parseFloat(expense.amount).toFixed(2)}</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">{expense.date}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 font-bold bg-gray-50">
                    <td className="py-3 px-4">Total Expenses</td>
                    <td className="py-3 px-4 text-right text-red-600">
                      ${filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No expenses match your search criteria</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('all');
                  }}
                  className="mt-4 text-red-500 hover:text-red-600 font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <ExpenseForm 
          onClose={() => setShowForm(false)} 
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

export default Expenses;