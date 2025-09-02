import { Plant } from '@/types';
import { Card } from './Card';
import { StatCircle } from './StatCircle';
import { WaterDropIcon, SunIcon } from './icons';
import { CARE_THRESHOLDS } from '@/constants';

interface DashboardProps {
  plant: Plant;
  isLoading: boolean;
  careStatus: {
    advice: string;
    color: string;
    icon: React.ReactElement;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ plant, isLoading, careStatus }) => {
  // Calculate maxLight value safely
  const maxLight = (() => {
    try {
      return CARE_THRESHOLDS[plant.plantType]?.light?.high + 10000 || 30000;
    } catch {
      return 30000; // Default max light value if anything goes wrong
    }
  })();

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-300">Live Status: {plant?.name || 'Unknown Plant'}</h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${careStatus?.color || 'text-gray-400'} bg-gray-700/50`}>
          {careStatus?.icon}
          <span>{careStatus?.advice || 'No Status'}</span>
        </div>
      </div>

      <div className="text-center bg-gray-900/70 p-4 rounded-lg min-h-[80px] flex items-center justify-center">
        {isLoading ? (
          <div className="animate-pulse text-gray-400">Thinking...</div>
        ) : (
                           <p className="text-lg italic text-gray-200">&quot;{plant?.status || 'No status available'}&quot;</p>
        )}
      </div>

      <div className="flex justify-around items-center pt-4">
        <StatCircle
          label="Soil Moisture"
          value={plant?.moisture ?? 0}
          maxValue={100}
          unit="%"
          colorClass="text-blue-400"
          Icon={WaterDropIcon}
        />
        <StatCircle
          label="Light Exposure"
          value={plant?.light ?? 0}
          maxValue={maxLight}
          unit=" lux"
          colorClass="text-yellow-400"
          Icon={SunIcon}
        />
      </div>
    </Card>
  );
};
