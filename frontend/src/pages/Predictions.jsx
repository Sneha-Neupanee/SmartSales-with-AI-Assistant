// ============================================
// FILE: frontend/src/pages/Predictions.jsx
// ============================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

function Predictions() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [days, setDays] = useState(7);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelStatus, setModelStatus] = useState(null);
  const [training, setTraining] = useState(false);

  // Fetch all products on component mount
  useEffect(() => {
    fetchProducts();
    checkModelStatus();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/product/all'); // updated endpoint
      setProducts(response.data);
      if (response.data.length > 0) {
        setSelectedProduct(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
    }
  };

  const checkModelStatus = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/ml/prepare-data');
      setModelStatus(response.data);
    } catch (err) {
      console.error('Failed to check model status:', err);
    }
  };

  const handleTrainModel = async () => {
    setTraining(true);
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/ml/train', null, {
        params: {
          epochs: 50,
          batch_size: 4
        }
      });
      
      if (response.data.status === 'success') {
        alert('Model trained successfully! You can now make predictions.');
        checkModelStatus();
      } else {
        setError(response.data.message || 'Failed to train model');
      }
    } catch (err) {
      setError('Failed to train model. Please ensure you have enough sales data.');
      console.error(err);
    } finally {
      setTraining(false);
    }
  };

  const handlePredict = async () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    setLoading(true);
    setError('');
    setPredictions(null);

    try {
      const response = await axios.get('http://127.0.0.1:8000/ml/predict', {
        params: {
          product_id: selectedProduct,
          days: days
        }
      });

      if (response.data.status === 'success') {
        setPredictions(response.data);
      } else {
        setError(response.data.message || 'Failed to generate predictions');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to generate predictions. Please train the model first.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = predictions?.predictions.map(p => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: p.date,
    quantity: p.predicted_quantity,
    day: p.day_of_week
  })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sales Predictions</h1>

      {/* Model Status Card */}
      {modelStatus && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Model Status</h2>
          {modelStatus.status === 'success' ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✓ Data ready for training</p>
              <p className="text-sm text-gray-600">
                Total records: {modelStatus.data.total_records}
              </p>
              <p className="text-sm text-gray-600">
                Training records: {modelStatus.data.train_records}
              </p>
              <p className="text-sm text-gray-600">
                Test records: {modelStatus.data.test_records}
              </p>
            </div>
          ) : (
            <div className="text-red-600">
              <p>⚠ {modelStatus.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Train Model Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Train Prediction Model</h2>
        <p className="text-gray-600 mb-4">
          Train the machine learning model using your historical sales data. This needs to be done before making predictions.
        </p>
        <button
          onClick={handleTrainModel}
          disabled={training || modelStatus?.status !== 'success'}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {training ? '🔄 Training Model...' : '🧠 Train Model'}
        </button>
        {modelStatus?.status !== 'success' && (
          <p className="text-sm text-red-600 mt-2">
            Not enough data to train model. Please add more sales records.
          </p>
        )}
      </div>

      {/* Prediction Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Generate Predictions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">-- Choose a product --</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Forecast Days
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handlePredict}
              disabled={loading || !selectedProduct}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Predicting...' : '📊 Predict Sales'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Predictions Results */}
      {predictions && (
        <>
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 mb-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Prediction Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-blue-100 text-sm">Product</p>
                <p className="text-2xl font-bold">{predictions.product.name}</p>
                <p className="text-sm text-blue-100">{predictions.product.category}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Forecast Period</p>
                <p className="text-2xl font-bold">{days} Days</p>
                <p className="text-sm text-blue-100">
                  {predictions.predictions[0]?.date} to {predictions.predictions[predictions.predictions.length - 1]?.date}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Total Expected Demand</p>
                <p className="text-3xl font-bold">{predictions.total_predicted_demand}</p>
                <p className="text-sm text-blue-100">Units</p>
              </div>
            </div>
          </div>

          {/* Predicted Sales Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Predicted Sales (Next {days} Days)</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                          <p className="font-semibold">{payload[0].payload.day}</p>
                          <p className="text-sm text-gray-600">{payload[0].payload.fullDate}</p>
                          <p className="text-blue-600 font-bold">
                            Predicted: {payload[0].value.toFixed(2)} units
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="quantity" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Predicted Quantity"
                  dot={{ fill: '#3B82F6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart Alternative View */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Daily Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#8B5CF6" name="Predicted Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Predictions Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Detailed Predictions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Day of Week</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Predicted Quantity</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Expected Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.predictions.map((pred, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{pred.date}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {pred.day_of_week}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {pred.predicted_quantity.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 font-semibold">
                        ${(pred.predicted_quantity * predictions.product.sell_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 font-bold bg-gray-50">
                    <td className="py-3 px-4" colSpan="2">Total</td>
                    <td className="py-3 px-4 text-right">
                      {predictions.total_predicted_demand} units
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      ${(predictions.total_predicted_demand * predictions.product.sell_price).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!predictions && !loading && !error && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Ready to Predict Sales?
          </h3>
          <p className="text-gray-500">
            Select a product and forecast period to see AI-powered sales predictions
          </p>
        </div>
      )}
    </div>
  );
}

export default Predictions;
