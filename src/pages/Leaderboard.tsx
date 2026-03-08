import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Terminal,
  ArrowLeft,
  Trophy,
  Flame,
  Swords,
  Medal,
  Crown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string | null;
  total_points: number;
  challenges_won: number;
  current_streak: number;
  problems_solved: number;
}

const rankBadges = ["👑", "🥈", "🥉"];

const Leaderboard = () => {
  const { user } = useAuthContext();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("points");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, total_points, challenges_won, current_streak, problems_solved")
        .order("total_points", { ascending: false })
        .limit(50);
      setEntries(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const sorted = [...entries].sort((a, b) => {
    if (tab === "points") return b.total_points - a.total_points;
    if (tab === "battles") return b.challenges_won - a.challenges_won;
    if (tab === "streak") return b.current_streak - a.current_streak;
    return 0;
  });

  const getValue = (e: LeaderboardEntry) => {
    if (tab === "points") return e.total_points;
    if (tab === "battles") return e.challenges_won;
    return e.current_streak;
  };

  const getLabel = () => {
    if (tab === "points") return "pts";
    if (tab === "battles") return "wins";
    return "days";
  };

  const getIcon = () => {
    if (tab === "points") return Trophy;
    if (tab === "battles") return Swords;
    return Flame;
  };

  const Icon = getIcon();

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

        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Problems", href: "/problems" },
            { label: "Battles", href: "/battles" },
          ].map((item) => (
            <Link key={item.label} to={item.href}>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">{item.label}</Button>
            </Link>
          ))}
          <Button variant="ghost" size="sm" className="text-xs text-primary">Leaderboard</Button>
        </nav>

        <Link to="/profile">
          <Avatar className="h-8 w-8 border border-primary/30 cursor-pointer hover:border-primary transition-colors">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">AC</AvatarFallback>
          </Avatar>
        </Link>
      </header>

      <main className="container px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            <span className="text-gradient-primary">Leaderboard</span> 🏆
          </h1>
          <p className="text-muted-foreground text-sm">Top coders ranked by performance</p>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/30">
            <TabsTrigger value="points" className="gap-1.5 text-xs">
              <Trophy className="h-3.5 w-3.5" />
              Points
            </TabsTrigger>
            <TabsTrigger value="battles" className="gap-1.5 text-xs">
              <Swords className="h-3.5 w-3.5" />
              Battles Won
            </TabsTrigger>
            <TabsTrigger value="streak" className="gap-1.5 text-xs">
              <Flame className="h-3.5 w-3.5" />
              Streak
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-3">
            {sorted.map((entry, index) => {
              const isCurrentUser = entry.user_id === user?.id;
              const rank = index + 1;
              const initials = (entry.display_name || entry.username).slice(0, 2).toUpperCase();

              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className={`bg-card/50 border-border/60 ${isCurrentUser ? "border-primary/40 bg-primary/5" : ""} hover:border-primary/20 transition-colors`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-8 text-center">
                        {rank <= 3 ? (
                          <span className="text-xl">{rankBadges[rank - 1]}</span>
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className={`h-10 w-10 border ${rank === 1 ? "border-[hsl(var(--warm))]" : "border-border/60"}`}>
                        <AvatarFallback className={`text-sm ${rank === 1 ? "bg-[hsl(var(--warm))]/20 text-[hsl(var(--warm))]" : "bg-accent/10 text-accent"}`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${isCurrentUser ? "text-primary" : ""}`}>
                          {entry.display_name || entry.username}
                          {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.problems_solved} problems solved
                        </p>
                      </div>

                      {/* Value */}
                      <div className="flex items-center gap-1.5 text-right">
                        <Icon className={`h-4 w-4 ${tab === "points" ? "text-primary" : tab === "battles" ? "text-accent" : "text-[hsl(var(--warm))]"}`} />
                        <span className="font-bold text-lg">{getValue(entry).toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">{getLabel()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {sorted.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No entries yet. Start coding to climb the ranks!
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
