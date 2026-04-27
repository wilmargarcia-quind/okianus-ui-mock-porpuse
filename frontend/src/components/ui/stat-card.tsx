import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string          // tailwind text-* class
  iconBg?: string             // tailwind bg-* class
  trend?: number              // positive = up, negative = down, 0 = flat
  trendLabel?: string
  footer?: React.ReactNode
  className?: string
}

export function StatCard({
  title, value, icon: Icon,
  iconColor = 'text-[#1E88E5]',
  iconBg   = 'bg-[#1E88E5]/10',
  trend, trendLabel,
  footer,
  className,
}: StatCardProps) {
  const hasTrend = trend !== undefined

  return (
    <div className={cn(
      'rounded-xl border border-[#E8EDF2] bg-white px-6 py-5 shadow-sm',
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        {/* Icon box */}
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>

        {/* Trend badge */}
        {hasTrend && (
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            trend > 0  ? 'bg-emerald-50 text-emerald-600' :
            trend < 0  ? 'bg-red-50 text-red-600'         :
                         'bg-gray-100 text-[#637381]'
          )}>
            {trend > 0  ? <TrendingUp  className="h-3 w-3" /> :
             trend < 0  ? <TrendingDown className="h-3 w-3" /> :
                          <Minus        className="h-3 w-3" />}
            {trend !== 0 ? `${Math.abs(trend)}%` : (trendLabel ?? '—')}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[28px] font-bold leading-tight tracking-tight text-[#1C2434]">
          {value}
        </p>
        <p className="mt-1 text-sm font-medium text-[#637381]">{title}</p>
        {trendLabel && hasTrend && trend !== 0 && (
          <p className="mt-0.5 text-xs text-[#9BAEC8]">{trendLabel}</p>
        )}
      </div>

      {footer && <div className="mt-4 border-t border-[#E8EDF2] pt-3">{footer}</div>}
    </div>
  )
}
