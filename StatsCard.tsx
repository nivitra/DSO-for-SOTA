import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, trend }) => {
  return (
    <div className="bg-white border border-aws-border rounded-sm p-3 flex items-center gap-3 shadow-sm">
      <div className="text-aws-blue">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-bold text-aws-dark leading-none">{value}</p>
          {trend && <span className="text-[10px] font-medium text-emerald-600">{trend}</span>}
        </div>
      </div>
    </div>
  );
};