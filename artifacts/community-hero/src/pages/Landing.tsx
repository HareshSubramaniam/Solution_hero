import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { MapPin, Shield, Users, ArrowRight, Activity, CheckCircle, Camera, TrendingUp } from "lucide-react";

const HERO_IMAGE = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80";

const CATEGORY_IMAGES = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/75/Asphalt_deterioration.jpg",
    label: "Potholes",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e3/3lamps.jpg",
    label: "Streetlights",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Bedrijfsafval.jpg",
    label: "Garbage",
  },
];

export default function Landing() {
  const { data: stats } = useGetDashboardStats();

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-orange-900/20" />

        {/* Content */}
        <div className="relative z-20 container mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium hover:bg-white/20 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live civic reporting · Coimbatore
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight mb-6 text-white leading-none">
              Spot it.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">
                Report it.
              </span>
              <br />
              Fix it.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-400">
                Together.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Your city, your voice. Report potholes, broken streetlights, and civic issues. 
              The community verifies, authorities act, and everyone tracks progress live.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center" onPointerDown={(e) => e.stopPropagation()}>
              <Link href="/report">
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-400 text-white text-lg h-14 px-10 rounded-full shadow-2xl shadow-orange-500/30 font-semibold transition-all hover:scale-105 cursor-pointer"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Report an Issue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/feed">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-lg h-14 px-10 rounded-full font-semibold transition-all hover:scale-105 cursor-pointer"
                >
                  Explore Issues
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
          </div>
        </motion.div>
      </section>

      {/* ── LIVE STATS ── */}
      <section className="relative bg-gray-950 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-orange-500/5" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-center gap-2 mb-12">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Live city impact</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: stats?.totalIssues ?? 25, label: "Total Reports", color: "text-blue-400", suffix: "" },
              { value: stats?.resolvedIssues ?? 5, label: "Issues Resolved", color: "text-green-400", suffix: "" },
              { value: stats?.activeReporters ?? 8, label: "Active Citizens", color: "text-orange-400", suffix: "" },
              { value: stats?.avgResolutionDays ?? 3, label: "Avg Days to Fix", color: "text-purple-400", suffix: "d" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`text-5xl font-heading font-bold mb-2 ${stat.color}`}>
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-xs uppercase tracking-widest font-semibold text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL PHOTOS STRIP ── */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">
              Real issues. Real impact.
            </h2>
            <p className="text-3xl md:text-4xl font-heading font-bold text-white">
              Citizens making cities better
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {CATEGORY_IMAGES.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative group rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-white font-semibold text-lg">{img.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">Simple process</h2>
            <p className="text-4xl md:text-5xl font-heading font-bold">How it works</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Camera,
                title: "Snap & Report",
                desc: "Take a photo of the problem. Our AI instantly categorizes it and suggests a description.",
                color: "from-orange-500 to-orange-400",
              },
              {
                step: "02",
                icon: Users,
                title: "Community Verifies",
                desc: "Neighbors confirm the issue exists. Three verifications auto-escalate it to authorities.",
                color: "from-blue-500 to-blue-400",
              },
              {
                step: "03",
                icon: CheckCircle,
                title: "Track Resolution",
                desc: "Follow every status update on the live map until the issue is fully resolved.",
                color: "from-green-500 to-green-400",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.4}
                whileHover={{ y: -8, scale: 1.02 }}
                whileDrag={{ scale: 0.98, cursor: "grabbing" }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="relative bg-card border rounded-2xl p-8 overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-shadow cursor-grab active:cursor-grabbing"
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[64px] bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity`}
                />
                <div className="text-6xl font-heading font-black text-muted/30 mb-4 select-none">{item.step}</div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg`}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3 select-none">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed select-none">{item.desc}</p>
                <div className="absolute bottom-3 right-3 text-[9px] font-bold tracking-widest text-muted-foreground/30 uppercase opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
                  Drag
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/80" />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <TrendingUp className="w-12 h-12 mx-auto mb-6 text-orange-400" />
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Your report can change a neighbourhood.
          </h2>
          <p className="text-white/70 text-xl max-w-2xl mx-auto mb-10">
            Join thousands of citizens already making Coimbatore a better place to live.
          </p>
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-400 text-white text-lg h-14 px-12 rounded-full shadow-2xl shadow-orange-500/30 font-semibold transition-all hover:scale-105"
            >
              Join CommunityHero <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 py-10 border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/60">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="font-heading font-bold text-white">CommunityHero</span>
          </div>
          <p className="text-gray-600 text-sm">© 2025 CommunityHero · Coimbatore · Built for citizens.</p>
          <div className="flex gap-4">
            <Link href="/feed" className="text-gray-500 hover:text-white text-sm transition-colors">Feed</Link>
            <Link href="/map" className="text-gray-500 hover:text-white text-sm transition-colors">Map</Link>
            <Link href="/leaderboard" className="text-gray-500 hover:text-white text-sm transition-colors">Leaderboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
