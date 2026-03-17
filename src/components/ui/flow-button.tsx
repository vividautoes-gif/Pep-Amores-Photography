'use client';
import { ArrowRight, Camera } from 'lucide-react';

export function FlowButton({ 
  text = "Modern Button", 
  onClick,
  type = "button",
  disabled = false
}: { 
  text?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="group relative flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-brand-accent/40 bg-transparent px-8 py-3 text-sm font-semibold text-brand-accent cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-[12px] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Left camera icon - Enters from the left on hover */}
      <Camera 
        className="absolute w-4 h-4 left-[-25%] stroke-brand-accent fill-none z-[9] group-hover:left-4 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>

      {/* Circle - Using brand-accent (#B45309) for the "marron" color */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-brand-accent rounded-[50%] opacity-0 group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"></span>

      {/* Right arrow - Exits to the right on hover */}
      <ArrowRight 
        className="absolute w-4 h-4 right-4 stroke-brand-accent fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />
    </button>
  );
}
