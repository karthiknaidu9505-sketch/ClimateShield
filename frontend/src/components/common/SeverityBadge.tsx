import React from 'react';
import { RiskLevel } from '../../types/index.js';

interface SeverityBadgeProps {
  level: RiskLevel | string;
  className?: string;
  showDot?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ level, className = '', showDot = true }) => {
  const normLevel = (level || '').toUpperCase();

  switch (normLevel) {
    case 'CRITICAL':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-error-container text-on-error-container border border-error/30 tracking-wider ${className}`}>
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />}
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-fixed-dim/50 tracking-wider ${className}`}>
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />}
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-surface-container-high text-on-surface border border-outline-variant/60 tracking-wider ${className}`}>
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim" />}
          MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-primary-fixed/40 text-primary border border-primary-fixed-dim/60 tracking-wider ${className}`}>
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          LOW
        </span>
      );
  }
};
