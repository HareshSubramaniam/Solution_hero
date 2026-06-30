import { Link } from "wouter";
import { Issue } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, MapPin, Clock, AlertTriangle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { getIssueImageUrl } from "@/lib/image-fallback";

const SEVERITY_CONFIG = {
  low: { label: "Low", dot: "bg-sky-400", text: "text-sky-300", badge: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  medium: { label: "Medium", dot: "bg-amber-400", text: "text-amber-300", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  high: { label: "High", dot: "bg-orange-400", text: "text-orange-300", badge: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  critical: { label: "Critical", dot: "bg-red-500", text: "text-red-300", badge: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const STATUS_CONFIG = {
  reported: { label: "Reported", color: "bg-gray-500/20 text-gray-300 border-gray-500/30", dot: "bg-gray-400" },
  verified: { label: "Verified", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", dot: "bg-blue-400" },
  in_progress: { label: "In Progress", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", dot: "bg-amber-400" },
  resolved: { label: "Resolved", color: "bg-green-500/20 text-green-300 border-green-500/30", dot: "bg-green-400" },
};

const CATEGORY_ICON: Record<string, string> = {
  pothole: "🕳️",
  streetlight: "💡",
  garbage: "🗑️",
  water_leakage: "💧",
  sewage: "🚧",
  property_damage: "🏚️",
  other: "📍",
};

export function IssueCard({ issue }: { issue: Issue }) {
  const severity = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.medium;
  const status = STATUS_CONFIG[issue.status] ?? STATUS_CONFIG.reported;
  const catIcon = CATEGORY_ICON[issue.category] ?? "📍";

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.25}
      whileHover={{ y: -4, scale: 1.02 }}
      whileDrag={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 450, damping: 24 }}
      className="h-full"
    >
      <Link href={`/issue/${issue.id}`} className="h-full flex flex-col">
        <article className="group relative rounded-[14px] overflow-hidden cursor-pointer bg-card shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all border border-border cursor-grab active:cursor-grabbing select-none h-full flex flex-col">
          {/* Image */}
          <div className="relative h-48 w-full overflow-hidden bg-muted/50 shrink-0">
            {getIssueImageUrl(issue.imageUrl, issue.category) ? (
              <img
                src={getIssueImageUrl(issue.imageUrl, issue.category)}
                alt={issue.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-5xl">
                {catIcon}
              </div>
            )}

            {/* Dark gradient at bottom of image */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

            {/* Severity pill — top left */}
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md uppercase tracking-wider ${severity.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${severity.dot}`} />
                {severity.label}
              </span>
            </div>

            {/* Status pill — top right */}
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md uppercase tracking-wider ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 pt-3 pb-3 flex-1 flex flex-col justify-between">
            <div>
              {/* Category label */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                <span>{catIcon}</span>
                <span>{issue.category.replace(/_/g, " ")}</span>
              </div>

              {/* Title */}
              <h3 className="font-heading font-bold text-foreground text-[15px] leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
                {issue.title}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3 font-medium">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="line-clamp-1">{issue.address || issue.zone}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border pt-2.5 flex items-center justify-between mt-auto">
              {/* Reporter */}
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback
                    style={{ backgroundColor: issue.reporterAvatarColor || "#2563EB" }}
                    className="text-[10px] text-white font-bold"
                  >
                    {(issue.reporterName || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-foreground truncate">{issue.reporterName || "Unknown"}</p>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 font-medium uppercase tracking-wider mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Verify count */}
              <div className="flex items-center gap-1 text-xs font-bold text-green-500 shrink-0 ml-2 bg-green-500/10 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{issue.verifiedCount}</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
