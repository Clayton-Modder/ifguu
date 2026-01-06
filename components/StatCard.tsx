
import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:border-slate-600 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{label}</h3>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
