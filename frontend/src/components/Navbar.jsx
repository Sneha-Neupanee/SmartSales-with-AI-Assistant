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
    <nav className="sticky top-0 z-50 bg-[#0b132b]/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-semibold tracking-wide text-white hover:text-indigo-400 transition-colors"
          >
            SmartSales
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-6 items-center text-sm font-medium">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>

            <Link
              to="/products"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Products
            </Link>

            <Link
              to="/sales"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sales
            </Link>

            <Link
              to="/expenses"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Expenses
            </Link>

            <Link
              to="/predictions"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Predictions
            </Link>

            <Link
              to="/query"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Ask AI
            </Link>

            <Link
              to="/alerts"
              className="relative text-gray-300 hover:text-white transition-colors"
            >
              Alerts
              {alertCount > 0 && (
                <span
                  className={`absolute -top-2 -right-3 ${
                    criticalCount > 0 ? 'bg-red-500' : 'bg-yellow-500'
                  } text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse`}
                >
                  {alertCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-gray-200 hover:text-white transition-colors focus:outline-none"
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
          <div className="lg:hidden mt-2 rounded-xl bg-[#111b3c]/95 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition"
            >
              Dashboard
            </Link>

            <Link
              to="/products"
              onClick={() => setIsOpen(false)}
              className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition"
            >
              Products
            </Link>

            <Link
              to="/sales"
              onClick={() => setIsOpen(false)}
              className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition"
            >
              Sales
            </Link>

            <Link
              to="/expenses"
              onClick={() => setIsOpen(false)}
              className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition"
            >
              Expenses
            </Link>

            <Link
              to="/predictions"
              onClick={() => setIsOpen(false)}
              className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition"
            >
              Predictions
            </Link>

            <Link
              to="/query"
              onClick={() => setIsOpen(false)}
              className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition"
            >
              Ask AI
            </Link>

            <Link
              to="/alerts"
              onClick={() => setIsOpen(false)}
              className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition"
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
