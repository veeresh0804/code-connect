import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Swords,
  ArrowLeft,
  Clock,
  Trophy,
  Users,
  Search,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Timer,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Battle {
  id: string;
  challenger_id: string;
  opponent_id: string;
  problem_id: string;
  status: string;
  time_limit_seconds: number;
  challenger_passed: boolean;
  opponent_passed: boolean;
  winner_id: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  challenger_finished_at: string | null;
  opponent_finished_at: string | null;
}

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
}

interface Profile {
  user_id: string;
  username: string;
  display_name: string | null;
  total_points: number;
  challenges_won: number;
  challenges_lost: number;
}

const difficultyColor: Record<string, string> = {
  Easy: "bg-primary/20 text-primary",
  Medium: "bg-[hsl(var(--warm))]/20 text-[hsl(var(--warm))]",
  Hard: "bg-destructive/20 text-destructive",
};

const timeLimitOptions = [
  { value: 300, label: "5 min" },
  { value: 600, label: "10 min" },
  { value: 900, label: "15 min" },
  { value: 1200, label: "20 min" },
  { value: 1800, label: "30 min" },
];

const Battles = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuthContext();

  const [battles, setBattles] = useState<Battle[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [problemMap, setProblemMap] = useState<Record<string, Problem>>({});
  const [loadingBattles, setLoadingBattles] = useState(true);

  // Challenge modal
  const [showChallenge, setShowChallenge] = useState(false);
  const [opponentSearch, setOpponentSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<Profile | null>(null);
  const [selectedProblem, setSelectedProblem] = useState("");
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(900);
  const [creating, setCreating] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Load battles, problems
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const [battlesRes, problemsRes] = await Promise.all([
        supabase
          .from("coding_battles")
          .select("*")
          .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
          .order("created_at", { ascending: false }),
        supabase.from("problems").select("id, title, difficulty, category"),
      ]);

      if (battlesRes.data) {
        setBattles(battlesRes.data);
        // Fetch profiles for all users in battles
        const userIds = new Set<string>();
        battlesRes.data.forEach((b) => {
          userIds.add(b.challenger_id);
          userIds.add(b.opponent_id);
        });
        if (userIds.size > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("user_id, username, display_name, total_points, challenges_won, challenges_lost")
            .in("user_id", Array.from(userIds));
          if (profs) {
            const map: Record<string, Profile> = {};
            profs.forEach((p) => (map[p.user_id] = p));
            setProfiles(map);
          }
        }
      }

      if (problemsRes.data) {
        setProblems(problemsRes.data);
        const map: Record<string, Problem> = {};
        problemsRes.data.forEach((p) => (map[p.id] = p));
        setProblemMap(map);
      }

      setLoadingBattles(false);
    };

    loadData();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("battles-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "coding_battles" }, (payload) => {
        const battle = payload.new as Battle;
        if (battle.challenger_id === user.id || battle.opponent_id === user.id) {
          setBattles((prev) => {
            const exists = prev.findIndex((b) => b.id === battle.id);
            if (exists >= 0) {
              const updated = [...prev];
              updated[exists] = battle;
              return updated;
            }
            return [battle, ...prev];
          });

          if (payload.eventType === "INSERT" && battle.opponent_id === user.id) {
            toast.info("You've been challenged to a coding battle! ⚔️");
          }
          if (payload.eventType === "UPDATE" && battle.status === "completed" && battle.winner_id) {
            const won = battle.winner_id === user.id;
            toast[won ? "success" : "info"](won ? "You won the battle! 🏆" : "Battle completed!");
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Search for opponents
  const handleSearchOpponents = useCallback(async (query: string) => {
    setOpponentSearch(query);
    if (query.length < 2) { setSearchResults([]); return; }

    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, total_points, challenges_won, challenges_lost")
      .neq("user_id", user?.id || "")
      .ilike("username", `%${query}%`)
      .limit(5);

    setSearchResults(data || []);
    setSearching(false);
  }, [user]);

  // Create battle
  const handleCreateBattle = async () => {
    if (!user || !selectedOpponent || !selectedProblem) {
      toast.error("Select an opponent and a problem.");
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from("coding_battles").insert({
        challenger_id: user.id,
        opponent_id: selectedOpponent.user_id,
        problem_id: selectedProblem,
        time_limit_seconds: selectedTimeLimit,
        status: "pending",
      });

      if (error) throw error;

      toast.success(`Challenge sent to ${selectedOpponent.username}! ⚔️`);
      setShowChallenge(false);
      setSelectedOpponent(null);
      setSelectedProblem("");
      setOpponentSearch("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create battle");
    } finally {
      setCreating(false);
    }
  };

  // Accept battle
  const handleAcceptBattle = async (battle: Battle) => {
    try {
      const { error } = await supabase
        .from("coding_battles")
        .update({ status: "active", started_at: new Date().toISOString() })
        .eq("id", battle.id);

      if (error) throw error;
      toast.success("Battle started! Good luck! ⚡");
      navigate(`/editor?problem=${battle.problem_id}&battle=${battle.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to accept battle");
    }
  };

  // Enter active battle
  const handleEnterBattle = (battle: Battle) => {
    navigate(`/editor?problem=${battle.problem_id}&battle=${battle.id}`);
  };

  const getOpponentName = (battle: Battle) => {
    const opponentId = battle.challenger_id === user?.id ? battle.opponent_id : battle.challenger_id;
    return profiles[opponentId]?.username || "Unknown";
  };

  const getOpponentInitials = (battle: Battle) => {
    const name = getOpponentName(battle);
    return name.slice(0, 2).toUpperCase();
  };

  const pendingBattles = battles.filter((b) => b.status === "pending");
  const activeBattles = battles.filter((b) => b.status === "active");
  const completedBattles = battles.filter((b) => b.status === "completed");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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

        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Problems", href: "/problems" },
            { label: "Editor", href: "/editor" },
            { label: "Feed", href: "/feed" },
          ].map((item) => (
            <Link key={item.label} to={item.href}>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">{item.label}</Button>
            </Link>
          ))}
          <Button variant="ghost" size="sm" className="text-xs text-primary">Battles</Button>
        </nav>

        <Link to="/profile">
          <Avatar className="h-8 w-8 border border-primary/30 cursor-pointer hover:border-primary transition-colors">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {profile?.username?.slice(0, 2).toUpperCase() || "AC"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </header>

      <main className="container px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        {/* Title + CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Coding <span className="text-gradient-primary">Battles</span> ⚔️
            </h1>
            <p className="text-muted-foreground text-sm">Challenge friends, race against the clock</p>
          </div>
          <Button className="glow-primary gap-2" onClick={() => setShowChallenge(true)}>
            <Swords className="h-4 w-4" />
            New Challenge
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Won", value: profile?.challenges_won ?? 0, icon: Trophy, color: "text-primary" },
            { label: "Lost", value: profile?.challenges_lost ?? 0, icon: Shield, color: "text-destructive" },
            { label: "Active", value: activeBattles.length, icon: Zap, color: "text-accent" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card/50 border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Active Battles */}
        {activeBattles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              Active Battles
            </h2>
            <div className="space-y-3">
              {activeBattles.map((battle) => (
                <BattleCard
                  key={battle.id}
                  battle={battle}
                  userId={user?.id || ""}
                  opponent={getOpponentName(battle)}
                  opponentInitials={getOpponentInitials(battle)}
                  problem={problemMap[battle.problem_id]}
                  onAction={() => handleEnterBattle(battle)}
                  actionLabel="Enter Battle"
                  actionIcon={<Play className="h-3.5 w-3.5" />}
                  showTimer
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Pending Battles */}
        {pendingBattles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[hsl(var(--warm))]" />
              Pending Challenges
            </h2>
            <div className="space-y-3">
              {pendingBattles.map((battle) => {
                const isChallenger = battle.challenger_id === user?.id;
                return (
                  <BattleCard
                    key={battle.id}
                    battle={battle}
                    userId={user?.id || ""}
                    opponent={getOpponentName(battle)}
                    opponentInitials={getOpponentInitials(battle)}
                    problem={problemMap[battle.problem_id]}
                    onAction={isChallenger ? undefined : () => handleAcceptBattle(battle)}
                    actionLabel={isChallenger ? "Waiting..." : "Accept"}
                    actionIcon={isChallenger ? <Clock className="h-3.5 w-3.5" /> : <Swords className="h-3.5 w-3.5" />}
                    actionDisabled={isChallenger}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Completed Battles */}
        {completedBattles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Completed
            </h2>
            <div className="space-y-3">
              {completedBattles.map((battle) => {
                const won = battle.winner_id === user?.id;
                return (
                  <BattleCard
                    key={battle.id}
                    battle={battle}
                    userId={user?.id || ""}
                    opponent={getOpponentName(battle)}
                    opponentInitials={getOpponentInitials(battle)}
                    problem={problemMap[battle.problem_id]}
                    resultBadge={
                      <Badge className={`text-[10px] ${won ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
                        {won ? "Won ✓" : "Lost"}
                      </Badge>
                    }
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {battles.length === 0 && !loadingBattles && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Swords className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No battles yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Challenge a friend to start your first coding battle!</p>
            <Button className="glow-primary gap-2" onClick={() => setShowChallenge(true)}>
              <Swords className="h-4 w-4" />
              Send First Challenge
            </Button>
          </motion.div>
        )}

        {loadingBattles && (
          <div className="text-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </div>
        )}
      </main>

      {/* Challenge Dialog */}
      <Dialog open={showChallenge} onOpenChange={setShowChallenge}>
        <DialogContent className="bg-card border-border/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-accent" />
              New Coding Battle
            </DialogTitle>
            <DialogDescription>
              Choose an opponent, a problem, and a time limit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Opponent search */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Find Opponent</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by username..."
                  value={opponentSearch}
                  onChange={(e) => handleSearchOpponents(e.target.value)}
                  className="pl-8 h-9 text-sm bg-secondary/30 border-border/60"
                />
              </div>
              {searching && <p className="text-xs text-muted-foreground mt-1">Searching...</p>}

              {searchResults.length > 0 && !selectedOpponent && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.user_id}
                      onClick={() => { setSelectedOpponent(p); setSearchResults([]); }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-accent/10 text-accent text-[10px]">
                          {p.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.display_name || p.username}</p>
                        <p className="text-[10px] text-muted-foreground">{p.total_points} pts · {p.challenges_won}W/{p.challenges_lost}L</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedOpponent && (
                <div className="mt-2 flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/30">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                      {selectedOpponent.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedOpponent.display_name || selectedOpponent.username}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setSelectedOpponent(null); setOpponentSearch(""); }}>
                    Change
                  </Button>
                </div>
              )}
            </div>

            {/* Problem selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Select Problem</label>
              <Select value={selectedProblem} onValueChange={setSelectedProblem}>
                <SelectTrigger className="h-9 text-sm bg-secondary/30 border-border/60">
                  <SelectValue placeholder="Choose a problem..." />
                </SelectTrigger>
                <SelectContent>
                  {problems.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-sm">
                      <span className="flex items-center gap-2">
                        {p.title}
                        <Badge variant="secondary" className={`text-[9px] ${difficultyColor[p.difficulty] || ""}`}>
                          {p.difficulty}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time limit */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Time Limit</label>
              <Select value={String(selectedTimeLimit)} onValueChange={(v) => setSelectedTimeLimit(Number(v))}>
                <SelectTrigger className="h-9 text-sm bg-secondary/30 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeLimitOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)} className="text-sm">
                      <span className="flex items-center gap-2">
                        <Timer className="h-3 w-3" />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full glow-primary gap-2"
              onClick={handleCreateBattle}
              disabled={creating || !selectedOpponent || !selectedProblem}
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
              Send Challenge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Battle card component
interface BattleCardProps {
  battle: Battle;
  userId: string;
  opponent: string;
  opponentInitials: string;
  problem?: Problem;
  onAction?: () => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  actionDisabled?: boolean;
  resultBadge?: React.ReactNode;
  showTimer?: boolean;
}

const BattleCard = ({ battle, userId, opponent, opponentInitials, problem, onAction, actionLabel, actionIcon, actionDisabled, resultBadge, showTimer }: BattleCardProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!showTimer || !battle.started_at) return;

    const interval = setInterval(() => {
      const start = new Date(battle.started_at!).getTime();
      const end = start + battle.time_limit_seconds * 1000;
      const now = Date.now();
      const remaining = Math.max(0, end - now);

      if (remaining <= 0) {
        setTimeLeft("Time's up!");
        clearInterval(interval);
        return;
      }

      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer, battle.started_at, battle.time_limit_seconds]);

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/60 hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-border/60">
          <AvatarFallback className="bg-accent/10 text-accent text-sm">{opponentInitials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">vs {opponent}</span>
            {showTimer && timeLeft && (
              <Badge variant="outline" className="border-accent/40 text-accent text-[10px] gap-1 animate-pulse">
                <Timer className="h-3 w-3" />
                {timeLeft}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {problem && (
              <>
                <span className="text-xs text-muted-foreground">{problem.title}</span>
                <Badge variant="secondary" className={`text-[9px] ${difficultyColor[problem.difficulty] || ""}`}>
                  {problem.difficulty}
                </Badge>
              </>
            )}
            <span className="text-[10px] text-muted-foreground">
              {Math.floor(battle.time_limit_seconds / 60)}min
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {resultBadge}
        {onAction && (
          <Button
            size="sm"
            className={`gap-1.5 text-xs ${!actionDisabled ? "glow-primary" : ""}`}
            onClick={onAction}
            disabled={actionDisabled}
            variant={actionDisabled ? "outline" : "default"}
          >
            {actionIcon}
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Battles;
