import type React from "react"
import { cn } from "@/lib/utils"

interface GridProps {
  children: React.ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4
  noBorder?: "top" | "right" | "bottom" | "left" | "all" | "none"
  connectTo?: "top" | "bottom" | "none"
}

export function Grid({
  children,
  className,
  columns = 1,
  noBorder = "none",
  connectTo = "none",
}: GridProps) {
  return (
    <div
      className={cn(
        "relative border border-gray-200",
        noBorder === "top" && "border-t-0",
        noBorder === "right" && "border-r-0",
        noBorder === "bottom" && "border-b-0",
        noBorder === "left" && "border-l-0",
        noBorder === "all" && "border-0",
        connectTo === "top" && "-mt-px",
        connectTo === "bottom" && "-mb-px",
        className,
      )}
    >
      <div className="absolute top-0 left-0 translate-x-[-50%] translate-y-[-50%] w-3 h-3 bg-white z-10 flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2V10" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M2 6H10" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 translate-x-[50%] translate-y-[50%] w-3 h-3 bg-white z-10 flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2V10" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M2 6H10" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div
        className={cn(
          "grid gap-px bg-gray-200",
          columns === 1 && "grid-cols-1",
          columns === 2 && "grid-cols-1 md:grid-cols-2",
          columns === 3 && "grid-cols-1 md:grid-cols-3",
          columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function GridItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white p-8", className)}>{children}</div>
}
