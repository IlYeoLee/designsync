"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/new-york/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/new-york/ui/sheet"

/* ─────────────────────────────────────────────────────────────────────────────
 * NavBar — composable top navigation bar (global, app-level).
 *
 * Use this for the site-wide or app-wide top bar with logo, nav links, and
 * actions. Do NOT use for page-level sticky headers inside content areas.
 *
 * Uses only semantic tokens. Zero hardcoded colors.
 * Composes existing shadcn components: Button, Sheet.
 *
 * Usage:
 *   <NavBar sticky>
 *     <NavBarLogo href="/">MyApp</NavBarLogo>
 *     <NavBarNav>
 *       <NavBarNavLink href="/features" active>Features</NavBarNavLink>
 *       <NavBarNavLink href="/pricing">Pricing</NavBarNavLink>
 *     </NavBarNav>
 *     <NavBarActions>
 *       <Button variant="outline" size="sm">Log in</Button>
 *       <Button size="sm">Sign up</Button>
 *     </NavBarActions>
 *     <NavBarMobileNav>
 *       <NavBarMobileNavLink href="/features" active>Features</NavBarMobileNavLink>
 *       <NavBarMobileNavLink href="/pricing">Pricing</NavBarMobileNavLink>
 *     </NavBarMobileNav>
 *   </NavBar>
 * ──────────────────────────────────────────────────────────────────────────── */

function NavBar({
  className,
  sticky = false,
  children,
  ...props
}: React.ComponentProps<"header"> & { sticky?: boolean }) {
  return (
    <header
      data-slot="navbar"
      data-sticky={sticky || undefined}
      className={cn(
        "border-b border-border bg-background",
        sticky && "sticky top-0 z-50",
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center gap-[var(--ds-section-gap)] px-[var(--ds-card-padding)] md:px-[var(--ds-card-padding)]">
        {children}
      </div>
    </header>
  )
}

function NavBarLogo({
  className,
  href = "/",
  children,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="navbar-logo"
      href={href}
      className={cn(
        "flex items-center gap-2 text-foreground font-semibold text-sm shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

function NavBarNav({
  className,
  children,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="navbar-nav"
      className={cn("hidden md:flex items-center gap-1 min-w-0 overflow-hidden", className)}
      {...props}
    >
      {children}
    </nav>
  )
}

function NavBarNavLink({
  className,
  active = false,
  children,
  ...props
}: React.ComponentProps<"a"> & { active?: boolean }) {
  return (
    <a
      data-slot="navbar-nav-link"
      data-active={active || undefined}
      className={cn(
        "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-3 py-2 rounded-[var(--ds-element-radius)] whitespace-nowrap",
        active && "text-foreground bg-accent",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

function NavBarActions({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navbar-actions"
      className={cn("ml-auto flex items-center gap-2 shrink-0", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function NavBarMobileNav({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<"div"> & { title?: string }) {
  return (
    <div data-slot="navbar-mobile-nav" className={cn("md:hidden", className)} {...props}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="size-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>{title ?? "Menu"}</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-2">
            {children}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function NavBarMobileNavLink({
  className,
  active = false,
  children,
  ...props
}: React.ComponentProps<"a"> & { active?: boolean }) {
  return (
    <a
      data-slot="navbar-mobile-nav-link"
      data-active={active || undefined}
      className={cn(
        "flex items-center gap-2 rounded-[var(--ds-element-radius)] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        active && "bg-accent text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

export {
  NavBar,
  NavBarLogo,
  NavBarNav,
  NavBarNavLink,
  NavBarActions,
  NavBarMobileNav,
  NavBarMobileNavLink,
}
