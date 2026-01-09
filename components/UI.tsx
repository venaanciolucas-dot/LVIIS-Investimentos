
import React from 'react';

export const AppleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-300 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#007AFF] text-white hover:bg-[#0062CC] shadow-md hover:shadow-lg",
    secondary: "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white border border-[#D2D2D7] dark:border-[#3A3A3C] hover:bg-[#F5F5F7] dark:hover:bg-[#3A3A3C]",
    ghost: "bg-transparent text-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-900/20"
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// Fix: Updated AppleCard to accept and handle an onClick prop to fix the type error in App.tsx
export const AppleCard: React.FC<{
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}> = ({ children, title, subtitle, className = '', onClick }) => {
  return (
    <div 
      className={`apple-card bg-white dark:bg-[#1C1C1E] p-6 apple-shadow border border-[#E5E5E7]/50 dark:border-[#2C2C2E] text-[#1D1D1F] dark:text-white min-w-0 ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-[#86868B] dark:text-[#A1A1A6]">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export const ProgressBar: React.FC<{
  progress: number;
  color?: string;
}> = ({ progress, color = '#007AFF' }) => {
  const percentage = Math.min(100, Math.max(0, progress));
  return (
    <div className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full h-2 overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-1000 ease-out" 
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
};
