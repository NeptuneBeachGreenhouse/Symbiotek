interface StatCircleProps {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  colorClass: string;
  Icon: React.ElementType;
}

export const StatCircle: React.FC<StatCircleProps> = ({ label, value, maxValue, unit, colorClass, Icon }) => {
  const percentage = (value / maxValue) * 100;
  const circumference = 2 * Math.PI * 45; // radius is 45
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-700"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <circle
            className={colorClass}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`h-6 w-6 mb-1 ${colorClass}`} />
          <span className="text-xl font-bold">{Math.round(value)}{unit}</span>
        </div>
      </div>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
};
