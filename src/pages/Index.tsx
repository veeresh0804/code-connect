import { motion } from "framer-motion";
import { Code2, Flame, Trophy, Users, Zap, ArrowRight, Terminal, Braces, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NavBar = () => (
  <motion.nav
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
  >
    <div className="container flex h-16 items-center justify-between">
      <div className="flex items-center gap-2">
        <Terminal className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold tracking-tight">
          Arivu<span className="text-primary">Code</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
        <a href="#roadmap" className="hover:text-foreground transition-colors">Roadmap</a>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-muted-foreground">Log in</Button>
        <Button size="sm" className="glow-primary">Get Started</Button>
      </div>
    </div>
  </motion.nav>
);

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
    {/* Grid background */}
    <div className="absolute inset-0 grid-bg opacity-30" />
    {/* Gradient orbs */}
    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse_glow" />
    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px] animate-pulse_glow" style={{ animationDelay: "1.5s" }} />
    
    <div className="container relative z-10 text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
          <Zap className="h-3.5 w-3.5" />
          <span>Social Coding Platform</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
          Code.{" "}
          <span className="text-gradient-primary">Challenge.</span>
          <br />
          Compete.
        </h1>

        <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed">
          The platform where coding meets competition. Challenge friends, build streaks, and climb the leaderboard — all while mastering code.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary text-base px-8 h-12 gap-2">
            Start Coding Free <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="text-base px-8 h-12 border-border/60 gap-2">
            <Code2 className="h-4 w-4" /> View Demo
          </Button>
        </div>
      </motion.div>

      {/* Code preview card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-16 max-w-2xl mx-auto"
      >
        <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden glow-primary">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warm/60" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
            </div>
            <span className="text-xs text-muted-foreground font-mono ml-2">challenge.py</span>
          </div>
          <pre className="p-5 text-sm font-mono text-left overflow-x-auto">
            <code>
              <span className="text-accent">def</span>{" "}
              <span className="text-primary">solve_challenge</span>
              <span className="text-muted-foreground">(</span>
              <span className="text-warm">nums</span>
              <span className="text-muted-foreground">):</span>{"\n"}
              {"    "}
              <span className="text-muted-foreground"># Find the maximum subarray sum</span>{"\n"}
              {"    "}
              <span className="text-accent">max_sum</span>
              <span className="text-muted-foreground"> = </span>
              <span className="text-warm">current</span>
              <span className="text-muted-foreground"> = </span>
              <span className="text-primary">nums[0]</span>{"\n"}
              {"    "}
              <span className="text-accent">for</span>
              <span className="text-foreground"> n </span>
              <span className="text-accent">in</span>
              <span className="text-foreground"> nums[1:]:</span>{"\n"}
              {"    "}{"    "}
              <span className="text-warm">current</span>
              <span className="text-muted-foreground"> = </span>
              <span className="text-accent">max</span>
              <span className="text-muted-foreground">(n, current + n)</span>{"\n"}
              {"    "}{"    "}
              <span className="text-warm">max_sum</span>
              <span className="text-muted-foreground"> = </span>
              <span className="text-accent">max</span>
              <span className="text-muted-foreground">(max_sum, current)</span>{"\n"}
              {"    "}
              <span className="text-accent">return</span>
              <span className="text-foreground"> max_sum</span>
            </code>
          </pre>
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border/60 bg-primary/5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-mono">Output: 6 ✓ All test cases passed</span>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const features = [
  {
    icon: Braces,
    title: "In-Browser Editor",
    description: "Monaco-powered code editor with syntax highlighting, autocomplete, and multi-language support.",
    color: "text-primary",
  },
  {
    icon: Users,
    title: "Friend Challenges",
    description: "Challenge your friends to coding battles. Send problems, compete head-to-head, see who's faster.",
    color: "text-accent",
  },
  {
    icon: Flame,
    title: "Daily Streaks",
    description: "Build unbreakable coding habits. Track your daily streak, earn recovery tokens, stay consistent.",
    color: "text-warm",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description: "Climb global and friend rankings. Earn points for every problem solved, every challenge won.",
    color: "text-primary",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-32 relative">
    <div className="container px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-sm uppercase tracking-widest text-primary mb-3">Features</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          Everything you need to{" "}
          <span className="text-gradient-primary">level up</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-xl border border-border/60 bg-card/50 p-7 hover:border-primary/30 transition-all duration-300 hover:glow-primary"
          >
            <f.icon className={`h-8 w-8 ${f.color} mb-4`} />
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const steps = [
  { step: "01", title: "Sign Up", desc: "Create your profile in seconds" },
  { step: "02", title: "Add Friends", desc: "Find and connect with coders" },
  { step: "03", title: "Challenge", desc: "Send or accept coding battles" },
  { step: "04", title: "Code & Win", desc: "Solve problems, earn points" },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-32 relative">
    <div className="container px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-sm uppercase tracking-widest text-primary mb-3">How It Works</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          From signup to <span className="text-gradient-primary">victory</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {steps.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="text-5xl font-bold text-primary/20 mb-3 font-mono">{s.step}</div>
            <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
            {i < 3 && (
              <ChevronRight className="h-5 w-5 text-primary/30 mx-auto mt-4 hidden lg:block" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const roadmap = [
  { phase: "Phase 1", title: "Foundation", status: "done" as const, items: ["Project structure", "Navigation", "GitHub repo"] },
  { phase: "Phase 2", title: "Code Editor", status: "current" as const, items: ["Monaco editor", "Language selector", "Paste blocking"] },
  { phase: "Phase 3", title: "Execution", status: "upcoming" as const, items: ["Run code", "Docker sandbox", "Multi-language"] },
  { phase: "Phase 4", title: "Challenges", status: "upcoming" as const, items: ["Friend system", "Challenge mode", "Submissions"] },
  { phase: "Phase 5", title: "Streaks", status: "upcoming" as const, items: ["Daily tracking", "Streak calendar", "Recovery"] },
  { phase: "Phase 6", title: "Rewards", status: "upcoming" as const, items: ["Points", "Badges", "Leaderboard"] },
];

const statusColors = {
  done: "border-primary/40 bg-primary/5",
  current: "border-warm/40 bg-warm/5 glow-accent",
  upcoming: "border-border/40 bg-card/30",
};

const statusBadge = {
  done: "bg-primary/20 text-primary",
  current: "bg-warm/20 text-warm",
  upcoming: "bg-muted text-muted-foreground",
};

const RoadmapSection = () => (
  <section id="roadmap" className="py-32 relative">
    <div className="container px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-sm uppercase tracking-widest text-primary mb-3">Roadmap</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          Building the <span className="text-gradient-primary">future</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {roadmap.map((r, i) => (
          <motion.div
            key={r.phase}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-xl border p-6 ${statusColors[r.status]}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-muted-foreground">{r.phase}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[r.status]}`}>
                {r.status === "done" ? "✓ Complete" : r.status === "current" ? "🚧 In Progress" : "⏳ Upcoming"}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-3">{r.title}</h3>
            <ul className="space-y-1.5">
              {r.items.map((item) => (
                <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${r.status === "done" ? "bg-primary" : r.status === "current" ? "bg-warm" : "bg-muted-foreground/30"}`} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-32 relative">
    <div className="container px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center rounded-2xl border border-primary/20 bg-primary/5 p-12 glow-primary"
      >
        <Terminal className="h-10 w-10 text-primary mx-auto mb-6" />
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to code competitively?
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Join the community of coders who learn by challenging each other.
        </p>
        <Button size="lg" className="glow-primary text-base px-8 h-12 gap-2">
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-border/50 py-10">
    <div className="container px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Terminal className="h-5 w-5 text-primary" />
        <span className="font-bold">
          Arivu<span className="text-primary">Code</span>
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        © 2026 ArivuCode. Code. Challenge. Compete.
      </p>
    </div>
  </footer>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <RoadmapSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
