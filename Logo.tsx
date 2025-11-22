import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 40" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DSO Logo"
    >
      {/* D */}
      <path 
        d="M10 8H22C32 8 38 14 38 20C38 26 32 32 22 32H10V8Z" 
        stroke="currentColor" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-slate-100"
      />
      <path 
        d="M10 8H22C32 8 38 14 38 20C38 26 32 32 22 32H10V8Z" 
        fill="currentColor" 
        className="text-aws-nav"
      />
      
      {/* S (Abstracted as a pipeline curve) */}
      <path 
        d="M44 10C44 10 48 8 52 8C58 8 60 12 56 16C52 20 46 22 46 26C46 30 50 32 56 32H60" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round"
        className="text-slate-400"
      />

      {/* O with Arrow (Optimiser) */}
      <circle cx="80" cy="20" r="10" stroke="currentColor" strokeWidth="4" className="text-aws-orange" />
      
      {/* Arrow Trajectory */}
      <path 
        d="M76 24L84 16M84 16H78M84 16V22" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-aws-orange"
      />
    </svg>
  );
};