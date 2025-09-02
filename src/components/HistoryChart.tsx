import { HistoryEntry, PlantType } from '@/types';
import { Card } from './Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface HistoryChartProps {
  data: HistoryEntry[];
  plantType?: PlantType;
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ data, plantType }) => {
  // Define thresholds based on plant type
  const getThresholds = (type?: PlantType) => {
    switch (type) {
      case PlantType.TROPICAL:
        return { moisture: { min: 60, max: 80 }, light: { min: 10000, max: 20000 } };
      case PlantType.SUCCULENT:
        return { moisture: { min: 20, max: 40 }, light: { min: 15000, max: 25000 } };
      case PlantType.HERB:
        return { moisture: { min: 50, max: 70 }, light: { min: 12000, max: 22000 } };
      case PlantType.VINE:
        return { moisture: { min: 40, max: 60 }, light: { min: 8000, max: 18000 } };
      case PlantType.FERN:
        return { moisture: { min: 70, max: 90 }, light: { min: 5000, max: 15000 } };
      default:
        return { moisture: { min: 50, max: 70 }, light: { min: 10000, max: 20000 } };
    }
  };

  const thresholds = getThresholds(plantType);

  return (
    <Card>
      <h2 className="text-xl font-bold text-green-300 mb-4">Care History</h2>
      <div className="h-64">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString()}
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis yAxisId="left" stroke="#60a5fa" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#facc15" fontSize={12} />
              
              {/* Moisture threshold lines */}
              <ReferenceLine 
                yAxisId="left" 
                y={thresholds.moisture.min} 
                stroke="#60a5fa" 
                strokeDasharray="5 5" 
                strokeOpacity={0.6}
              />
              <ReferenceLine 
                yAxisId="left" 
                y={thresholds.moisture.max} 
                stroke="#60a5fa" 
                strokeDasharray="5 5" 
                strokeOpacity={0.6}
              />
              
              {/* Light threshold lines */}
              <ReferenceLine 
                yAxisId="right" 
                y={thresholds.light.min} 
                stroke="#facc15" 
                strokeDasharray="5 5" 
                strokeOpacity={0.6}
              />
              <ReferenceLine 
                yAxisId="right" 
                y={thresholds.light.max} 
                stroke="#facc15" 
                strokeDasharray="5 5" 
                strokeOpacity={0.6}
              />

              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4a5568' }}
                labelStyle={{ color: '#d1d5db' }}
                labelFormatter={(unixTime) => new Date(unixTime).toLocaleString()}
                formatter={(value, name) => [
                  `${Math.round(Number(value))}${name === 'Moisture (%)' ? '%' : ' lux'}`,
                  name
                ]}
              />
              <Legend wrapperStyle={{fontSize: "14px"}} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="moisture"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                name="Moisture (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="light"
                stroke="#facc15"
                strokeWidth={2}
                dot={false}
                name="Light (lux)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Live sensor data will populate the chart over time.
          </div>
        )}
      </div>
    </Card>
  );
};
