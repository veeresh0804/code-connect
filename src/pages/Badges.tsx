import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Terminal,
  ArrowLeft,
  Award,
  Lock,
  Trophy,
  Flame,
  Swords,
  Zap,
  Brain,
  Users,
  MessageCircle,
  Target,
  Crown,
  Code2,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

const iconMap: Record<string, any> = {
  target: Target, trophy: Trophy, flame: Flame, swords: Swords, sword: Swords,
  zap: Zap, brain: Brain, users: Users, crown: Crown, code: Code2,
  coins: Coins, award: Award, "message-circle": MessageCircle,
};

const colorMap: Record<string, string> = {
  primary: "text-primary bg-primary/10 border-primary/30",
  accent: "text-accent bg-accent/10 border-accent/30",
  warm: "text-[hsl(var(--warm))] bg-[hsl(var(--warm))]/10 border-[hsl(var(--warm))]/30",
};

const Badges = () => {
  const { user, profile, brainScore } = useAuthContext();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [badgesRes, earnedRes] = await Promise.all([
        supabase.from("badges").select("*").order("requirement_value"),
        user ? supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user.id) : Promise.resolve({ data: [] }),
      ]);
      setBadges((badgesRes.data as BadgeData[]) || []);
      setEarned(new Set((earnedRes.data as UserBadge[])?.map((b) => b.badge_id) || []));
      setLoading(false);
    };
    load();
  }, [user]);

  // Check and award badges
  useEffect(() => {
    if (!user || !profile || badges.length === 0) return;

    const checkBadges = async () => {
      const stats: Record<string, number> = {
        problems_solved: profile.problems_solved || 0,
        current_streak: profile.current_streak || 0,
        challenges_won: profile.challenges_won || 0,
        total_points: profile.total_points || 0,
        brain_score: brainScore?.score || 0,
      };

      for (const badge of badges) {
        if (earned.has(badge.id)) continue;
        const val = stats[badge.requirement_type];
        if (val !== undefined && val >= badge.requirement_value) {
          await supabase.from("user_badges").insert({ user_id: user.id, badge_id: badge.id });
          setEarned((prev) => new Set([...prev, badge.id]));
        }
      }
    };
    checkBadges();
  }, [user, profile, brainScore, badges, earned]);

  const earnedCount = badges.filter((b) => earned.has(b.id)).length;
  const progress = badges.length > 0 ? Math.round((earnedCount / badges.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
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
        <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
          <Award className="h-3 w-3" />
          {earnedCount}/{badges.length}
        </Badge>
      </header>

      <main className="container px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            <span className="text-gradient-primary">Achievements</span> 🏅
          </h1>
          <p className="text-muted-foreground text-sm">Earn badges by reaching milestones</p>
          <div className="mt-4 flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm font-medium text-primary">{progress}%</span>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading badges...</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {badges.map((badge, i) => {
              const isEarned = earned.has(badge.id);
              const Icon = iconMap[badge.icon] || Award;
              const colors = colorMap[badge.color] || colorMap.primary;

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={`bg-card/50 border-border/60 transition-all ${isEarned ? "hover:border-primary/40" : "opacity-50"}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isEarned ? colors : "bg-muted/20 border-border/40 text-muted-foreground"}`}>
                        {isEarned ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        {!isEarned && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Requires: {badge.requirement_value} {badge.requirement_type.replace(/_/g, " ")}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className={`text-[10px] shrink-0 ${isEarned ? "bg-primary/10 text-primary" : "bg-muted/20"}`}>
                        +{badge.points_reward} pts
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Badges;
