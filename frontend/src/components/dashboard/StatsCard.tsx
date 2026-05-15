import { TrendingUp } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string
  detail: string
  icon: React.ReactNode
}

export function StatsCard({ label, value, detail, icon }: StatsCardProps) {
  return (
    <div className="bg-card p-5 rounded-2xl border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <TrendingUp size={14} className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-foreground mt-1 tracking-tight">{value}</h3>
      <p className="text-xs text-primary font-medium mt-1.5">{detail}</p>
    </div>
  )
}
