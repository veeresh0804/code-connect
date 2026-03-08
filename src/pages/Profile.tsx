import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Terminal,
  Flame,
  Trophy,
  Code2,
  Calendar,
  Settings,
  Edit3,
  Award,
  TrendingUp,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const badges = [
  { name: "First Solve", emoji: "🎯", earned: true },
  { name: "7-Day Streak", emoji: "🔥", earned: true },
  { name: "Challenge Victor", emoji: "⚔️", earned: true },
  { name: "30-Day Streak", emoji: "💎", earned: true },
  { name: "100 Problems", emoji: "💯", earned: false },
  { name: "Speed Demon", emoji: "⚡", earned: false },
];

const languageStats = [
  { lang: "Python", solved: 68, percentage: 54 },
  { lang: "C++", solved: 32, percentage: 25 },
  { lang: "Java", solved: 18, percentage: 14 },
  { lang: "C", solved: 9, percentage: 7 },
];

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border/60 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-5 w-px bg-border" />
          <Link to="/" className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Arivu<span className="text-primary">Code</span></span>
          </Link>
        </div>
        <Button variant="ghost" size="sm" className="text-xs gap-1.5">
          <Settings className="h-3.5 w-3.5" /> Settings
        </Button>
      </header>

      <main className="container px-4 sm:px-6 py-8 max-w-4xl mx-auto">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8"
        >
          <Avatar className="h-20 w-20 border-2 border-primary/30">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">AC</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold">ArivuCoder</h1>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Edit3 className="h-3 w-3" /> Edit
              </Button>
            </div>
            <p className="text-muted-foreground text-sm mt-1">Coding since 2026 • Tamil Nadu, India</p>
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
              <div className="flex items-center gap-1.5 text-sm">
                <Flame className="h-4 w-4 text-warm" />
                <span className="font-semibold">12</span>
                <span className="text-muted-foreground text-xs">day streak</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-semibold">3,890</span>
                <span className="text-muted-foreground text-xs">points</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Users className="h-4 w-4 text-accent" />
                <span className="font-semibold">5</span>
                <span className="text-muted-foreground text-xs">friends</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {[
                    { label: "Problems Solved", value: "127" },
                    { label: "Challenges Won", value: "34" },
                    { label: "Win Rate", value: "68%" },
                    { label: "Longest Streak", value: "34 days" },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-3 rounded-lg bg-secondary/30">
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Language breakdown */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-accent" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {languageStats.map((l) => (
                    <div key={l.lang}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{l.lang}</span>
                        <span className="text-xs text-muted-foreground">{l.solved} solved</span>
                      </div>
                      <Progress value={l.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="md:col-span-2">
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-warm" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {badges.map((b) => (
                    <div
                      key={b.name}
                      className={`text-center p-3 rounded-xl border transition-all ${
                        b.earned
                          ? "bg-primary/5 border-primary/20"
                          : "bg-muted/10 border-border/30 opacity-40"
                      }`}
                    >
                      <span className="text-2xl">{b.emoji}</span>
                      <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">{b.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
