import { useGetDashboardStats, useGetInsights } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Clock, Users, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { motion } from "framer-motion";

const COLORS = [
  "hsl(var(--chart-1))", 
  "hsl(var(--chart-2))", 
  "hsl(var(--chart-3))", 
  "hsl(var(--chart-4))", 
  "hsl(var(--chart-5))"
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

function StatCard({ title, value, icon: Icon, description }: any) {
  return (
    <motion.div
      variants={itemVariants}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.3}
      whileHover={{ y: -6, scale: 1.02 }}
      whileDrag={{ scale: 0.98, cursor: "grabbing" }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-300 border border-border/80 cursor-grab active:cursor-grabbing select-none relative group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold font-heading"
          >
            {value}
          </motion.div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
        <div className="absolute bottom-2 right-2 text-[8px] font-bold tracking-widest text-muted-foreground/30 uppercase opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
          Drag
        </div>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: insightsResult, isLoading: insightsLoading } = useGetInsights();

  if (statsLoading) {
    return (
      <div className="container mx-auto p-4 py-8 space-y-4">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="container mx-auto p-4 py-8 max-w-7xl"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-heading font-bold">City Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of civic issues and resolution progress.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Issues" 
          value={stats.totalIssues} 
          icon={AlertTriangle} 
          description="Reported this month"
        />
        <StatCard 
          title="Resolution Rate" 
          value={`${Math.round(stats.resolutionRate)}%`} 
          icon={CheckCircle} 
          description="Of all reported issues"
        />
        <StatCard 
          title="Avg. Resolution Time" 
          value={`${stats.avgResolutionDays} days`} 
          icon={Clock} 
          description="From report to fix"
        />
        <StatCard 
          title="Active Citizens" 
          value={stats.activeReporters} 
          icon={Users} 
          description="Contributing this month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div 
          variants={itemVariants} 
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.2}
          whileHover={{ y: -4, scale: 1.01 }}
          whileDrag={{ scale: 0.98, cursor: "grabbing" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="lg:col-span-2 cursor-grab active:cursor-grabbing select-none"
        >
          <Card className="h-full border border-border/80 shadow-sm hover:shadow-md transition-shadow relative group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                AI Predictive Insights
              </CardTitle>
              <CardDescription>Generated by CivicBot analyzing recent trends</CardDescription>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              ) : (
                <ul className="space-y-4">
                  {insightsResult?.insights.map((insight, idx) => (
                    <motion.li 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 bg-secondary/10 p-4 rounded-lg border border-secondary/20"
                    >
                      <Sparkles className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{insight}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </CardContent>
            <div className="absolute bottom-2 right-2 text-[8px] font-bold tracking-widest text-muted-foreground/30 uppercase opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
              Drag Panel
            </div>
          </Card>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.2}
          whileHover={{ y: -4, scale: 1.01 }}
          whileDrag={{ scale: 0.98, cursor: "grabbing" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          <Card className="h-full border border-border/80 shadow-sm hover:shadow-md transition-shadow relative group">
            <CardHeader>
              <CardTitle>Issues by Category</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center" onPointerDown={(e) => e.stopPropagation()}>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.byCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="category"
                    >
                      {stats.byCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, name.replace("_", " ")]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <div className="absolute bottom-2 right-2 text-[8px] font-bold tracking-widest text-muted-foreground/30 uppercase opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
              Drag Panel
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          variants={itemVariants}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.2}
          whileHover={{ y: -4, scale: 1.01 }}
          whileDrag={{ scale: 0.98, cursor: "grabbing" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow relative group">
            <CardHeader>
              <CardTitle>Recent Resolutions</CardTitle>
              <CardDescription>Issues resolved over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent onPointerDown={(e) => e.stopPropagation()}>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.recentResolutions}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <div className="absolute bottom-2 right-2 text-[8px] font-bold tracking-widest text-muted-foreground/30 uppercase opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
              Drag Panel
            </div>
          </Card>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.2}
          whileHover={{ y: -4, scale: 1.01 }}
          whileDrag={{ scale: 0.98, cursor: "grabbing" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow relative group">
            <CardHeader>
              <CardTitle>Issues by Zone</CardTitle>
              <CardDescription>Active vs Resolved issues across city zones</CardDescription>
            </CardHeader>
            <CardContent onPointerDown={(e) => e.stopPropagation()}>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byZone} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="zone" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Bar dataKey="count" name="Total Issues" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="resolved" name="Resolved" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <div className="absolute bottom-2 right-2 text-[8px] font-bold tracking-widest text-muted-foreground/30 uppercase opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
              Drag Panel
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
