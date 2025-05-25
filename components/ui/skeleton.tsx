import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> { }

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
