import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ChartPieProps {
  data: ChartData[];
  title: string;
  loading?: boolean;
}

const ChartPie = ({ data, title, loading }: ChartPieProps) => {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: item.color || `hsl(${(index * 45) % 360}, 70%, 50%)`,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="vgu-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vgu-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No data available</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [value, 'Count']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ChartPie;