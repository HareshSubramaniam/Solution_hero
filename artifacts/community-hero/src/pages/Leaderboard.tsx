import { useGetLeaderboard } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Award, Shield, Flame, Star, Medal } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const BADGE_CONFIG: Record<string, { icon: React.ElementType; label: string }> = {
  first_report: { icon: Star, label: "First Report" },
  watchdog: { icon: Shield, label: "Watchdog" },
  problem_solver: { icon: Trophy, label: "Problem Solver" },
  hot_streak: { icon: Flame, label: "Hot Streak" },
  top_verifier: { icon: Award, label: "Top Verifier" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 py-8 max-w-4xl space-y-4">
        <Skeleton className="h-10 w-48 mb-8" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <div className="mb-8 text-center relative overflow-hidden py-4">
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.4}
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="inline-block cursor-grab active:cursor-grabbing mb-4"
        >
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-heading font-bold"
        >
          Community Leaderboard
        </motion.h1>
        <p className="text-muted-foreground mt-2">Recognizing our most active citizens making a difference.</p>
        <p className="text-[10px] text-muted-foreground/40 mt-1 select-none">Tip: Grab the trophy or slide cards sideways!</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4 overflow-x-hidden"
      >
        {leaderboard?.map((entry: any, index: number) => {
          const isCurrentUser = user?.id === entry.id;
          let rankStyle = "bg-card text-foreground";

          if (index === 0) {
            rankStyle = "bg-yellow-500/10 border-yellow-500/50 dark:bg-yellow-500/20";
          } else if (index === 1) {
            rankStyle = "bg-slate-300/20 border-slate-400/50 dark:bg-slate-400/20";
          } else if (index === 2) {
            rankStyle = "bg-amber-600/10 border-amber-600/50 dark:bg-amber-700/20";
          } else if (isCurrentUser) {
            rankStyle = "bg-primary/5 border-primary/30";
          }

          const rankColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];
          const rankColor = rankColors[index] ?? "text-muted-foreground";

          return (
            <motion.div
              key={entry.id}
              variants={itemVariants}
              drag="x"
              dragConstraints={{ left: -120, right: 120 }}
              dragElastic={0.4}
              whileHover={{ scale: 1.015, x: 5 }}
              whileDrag={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative group cursor-grab active:cursor-grabbing select-none"
            >
              <Link href={`/profile/${entry.id}`}>
                <Card className={`overflow-hidden border transition-shadow duration-300 ${rankStyle}`}>
                  <CardContent className="flex items-center p-4 gap-3">
                    <div className={`w-10 text-center font-heading font-bold text-xl ${rankColor} flex flex-col items-center justify-center shrink-0`}>
                      {index < 3 ? <Medal className="w-6 h-6" /> : null}
                      <span className={index < 3 ? "text-xs" : "text-base"}>
                        {index < 3 ? ["1st", "2nd", "3rd"][index] : `#${entry.rank}`}
                      </span>
                    </div>

                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm shrink-0">
                      <AvatarFallback style={{ backgroundColor: entry.avatarColor }} className="text-white font-medium">
                        {entry.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="ml-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg truncate">{entry.name}</h3>
                        {isCurrentUser && <Badge variant="secondary" className="text-[10px] shrink-0">You</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground flex gap-4 mt-0.5">
                        <span>{entry.issueCount} Reports</span>
                        <span>{entry.verificationCount} Verifications</span>
                      </div>
                    </div>

                    <div className="hidden md:flex gap-1.5 mr-4 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
                      {(entry.badges || []).slice(0, 3).map((badge: string) => {
                        const config = BADGE_CONFIG[badge] ?? { icon: Star, label: badge };
                        const Icon = config.icon;
                        return (
                          <div
                            key={badge}
                            className="w-8 h-8 rounded-full bg-background flex items-center justify-center border shadow-sm"
                            title={config.label}
                          >
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                        );
                      })}
                      {(entry.badges || []).length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border">
                          +{entry.badges.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold font-heading text-primary">{entry.points}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">pts</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
