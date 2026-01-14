import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Navbar() {
  const [alertCount, setAlertCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchAlertSummary();
    const interval = setInterval(fetchAlertSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlertSummary = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/alerts/summary');
      const total = response.data.critical + response.data.warning;
      setAlertCount(total);
      setCriticalCount(response.data.critical);
    } catch (err) {
      console.error('Failed to fetch alert summary:', err);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition-colors">
            SmartSales 🚀
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-6 items-center">
            <Link to="/" className="hover:text-blue-200 transition-colors font-medium">
              Dashboard
            </Link>
            <Link to="/products" className="hover:text-blue-200 transition-colors font-medium">
              Products
            </Link>
            <Link to="/sales" className="hover:text-blue-200 transition-colors font-medium">
              Sales
            </Link>
            <Link to="/expenses" className="hover:text-blue-200 transition-colors font-medium">
              Expenses
            </Link>
            <Link to="/predictions" className="hover:text-blue-200 transition-colors font-medium">
              Predictions
            </Link>
            <Link to="/query" className="hover:text-blue-200 transition-colors font-medium">
              Ask AI
            </Link>
            <Link to="/alerts" className="hover:text-blue-200 transition-colors font-medium relative">
              Alerts
              {alertCount > 0 && (
                <span className={`absolute -top-2 -right-3 ${criticalCount > 0 ? 'bg-red-500' : 'bg-yellow-500'} text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse`}>
                  {alertCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-4 hover:bg-purple-700 rounded transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/products"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-4 hover:bg-purple-700 rounded transition-colors"
            >
              Products
            </Link>
            <Link
              to="/sales"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-4 hover:bg-purple-700 rounded transition-colors"
            >
              Sales
            </Link>
            <Link
              to="/expenses"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-4 hover:bg-purple-700 rounded transition-colors"
            >
              Expenses
            </Link>
            <Link
              to="/predictions"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-4 hover:bg-purple-700 rounded transition-colors"
            >
              Predictions
            </Link>
            <Link
              to="/query"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-4 hover:bg-purple-700 rounded transition-colors"
            >
              Ask AI
            </Link>
            <Link
              to="/alerts"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-4 hover:bg-purple-700 rounded transition-colors relative"
            >
              Alerts {alertCount > 0 && `(${alertCount})`}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;