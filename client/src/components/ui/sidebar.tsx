import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/lib/hooks"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  onClose?: () => void
  children: React.ReactNode
}

export function Sidebar({ 
  isOpen = true, 
  onClose, 
  className,
  children,
  ...props 
}: SidebarProps) {
  const isMobile = useIsMobile()
  
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && isMobile && onClose) {
        onClose()
      }
    }
    
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, isMobile, onClose])
  
  // Handle click outside for mobile only
  React.useEffect(() => {
    if (!isMobile) return
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const sidebar = document.getElementById("sidebar")
      
      if (sidebar && !sidebar.contains(target) && isOpen && onClose) {
        onClose()
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, isMobile, onClose])
  
  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      <aside
        id="sidebar"
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 h-full",
          "flex flex-col bg-background border-r",
          "transition-all duration-300 ease-in-out",
          isMobile ? "w-[280px]" : "w-[240px]",
          isMobile && !isOpen && "-translate-x-full",
          !isMobile && !isOpen && "w-[80px]",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    </>
  )
}

export function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-16 items-center border-b px-4 py-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-auto flex items-center border-t px-4 py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-1 overflow-auto py-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Skeleton loading state for sidebar items
export function SidebarSkeleton() {
  return (
    <div className="px-4 py-2 space-y-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-[80%] rounded bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  )
}