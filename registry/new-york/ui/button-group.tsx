import * as React from "react"

import { cn } from "@/lib/utils"

function ButtonGroup({
  className,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      data-slot="button-group"
      data-orientation={orientation}
      role="group"
      className={cn(
        "inline-flex",
        orientation === "horizontal"
          ? "flex-row -space-x-px [&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md"
          : "flex-col -space-y-px [&>button]:rounded-none [&>button:first-child]:rounded-t-md [&>button:last-child]:rounded-b-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function ButtonGroupSeparator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      data-slot="button-group-separator"
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "w-px self-stretch" : "h-px self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator }
