import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D', '#C75B7A', '#9B59B6'];

// Custom Tooltip for Line Chart
const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500">
        <p className="font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-semibold">{entry.name}:</span> {entry.name.includes('$') ? `$${entry.value.toFixed(2)}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Bar Chart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-purple-500">
        <p className="font-bold text-gray-800 mb-2">{label}</p>
        <p className="text-sm text-purple-600">
          <span className="font-semibold">Quantity Sold:</span> {payload[0].value} units
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-green-500">
        <p className="font-bold text-gray-800 mb-1">{data.name}</p>
        <p className="text-sm text-green-600">
          <span className="font-semibold">Quantity:</span> {data.value} units
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Percentage:</span> {data.percent ? `${(data.percent * 100).toFixed(1)}%` : 'N/A'}
        </p>
      </div>
    );
  }
  return null;
};

// Custom Label for Pie Chart
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label if too small

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="font-bold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function Charts({ dashboardData, productStats }) {
  // Prepare data for charts
  const salesOverTime = productStats?.sales_over_time || [];
  
  const productWiseSales = dashboardData?.metrics?.product_wise_sales || [];
  
  // Calculate profit per product (for bar chart)
  const profitData = productWiseSales.map(item => ({
    name: item.product,
    quantity: item.quantity_sold,
  })).slice(0, 10); // Top 10

  // Prepare pie chart data (revenue contribution)
  const pieData = productWiseSales.map((item, index) => ({
    name: item.product,
    value: item.quantity_sold,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-8">
      {/* Line Chart - Sales Over Time */}
      {salesOverTime.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">📈 Sales Over Time</h2>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Revenue
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Quantity
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={3} 
                name="Revenue ($)"
                dot={{ fill: '#8884d8', r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="quantity_sold" 
                stroke="#82ca9d" 
                strokeWidth={3} 
                name="Quantity Sold"
                dot={{ fill: '#82ca9d', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Top Products by Quantity */}
        {profitData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">🏆 Top Products</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                By Quantity
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  label={{ value: 'Units', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar 
                  dataKey="quantity" 
                  fill="#8884d8" 
                  name="Quantity Sold"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie Chart - Revenue Contribution */}
        {pieData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">🥧 Sales Distribution</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                By Product
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value, entry) => (
                    <span className="text-sm text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default Charts;