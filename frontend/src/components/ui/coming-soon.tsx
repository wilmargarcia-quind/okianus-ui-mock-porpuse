import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComingSoonProps {
  children: React.ReactNode
  label?: string
  className?: string
}

export function ComingSoon({ children, label = 'Próximamente disponible', className }: ComingSoonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('inline-flex cursor-not-allowed', className)}>
            <span className="pointer-events-none opacity-50">{children}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="flex items-center gap-1.5 bg-[#0D2137] text-white">
          <Clock className="h-3.5 w-3.5 text-[#1E88E5]" />
          <span>{label}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
