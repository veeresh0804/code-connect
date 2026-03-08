import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Terminal,
  Flame,
  Trophy,
  Users,
  Code2,
  Swords,
  Calendar,
  ArrowRight,
  ChevronRight,
  Crown,
  Medal,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data
const streakData = {
  current: 12,
  longest: 34,
  todaySolved: true,
  weekDays: [
    { day: "Mon", done: true },
    { day: "Tue", done: true },
    { day: "Wed", done: true },
    { day: "Thu", done: true },
    { day: "Fri", done: true },
    { day: "Sat", done: false },
    { day: "Sun", done: false },
  ],
};

const challenges = [
  {
    id: 1,
    from: "Kavi",
    title: "Two Sum",
    difficulty: "Easy",
    status: "pending",
    timeLeft: "2h 30m",
  },
  {
    id: 2,
    from: "Ravi",
    title: "Binary Search Tree",
    difficulty: "Medium",
    status: "pending",
    timeLeft: "5h 10m",
  },
  {
    id: 3,
    from: "Priya",
    title: "Max Subarray",
    difficulty: "Easy",
    status: "completed",
    result: "won",
  },
  {
    id: 4,
    from: "Arun",
    title: "Graph Traversal",
    difficulty: "Hard",
    status: "completed",
    result: "lost",
  },
];

const friends = [
  { name: "Kavi", points: 2450, streak: 18, online: true, initials: "KV" },
  { name: "Ravi", points: 2100, streak: 7, online: true, initials: "RV" },
  { name: "Priya", points: 1980, streak: 22, online: false, initials: "PR" },
  { name: "Arun", points: 1750, streak: 3, online: false, initials: "AR" },
  { name: "Deepa", points: 1620, streak: 15, online: true, initials: "DP" },
];

const leaderboard = [
  { rank: 1, name: "Priya", points: 4520, badge: "🥇" },
  { rank: 2, name: "You", points: 3890, badge: "🥈" },
  { rank: 3, name: "Kavi", points: 3450, badge: "🥉" },
  { rank: 4, name: "Ravi", points: 2890, badge: "" },
  { rank: 5, name: "Arun", points: 2340, badge: "" },
];

const recentActivity = [
  { action: "Solved", problem: "Two Sum", lang: "Python", time: "2h ago", points: 50 },
  { action: "Won challenge", problem: "Max Subarray", lang: "C++", time: "5h ago", points: 100 },
  { action: "Solved", problem: "Fibonacci", lang: "Java", time: "1d ago", points: 30 },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-primary/20 text-primary",
  Medium: "bg-warm/20 text-warm",
  Hard: "bg-destructive/20 text-destructive",
};

const DashboardNav = () => (
  <header className="h-14 border-b border-border/60 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-50">
    <Link to="/" className="flex items-center gap-2">
      <Terminal className="h-5 w-5 text-primary" />
      <span className="font-bold text-sm">
        Arivu<span className="text-primary">Code</span>
      </span>
    </Link>

    <nav className="hidden md:flex items-center gap-1">
      {[
        { label: "Dashboard", href: "/dashboard", icon: TrendingUp },
        { label: "Editor", href: "/editor", icon: Code2 },
        { label: "Challenges", href: "/dashboard", icon: Swords },
        { label: "Leaderboard", href: "/dashboard", icon: Trophy },
      ].map((item) => (
        <Link key={item.label} to={item.href}>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1.5">
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Button>
        </Link>
      ))}
    </nav>

    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm">
        <Flame className="h-4 w-4 text-warm" />
        <span className="font-semibold text-warm">{streakData.current}</span>
      </div>
      <Link to="/profile">
        <Avatar className="h-8 w-8 border border-primary/30 cursor-pointer hover:border-primary transition-colors">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">AC</AvatarFallback>
        </Avatar>
      </Link>
    </div>
  </header>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            Welcome back, <span className="text-gradient-primary">Coder</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm">Keep your streak alive. Solve a challenge today.</p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: "Current Streak", value: `${streakData.current} days`, icon: Flame, color: "text-warm" },
            { label: "Total Points", value: "3,890", icon: Trophy, color: "text-primary" },
            { label: "Problems Solved", value: "127", icon: CheckCircle2, color: "text-primary" },
            { label: "Win Rate", value: "68%", icon: TrendingUp, color: "text-accent" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card/50 border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Streak Calendar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card/50 border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {streakData.weekDays.map((d) => (
                      <div key={d.day} className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-1.5">{d.day}</p>
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg mx-auto flex items-center justify-center transition-all ${
                            d.done
                              ? "bg-primary/20 border border-primary/40"
                              : "bg-muted/30 border border-border/40"
                          }`}
                        >
                          {d.done ? (
                            <Flame className="h-4 w-4 text-primary" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Longest streak: <strong className="text-foreground">{streakData.longest} days</strong></span>
                    <span className="text-primary font-medium">
                      {streakData.todaySolved ? "✓ Today completed" : "⏳ Solve one to keep streak"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Challenges */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="bg-card/50 border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Swords className="h-4 w-4 text-accent" />
                      Challenges
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                      <Plus className="h-3 w-3" /> New Challenge
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {challenges.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-accent/10 text-accent text-xs">
                              {c.from[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{c.title}</p>
                            <p className="text-xs text-muted-foreground">from {c.from}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`text-[10px] ${difficultyColor[c.difficulty]}`}>
                            {c.difficulty}
                          </Badge>
                          {c.status === "pending" ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {c.timeLeft}
                            </div>
                          ) : c.result === "won" ? (
                            <Badge className="bg-primary/20 text-primary text-[10px]">Won ✓</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-destructive/10 text-destructive text-[10px]">Lost</Badge>
                          )}
                          {c.status === "pending" && (
                            <Link to="/editor">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground">{a.action}</span>
                          <span className="font-medium">{a.problem}</span>
                          <Badge variant="outline" className="text-[10px] h-5">{a.lang}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-primary text-xs font-medium">+{a.points} pts</span>
                          <span className="text-xs text-muted-foreground">{a.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="space-y-2">
                <Link to="/editor">
                  <Button className="w-full glow-primary gap-2 justify-start" size="lg">
                    <Code2 className="h-4 w-4" />
                    Solve a Problem
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2 justify-start border-border/60" size="lg">
                  <Swords className="h-4 w-4 text-accent" />
                  Challenge a Friend
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="bg-card/50 border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-warm" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboard.map((u) => (
                      <div
                        key={u.rank}
                        className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                          u.name === "You"
                            ? "bg-primary/5 border border-primary/20"
                            : "hover:bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono w-6 text-center">
                            {u.badge || `#${u.rank}`}
                          </span>
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className={`text-[10px] ${u.name === "You" ? "bg-primary/20 text-primary" : "bg-muted"}`}>
                              {u.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`text-sm ${u.name === "You" ? "font-semibold text-primary" : ""}`}>
                            {u.name}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{u.points.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Friends */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Friends
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {friends.map((f) => (
                      <div key={f.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-accent/10 text-accent text-[10px]">{f.initials}</AvatarFallback>
                            </Avatar>
                            {f.online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-tight">{f.name}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Flame className="h-2.5 w-2.5 text-warm" /> {f.streak}d streak
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] text-accent">
                          <Swords className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
