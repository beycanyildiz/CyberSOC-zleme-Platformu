import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface ChartData {
  time: string;
  value: number;
}

interface RealTimeChartProps {
  data: ChartData[];
  color: string;
  title: string;
}

export const RealTimeChart: React.FC<RealTimeChartProps> = ({ data, color, title }) => {
  return (
    <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-cyan-400 mb-4">{title}</h3>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF" 
              fontSize={10}
              tickFormatter={(value) => value.split(':').slice(1).join(':')}
            />
            <YAxis stroke="#9CA3AF" fontSize={10} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};