import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Terminal,
  Flame,
  Trophy,
  Code2,
  Settings,
  Edit3,
  Award,
  TrendingUp,
  Users,
  ArrowLeft,
  Brain,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const { user, profile, brainScore, loading, signOut } = useAuthContext();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const displayName = profile?.display_name || profile?.username || "ArivuCoder";
  const initials = displayName.slice(0, 2).toUpperCase();
  const currentStreak = profile?.current_streak ?? 12;
  const totalPoints = profile?.total_points ?? 3890;
  const problemsSolved = profile?.problems_solved ?? 127;
  const challengesWon = profile?.challenges_won ?? 34;
  const challengesLost = profile?.challenges_lost ?? 16;
  const longestStreak = profile?.longest_streak ?? 34;
  const winRate = challengesWon + challengesLost > 0 
    ? Math.round((challengesWon / (challengesWon + challengesLost)) * 100) 
    : 68;

  // Brain Score
  const brainScoreValue = brainScore?.score ?? 78;
  const strength = brainScore?.strength ?? "Arrays";
  const weakness = brainScore?.weakness ?? "Graph algorithms";
  const codingPersonality = brainScore?.coding_personality ?? "Optimizer";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Terminal className="h-8 w-8 text-primary mx-auto mb-3 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          <Link to="/settings">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5">
              <Settings className="h-3.5 w-3.5" /> Settings
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container px-4 sm:px-6 py-8 max-w-4xl mx-auto">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8"
        >
          <Avatar className="h-20 w-20 border-2 border-primary/30">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <Link to="/settings">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Edit3 className="h-3 w-3" /> Edit
                </Button>
              </Link>
            </div>
            <p className="text-muted-foreground text-sm mt-1">{profile?.bio || "Coding enthusiast"}</p>
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
              <div className="flex items-center gap-1.5 text-sm">
                <Flame className="h-4 w-4 text-warm" />
                <span className="font-semibold">{currentStreak}</span>
                <span className="text-muted-foreground text-xs">day streak</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-semibold">{totalPoints.toLocaleString()}</span>
                <span className="text-muted-foreground text-xs">points</span>
              </div>
              <Link to="/friends" className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
                <Users className="h-4 w-4 text-accent" />
                <span className="font-semibold">5</span>
                <span className="text-muted-foreground text-xs">friends</span>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Brain Score Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-accent" />
                  Brain Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  {/* Score circle */}
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r="40" fill="none" 
                        stroke="hsl(var(--accent))" strokeWidth="8" 
                        strokeDasharray={`${brainScoreValue * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-accent">{brainScoreValue}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">{codingPersonality}</Badge>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Strength:</span>
                      <span className="text-primary ml-1 font-medium">{strength}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Focus:</span>
                      <span className="text-warm ml-1 font-medium">{weakness}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Problems Solved", value: problemsSolved.toString() },
                    { label: "Challenges Won", value: challengesWon.toString() },
                    { label: "Win Rate", value: `${winRate}%` },
                    { label: "Longest Streak", value: `${longestStreak} days` },
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4 text-warm" />
                    Badges
                  </CardTitle>
                  <Link to="/badges">
                    <Button variant="ghost" size="sm" className="text-xs text-primary">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
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
