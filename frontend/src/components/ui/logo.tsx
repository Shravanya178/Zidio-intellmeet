// src/components/ui/logo.tsx
import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary)/80 100%)" }}
      >
        <span className="text-white font-bold text-xl">IM</span>
      </div>
    </div>
  );
}