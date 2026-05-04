'use client'

import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-border bg-bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-bold text-brand-primary hover:text-brand-hover transition-colors"
          >
            3D Hub
          </Link>

          {/* Desktop auth CTAs */}
          <nav className="hidden sm:flex items-center gap-3">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
              Log in
            </Link>
            <Link href="/register" className={cn(buttonVariants({ variant: "default" }))}>
              Sign up
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-muted"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-bg-card px-4 pb-4 pt-2 flex flex-col gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start")}
            onClick={() => setMobileOpen(false)}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "default" }), "w-full")}
            onClick={() => setMobileOpen(false)}
          >
            Sign up
          </Link>
        </div>
      )}
    </header>
  );
}
