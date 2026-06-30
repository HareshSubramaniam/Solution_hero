import { useState } from "react";
import { useRoute } from "wouter";
import { useGetUser, useGetUserActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { IssueCard } from "@/components/IssueCard";
import { Trophy, Shield, Flame, Star, Award, Calendar, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "framer-motion";

const BADGE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  first_report: { icon: Star, label: "First Report", color: "text-yellow-500" },
  watchdog: { icon: Shield, label: "Watchdog", color: "text-blue-500" },
  problem_solver: { icon: Trophy, label: "Problem Solver", color: "text-green-600" },
  hot_streak: { icon: Flame, label: "Hot Streak", color: "text-orange-500" },
  top_verifier: { icon: Award, label: "Top Verifier", color: "text-purple-500" },
};

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const id = params?.id || "";
  const [statusFilter, setStatusFilter] = useState("all");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, isLoading: profileLoading } = useGetUser(id, { query: { enabled: !!id } } as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activities, isLoading: activitiesLoading } = useGetUserActivity(id, { query: { enabled: !!id } } as any);

  if (profileLoading || activitiesLoading) {
    return (
      <div className="container mx-auto p-4 py-8 max-w-5xl space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4 py-20 text-center">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-5xl">
      <Card className="mb-8 overflow-hidden border-none shadow-md">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-secondary/80 w-full" />
        <CardContent className="relative pt-0 px-6 pb-6 sm:px-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-12 mb-6">
            <motion.div
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.4}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              whileDrag={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="cursor-grab active:cursor-grabbing z-10 animate-fade-in"
            >
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarFallback style={{ backgroundColor: profile.avatarColor }} className="text-4xl text-white font-bold select-none">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="text-center sm:text-left flex-1 pb-2">
              <h1 className="text-3xl font-heading font-bold">{profile.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-muted-foreground text-sm select-none">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(profile.createdAt), "MMMM yyyy")}</span>
                <span className="px-2">•</span>
                <span className="capitalize">{profile.role}</span>
              </div>
            </div>
            <motion.div 
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.35}
              whileHover={{ scale: 1.08, rotate: [0, -2, 2, 0] }}
              whileDrag={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="bg-muted p-4 rounded-xl text-center min-w-[120px] cursor-grab active:cursor-grabbing select-none"
            >
              <div className="text-3xl font-bold font-heading text-primary">{profile.points}</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Points</div>
            </motion.div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 select-none">
              <Award className="w-5 h-5 text-yellow-500" />
              Earned Badges
            </h3>
            {profile.badges && profile.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.badges.map((badge) => {
                  const config = BADGE_CONFIG[badge] ?? { icon: Star, label: badge.replace(/_/g, " "), color: "text-primary" };
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={badge}
                      drag
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      dragElastic={0.45}
                      whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0] }}
                      whileDrag={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 450, damping: 18 }}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <Badge variant="secondary" className="px-3 py-1.5 text-sm bg-background border shadow-sm flex gap-2 capitalize select-none">
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        {config.label}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No badges earned yet. Report issues and verify community reports to earn them!</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="reports">Reported Issues ({profile.issueCount})</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {profile.issues && profile.issues.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 border border-border p-3 rounded-xl mb-6 select-none">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Filter by Status:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "all", label: `All (${profile.issues.length})` },
                  { value: "reported", label: `Reported (${profile.issues.filter((i: any) => i.status === "reported").length})` },
                  { value: "verified", label: `Verified (${profile.issues.filter((i: any) => i.status === "verified").length})` },
                  { value: "in_progress", label: `In Progress (${profile.issues.filter((i: any) => i.status === "in_progress").length})` },
                  { value: "resolved", label: `Resolved (${profile.issues.filter((i: any) => i.status === "resolved").length})` },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                      statusFilter === s.value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {profile.issues && profile.issues.length > 0 ? (
            (() => {
              const filtered = profile.issues.filter((issue: any) => 
                statusFilter === "all" ? true : issue.status === statusFilter
              );
              return filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((issue: any) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">No reported issues match this status filter.</p>
                </div>
              );
            })()
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No issues reported yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!activities || activities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No activity yet.</p>
                ) : (
                  activities.map((activity: any) => (
                    <div key={activity.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                      <div className="mt-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {activity.action === "reported" && <AlertTriangle className="w-4 h-4" />}
                        {activity.action === "verified" && <Shield className="w-4 h-4" />}
                        {activity.action === "resolved" && <CheckCircle className="w-4 h-4" />}
                        {activity.action === "badge_earned" && <Award className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium">
                          {activity.action === "reported" && `Reported: ${activity.issueTitle ?? "an issue"}`}
                          {activity.action === "verified" && `Verified: ${activity.issueTitle ?? "an issue"}`}
                          {activity.action === "resolved" && `Helped resolve: ${activity.issueTitle ?? "an issue"}`}
                          {activity.action === "badge_earned" && "Earned a new badge!"}
                        </p>
                        <div className="flex gap-3 text-sm mt-1">
                          <span className="text-primary font-semibold">+{activity.points} pts</span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
