import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Predictions from './pages/Predictions';
import NaturalQuery from './pages/NaturalQuery';
import Alerts from './pages/Alerts'; // Added Alerts import

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/query" element={<NaturalQuery />} />
            <Route path="/alerts" element={<Alerts />} /> {/* Added Alerts route */}
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
