import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Clock,
  CheckCircle2,
  Plus,
  TrendingUp,
  Brain,
  LogOut,
  MessageSquare,
  Award,
  BookOpen,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BattleWithDetails {
  id: string;
  challenger_id: string;
  opponent_id: string;
  problem_id: string;
  status: string;
  time_limit_seconds: number;
  challenger_passed: boolean | null;
  opponent_passed: boolean | null;
  winner_id: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  challenger?: { username: string; display_name: string | null };
  opponent?: { username: string; display_name: string | null };
  problem?: { title: string; difficulty: string };
}

interface FriendProfile {
  user_id: string;
  username: string;
  display_name: string | null;
  total_points: number;
  current_streak: number;
  problems_solved: number;
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string | null;
  total_points: number;
}

const difficultyColor: Record<string, string> = {
  Easy: "bg-primary/20 text-primary",
  Medium: "bg-warm/20 text-warm",
  Hard: "bg-destructive/20 text-destructive",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, brainScore, loading, signOut } = useAuthContext();
  const [battles, setBattles] = useState<BattleWithDetails[]>([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [streakData, setStreakData] = useState({
    current: 0,
    longest: 0,
    todaySolved: false,
    weekDays: [
      { day: "Mon", done: false },
      { day: "Tue", done: false },
      { day: "Wed", done: false },
      { day: "Thu", done: false },
      { day: "Fri", done: false },
      { day: "Sat", done: false },
      { day: "Sun", done: false },
    ],
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      // Load battles
      const battlesQuery = supabase
        .from("coding_battles")
        .select(`
          *,
          challenger:profiles!coding_battles_challenger_id_fkey(username, display_name),
          opponent:profiles!coding_battles_opponent_id_fkey(username, display_name),
          problem:problems(title, difficulty)
        `)
        .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(6);

      // Load friends
      const friendsQuery = supabase
        .from("friendships")
        .select(`
          friend_id,
          profiles!friendships_friend_id_fkey(user_id, username, display_name, total_points, current_streak, problems_solved)
        `)
        .eq("user_id", user.id)
        .eq("status", "accepted")
        .order("profiles.total_points", { ascending: false })
        .limit(5);

      // Load leaderboard
      const leaderboardQuery = supabase
        .from("profiles")
        .select("user_id, username, display_name, total_points")
        .order("total_points", { ascending: false })
        .limit(5);

      // Load streak history
      const streakQuery = supabase
        .from("streak_history")
        .select("date, problems_solved")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(7);

      const [battlesRes, friendsRes, leaderboardRes, streakRes] = await Promise.all([
        battlesQuery,
        friendsQuery,
        leaderboardQuery,
        streakQuery,
      ]);

      if (battlesRes.data) setBattles(battlesRes.data);
      
      if (friendsRes.data) {
        const friendProfiles = friendsRes.data.map(f => f.profiles).filter(Boolean);
        setFriends(friendProfiles);
      }
      
      if (leaderboardRes.data) setLeaderboard(leaderboardRes.data);

      // Process streak data
      if (streakRes.data && streakRes.data.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = streakRes.data.find(s => s.date === today);
        
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const weekDays = last7Days.map((date, i) => {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayOfWeek = new Date(date).getDay();
          const record = streakRes.data.find(s => s.date === date);
          return {
            day: dayNames[dayOfWeek],
            done: record ? record.problems_solved > 0 : false,
          };
        });

        setStreakData({
          current: profile?.current_streak || 0,
          longest: profile?.longest_streak || 0,
          todaySolved: todayRecord ? todayRecord.problems_solved > 0 : false,
          weekDays,
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const displayName = profile?.display_name || profile?.username || "ArivuCoder";
  const initials = displayName.slice(0, 2).toUpperCase();
  const currentStreak = profile?.current_streak ?? 0;
  const problemsSolved = profile?.problems_solved ?? 0;
  const totalPoints = profile?.total_points ?? 0;
  const challengesWon = profile?.challenges_won ?? 0;
  const brainScoreValue = brainScore?.score ?? 0;

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
      <header className="h-14 border-b border-border/60 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm">Arivu<span className="text-primary">Code</span></span>
        </Link>
        
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back, <span className="text-primary">{displayName}</span>!</h1>
          <p className="text-muted-foreground text-lg">Ready to solve some problems?</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-card/50 border-border/60">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-warm" />
                <span className="text-2xl font-bold">{currentStreak}</span>
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/60">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Code2 className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{problemsSolved}</span>
              </div>
              <p className="text-sm text-muted-foreground">Problems</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/60">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold">{totalPoints.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">Points</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/60">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold">{brainScoreValue}</span>
              </div>
              <p className="text-sm text-muted-foreground">Brain Score</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Streak Progress */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <Card className="bg-card/50 border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flame className="h-5 w-5 text-warm" />
                      Streak Progress
                    </CardTitle>
                    <Badge variant="secondary" className="bg-warm/20 text-warm">
                      {streakData.todaySolved ? "Today Done ✓" : "Solve Today!"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center gap-2 mb-4">
                    {streakData.weekDays.map((day, i) => (
                      <div key={i} className="text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                          day.done ? "bg-warm/20 text-warm border border-warm/30" : "bg-secondary/30 text-muted-foreground border border-border"
                        }`}>
                          {day.done ? "✓" : ""}
                        </div>
                        <span className="text-xs text-muted-foreground">{day.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Current: <span className="font-semibold text-warm">{currentStreak} days</span> • 
                      Longest: <span className="font-semibold">{streakData.longest} days</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Daily Challenge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Daily Challenge
                    </CardTitle>
                    <Badge className="bg-primary/20 text-primary">+20 Bonus</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-lg mb-1">Two Sum Challenge</p>
                      <p className="text-sm text-muted-foreground mb-3">Find two numbers that add up to target</p>
                      <Badge className="bg-primary/20 text-primary">Easy</Badge>
                    </div>
                    <Button className="glow-primary" asChild>
                      <Link to="/editor?daily=true">
                        Start Now <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Challenges */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <Card className="bg-card/50 border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Swords className="h-5 w-5 text-accent" />
                      Recent Battles
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/battles" className="text-primary text-sm">
                        View All <ChevronRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {battles.length === 0 && !loadingData ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No battles yet</p>
                    ) : (
                      battles.slice(0, 3).map((battle) => {
                        const isChallenger = battle.challenger_id === user?.id;
                        const opponent = isChallenger ? battle.opponent : battle.challenger;
                        const opponentName = opponent?.display_name || opponent?.username || "Unknown";
                        
                        const getTimeLeft = () => {
                          if (battle.status !== 'active' || !battle.started_at) return null;
                          const startTime = new Date(battle.started_at).getTime();
                          const timeLimit = battle.time_limit_seconds * 1000;
                          const endTime = startTime + timeLimit;
                          const now = Date.now();
                          const remaining = endTime - now;
                          
                          if (remaining <= 0) return "Expired";
                          
                          const hours = Math.floor(remaining / (1000 * 60 * 60));
                          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                          return `${hours}h ${minutes}m`;
                        };

                        const getResult = () => {
                          if (battle.winner_id === user?.id) return "won";
                          if (battle.winner_id && battle.winner_id !== user?.id) return "lost";
                          return null;
                        };

                        return (
                          <motion.div
                            key={battle.id}
                            whileHover={{ scale: 1.01 }}
                            className="p-3 rounded-lg border border-border/50 bg-card/20 hover:bg-card/40 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{battle.problem?.title || "Unknown Problem"}</span>
                                  <Badge className={`text-[10px] px-1.5 py-0.5 ${difficultyColor[battle.problem?.difficulty || "Easy"]}`}>
                                    {battle.problem?.difficulty || "Easy"}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  vs <span className="text-foreground font-medium">@{opponentName}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                {battle.status === "pending" || battle.status === "active" ? (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {getTimeLeft() || "Waiting"}
                                  </div>
                                ) : battle.status === "completed" ? (
                                  <div className="flex items-center gap-1">
                                    {getResult() === "won" ? (
                                      <CheckCircle2 className="h-4 w-4 text-primary" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full bg-muted border border-border" />
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Friends */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
              <Card className="bg-card/50 border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      Friends
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/friends" className="text-primary text-xs">
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {friends.length === 0 && !loadingData ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        <Link to="/friends" className="text-primary hover:underline">
                          Connect with friends
                        </Link>
                      </p>
                    ) : (
                      friends.slice(0, 4).map((friend, i) => {
                        const displayName = friend.display_name || friend.username;
                        const initials = displayName.slice(0, 2).toUpperCase();
                        
                        return (
                          <motion.div
                            key={friend.user_id}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/20 transition-all cursor-pointer"
                          >
                            <div className="relative">
                              <Avatar className="h-8 w-8 border border-border/50">
                                <AvatarFallback className="bg-secondary text-xs font-medium">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{displayName}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{friend.total_points} pts</span>
                                <span className="flex items-center gap-1">
                                  <Flame className="h-3 w-3 text-warm" />
                                  {friend.current_streak}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
              <Card className="bg-card/50 border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      Leaderboard
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/leaderboard" className="text-primary text-xs">
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => {
                      const isCurrentUser = entry.user_id === user?.id;
                      const displayName = entry.display_name || entry.username;
                      const rank = index + 1;
                      const badge = rank <= 3 ? ["👑", "🥈", "🥉"][rank - 1] : "";
                      
                      return (
                        <motion.div
                          key={entry.user_id}
                          whileHover={{ scale: 1.01 }}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer ${
                            isCurrentUser
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-secondary/20"
                          }`}
                        >
                          <div className="w-6 text-center">
                            <span className="text-lg">{badge || `#${rank}`}</span>
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isCurrentUser ? "text-primary" : ""}`}>
                              {isCurrentUser ? "You" : displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">{entry.total_points.toLocaleString()} points</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
              <Card className="bg-card/50 border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="h-auto p-3 flex-col gap-1" asChild>
                      <Link to="/problems">
                        <Code2 className="h-4 w-4" />
                        <span className="text-xs">Problems</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto p-3 flex-col gap-1" asChild>
                      <Link to="/battles">
                        <Swords className="h-4 w-4" />
                        <span className="text-xs">Battle</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto p-3 flex-col gap-1" asChild>
                      <Link to="/study-plan">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-xs">Study</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto p-3 flex-col gap-1" asChild>
                      <Link to="/snippets">
                        <FileCode className="h-4 w-4" />
                        <span className="text-xs">Snippets</span>
                      </Link>
                    </Button>
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