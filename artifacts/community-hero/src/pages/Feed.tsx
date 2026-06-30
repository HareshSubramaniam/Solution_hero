import { useState } from "react";
import { useListIssues } from "@workspace/api-client-react";
import { IssueCard } from "@/components/IssueCard";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "All", icon: "🗺️" },
  { value: "pothole", label: "Pothole", icon: "🕳️" },
  { value: "streetlight", label: "Streetlight", icon: "💡" },
  { value: "garbage", label: "Garbage", icon: "🗑️" },
  { value: "water_leakage", label: "Water", icon: "💧" },
  { value: "sewage", label: "Sewage", icon: "🚧" },
  { value: "property_damage", label: "Property", icon: "🏚️" },
  { value: "other", label: "Other", icon: "📍" },
];

const STATUSES = [
  { value: "all", label: "All Status" },
  { value: "reported", label: "Reported" },
  { value: "verified", label: "Verified" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const SEVERITIES = [
  { value: "all", label: "All Severity" },
  { value: "low", label: "🔵 Low" },
  { value: "medium", label: "🟡 Medium" },
  { value: "high", label: "🟠 High" },
  { value: "critical", label: "🔴 Critical" },
];

export default function Feed() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: issues, isLoading } = useListIssues({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    status: status !== "all" ? status : undefined,
    severity: severity !== "all" ? severity : undefined,
  });

  const hasActiveFilters = category !== "all" || status !== "all" || severity !== "all" || search !== "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 max-w-7xl py-3">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-heading font-bold">Community Feed</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading…" : `${issues?.length ?? 0} issues near you`}
              </p>
            </div>
            <Link href="/report">
              <Button className="rounded-full gap-2 shadow-lg shadow-primary/20">
                <PlusCircle className="w-4 h-4" />
                Report
              </Button>
            </Link>
          </div>

          {/* Search + filter toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues…"
                className="pl-9 bg-card text-card-foreground border-border rounded-xl focus:border-primary/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                "rounded-xl",
                (filtersOpen || hasActiveFilters) && "border-primary/50 text-primary"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all",
                  category === cat.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                    : "bg-card text-card-foreground border-border hover:bg-muted"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Expandable status/severity filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-3">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground self-center font-bold uppercase tracking-wider mr-1">Status:</span>
                    {STATUSES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setStatus(s.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                          status === s.value
                            ? "bg-secondary text-secondary-foreground border-secondary"
                            : "bg-card text-muted-foreground border-border hover:bg-muted"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground self-center font-bold uppercase tracking-wider mr-1">Severity:</span>
                    {SEVERITIES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSeverity(s.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                          severity === s.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:bg-muted"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={() => { setSearch(""); setCategory("all"); setStatus("all"); setSeverity("all"); }}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 max-w-7xl py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : issues && issues.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {issues.map((issue) => (
                <motion.div
                  key={issue.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <IssueCard issue={issue} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-xl font-heading font-bold mb-2">No issues found</h3>
            <p className="text-muted-foreground max-w-md mb-8">
              No issues match your current filters. Try adjusting them or report a new one.
            </p>
            <Button
              variant="outline"
              onClick={() => { setSearch(""); setCategory("all"); setStatus("all"); setSeverity("all"); }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
