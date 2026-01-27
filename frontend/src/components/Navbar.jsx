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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        
        .nav-link {
          position: relative;
          padding: 0.5rem 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          letter-spacing: 0.01em;
        }
        
        .nav-link::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, white, transparent);
          transform: translateX(-50%);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-link:hover::before {
          width: 100%;
        }
        
        .nav-link:hover {
          transform: translateY(-2px);
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .nav-btn {
          position: relative;
          overflow: hidden;
          border-radius: 0.75rem;
          padding: 0.625rem 1.25rem;
          font-weight: 600;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .nav-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          transform: translate(-50%, -50%);
          transition: width 0.5s, height 0.5s;
        }
        
        .nav-btn:hover::before {
          width: 300px;
          height: 300px;
        }
        
        .nav-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
        }
        
        .nav-btn:active {
          transform: translateY(0);
        }
        
        .mobile-menu-item {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .mobile-menu-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 4px;
          height: 0;
          background: white;
          transform: translateY(-50%);
          transition: height 0.3s ease;
          border-radius: 0 4px 4px 0;
        }
        
        .mobile-menu-item:hover::before {
          height: 70%;
        }
        
        .mobile-menu-item:hover {
          background: rgba(255, 255, 255, 0.15);
          padding-left: 1.5rem;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .mobile-menu {
          animation: slideDown 0.3s ease-out;
        }
        
        .badge-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        .logo-text {
          background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 50%, #ffffff 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 3s ease infinite;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .navbar-blur {
          background: linear-gradient(135deg, 
            rgba(30, 58, 138, 0.95) 0%, 
            rgba(30, 41, 59, 0.95) 50%, 
            rgba(30, 58, 138, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        }
        
        .menu-icon-line {
          transition: all 0.3s ease;
        }
        
        .hamburger-btn:hover .menu-icon-line {
          background: rgba(255, 255, 255, 1);
        }
      `}</style>

      <nav className="navbar-blur text-white shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <span className="text-2xl">🚀</span>
              </div>
              <span className="text-2xl font-bold logo-text">
                SmartSales
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-2">
              <Link to="/" className="nav-link relative z-10">
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </span>
              </Link>

              <Link to="/products" className="nav-link relative z-10">
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Products
                </span>
              </Link>

              <Link to="/sales" className="nav-link relative z-10">
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sales
                </span>
              </Link>

              <Link to="/expenses" className="nav-link relative z-10">
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Expenses
                </span>
              </Link>

              <Link to="/predictions" className="nav-link relative z-10">
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Predictions
                </span>
              </Link>

              <Link to="/query" className="nav-btn relative z-10 ml-2">
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Ask AI
                </span>
              </Link>

              <Link to="/alerts" className="nav-btn relative z-10">
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Alerts
                  {alertCount > 0 && (
                    <span className={`absolute -top-1 -right-1 ${
                      criticalCount > 0 ? 'bg-red-500' : 'bg-amber-500'
                    } text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center badge-pulse shadow-lg`}>
                      {alertCount}
                    </span>
                  )}
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden focus:outline-none hamburger-btn p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path className="menu-icon-line" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path className="menu-icon-line" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="lg:hidden pb-4 space-y-1 mobile-menu">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="mobile-menu-item block py-3 px-4 rounded-lg transition-all"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </span>
              </Link>

              <Link
                to="/products"
                onClick={() => setIsOpen(false)}
                className="mobile-menu-item block py-3 px-4 rounded-lg transition-all"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Products
                </span>
              </Link>

              <Link
                to="/sales"
                onClick={() => setIsOpen(false)}
                className="mobile-menu-item block py-3 px-4 rounded-lg transition-all"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sales
                </span>
              </Link>

              <Link
                to="/expenses"
                onClick={() => setIsOpen(false)}
                className="mobile-menu-item block py-3 px-4 rounded-lg transition-all"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Expenses
                </span>
              </Link>

              <Link
                to="/predictions"
                onClick={() => setIsOpen(false)}
                className="mobile-menu-item block py-3 px-4 rounded-lg transition-all"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Predictions
                </span>
              </Link>

              <Link
                to="/query"
                onClick={() => setIsOpen(false)}
                className="mobile-menu-item block py-3 px-4 rounded-lg transition-all bg-white/5"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Ask AI
                </span>
              </Link>

              <Link
                to="/alerts"
                onClick={() => setIsOpen(false)}
                className="mobile-menu-item block py-3 px-4 rounded-lg transition-all bg-white/5"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Alerts
                  {alertCount > 0 && (
                    <span className={`ml-auto ${
                      criticalCount > 0 ? 'bg-red-500' : 'bg-amber-500'
                    } text-white text-xs font-bold rounded-full px-2 py-0.5`}>
                      {alertCount}
                    </span>
                  )}
                </span>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;