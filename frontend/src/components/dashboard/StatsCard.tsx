import { ArrowUpRight } from "lucide-react";
import React from "react";

interface StatsCardProps {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatsCard({ label, value, detail, icon }: StatsCardProps) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors group">
      <div className="flex justify-between items-start">
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <ArrowUpRight size={16} className="text-muted-foreground" />
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
        <p className="text-xs text-primary mt-1 font-medium">{detail}</p>
      </div>
    </div>
  );
}