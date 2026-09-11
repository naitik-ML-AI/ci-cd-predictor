import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  switch (level) {
    case 'LOW':
      return (
        <span
          id={`badge-risk-${level.toLowerCase()}`}
          className={`inline-flex items-center rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 whitespace-nowrap ${sizeClasses[size]}`}
        >
          {showIcon && <ShieldCheck size={iconSizes[size]} className="text-emerald-400 shrink-0" />}
          LOW
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          id={`badge-risk-${level.toLowerCase()}`}
          className={`inline-flex items-center rounded-full bg-amber-950/60 text-amber-400 border border-amber-500/30 whitespace-nowrap ${sizeClasses[size]}`}
        >
          {showIcon && <AlertTriangle size={iconSizes[size]} className="text-amber-400 shrink-0" />}
          MEDIUM
        </span>
      );
    case 'HIGH':
      return (
        <span
          id={`badge-risk-${level.toLowerCase()}`}
          className={`inline-flex items-center rounded-full bg-rose-950/60 text-rose-400 border border-rose-500/30 whitespace-nowrap ${sizeClasses[size]}`}
        >
          {showIcon && <AlertOctagon size={iconSizes[size]} className="text-rose-400 shrink-0" />}
          HIGH
        </span>
      );
    default:
      return null;
  }
};
