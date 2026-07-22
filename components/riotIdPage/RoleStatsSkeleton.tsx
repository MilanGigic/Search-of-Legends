const ROLES = ["ADC", "TOP", "MID", "SUPPORT", "JUNGLE"];

export default function RoleStatsSkeleton() {
  return (
    <div className="bg-[#121624] border border-white/10 rounded-lg shadow-sm shadow-black/30 overflow-hidden">
      {/* Header — static, columns are known ahead of data */}
      <div className="grid grid-cols-[2fr_1fr_1fr] items-center px-4 py-3 border-b border-white/5">
        <div className="text-sm font-semibold text-gray-300">Role</div>
        <div className="text-center text-sm font-semibold text-gray-300">
          Games
        </div>
        <div className="text-center text-sm font-semibold text-gray-300">
          WR
        </div>
      </div>

      {/* Rows — the 5 roles are a fixed set, so only Games/WR (real data) pulse.
          Swap the bordered square below for your real role icon component. */}
      {ROLES.map((role) => (
        <div
          key={role}
          className="grid grid-cols-[2fr_1fr_1fr] items-center px-4 py-2.5 border-b border-white/5 last:border-b-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-5 rounded-sm border border-gray-600/50 shrink-0" />
            <span className="text-sm font-medium text-gray-400">{role}</span>
          </div>
          <div className="flex justify-center animate-pulse" aria-hidden="true">
            <div className="h-3 w-6 rounded bg-gray-700/40" />
          </div>
          <div className="flex justify-center animate-pulse" aria-hidden="true">
            <div className="h-3 w-9 rounded bg-gray-700/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
