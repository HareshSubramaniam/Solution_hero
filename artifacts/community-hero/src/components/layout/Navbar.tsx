import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Menu, X, LogOut, User as UserIcon, Map, BarChart2, Trophy, Rss, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Feed", path: "/feed", icon: Rss },
  { label: "Map", path: "/map", icon: Map },
  { label: "Dashboard", path: "/dashboard", icon: BarChart2 },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const navItems = [
    ...NAV_ITEMS,
    ...(user?.role === "admin" ? [{ label: "Admin", path: "/admin", icon: Settings }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground hidden sm:inline-block tracking-tight">
              Community<span className="text-primary">Hero</span>
            </span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location === item.path || location.startsWith(item.path + "/");
                return (
                  <Link key={item.path} href={item.path}>
                    <button
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        active
                          ? "bg-secondary/10 text-secondary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Report button */}
            {isAuthenticated && (
              <Link href="/report" className="hidden sm:block">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 shadow-lg shadow-primary/20 font-semibold"
                >
                  + Report
                </Button>
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-base overflow-hidden relative cursor-pointer"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ y: -12, opacity: 0, rotate: -45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 12, opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.18 }}
                  className="inline-block"
                >
                  {theme === "dark" ? "🌞" : "🌙"}
                </motion.span>
              </AnimatePresence>
            </button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 py-1 hover:bg-muted transition-all cursor-pointer">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback
                        style={{ backgroundColor: user?.avatarColor || "#2563EB" }}
                        className="text-white text-xs font-bold"
                      >
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground hidden sm:block max-w-[80px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user?.id}`} className="cursor-pointer flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button
                  size="sm"
                  className="rounded-full font-semibold"
                >
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile hamburger */}
            {isAuthenticated && (
              <button
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {isOpen && isAuthenticated && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 space-y-1">
              <Link href="/report" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold mb-2 cursor-pointer hover:bg-primary/15 transition-all">
                  <span className="text-lg">📷</span> Report New Issue
                </div>
              </Link>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location === item.path || location.startsWith(item.path + "/");
                return (
                  <Link key={item.path} href={item.path}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                        active ? "bg-secondary/10 text-secondary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
