const WinrateGauge = ({
  percentage,
  title,
  subtitle,
  size,
}: {
  percentage: number;
  title: string;
  subtitle: string;
  size: number;
}) => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // Calculate the semicircle properties
  const radius = (size - 8) / 2; // Account for stroke width
  const circumference = Math.PI * radius; // Half circle circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Center position
  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <div className="flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        {/* Background semicircle */}
        <svg
          className="transform rotate-0"
          width={size}
          height={size / 2 + 20}
          viewBox={`0 0 ${size} ${size / 2 + 20}`}
        >
          {/* Background track (red) - full semicircle */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${
              centerX + radius
            } ${centerY}`}
            stroke="#e5261e" // Dark red
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
          />

          {/* Progress arc (blue) - winrate portion */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${
              centerX + radius
            } ${centerY}`}
            stroke="#1e88e5" // Electric blue
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
          <div className="text-lg font-semibold text-slate-300">
            {Math.round(percentage)}%
          </div>
          <div className="text-xs text-gray-400">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

export default WinrateGauge;
