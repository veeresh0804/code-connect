import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code2,
  Search,
  Filter,
  ChevronRight,
  Zap,
  Target,
  Trophy,
  Clock,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  created_at: string;
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-primary/20 text-primary border-primary/30",
  Medium: "bg-warm/20 text-warm border-warm/30",
  Hard: "bg-destructive/20 text-destructive border-destructive/30",
};

const difficultyIcons: Record<string, React.ReactNode> = {
  Easy: <Zap className="h-3 w-3" />,
  Medium: <Target className="h-3 w-3" />,
  Hard: <Flame className="h-3 w-3" />,
};

const ProblemsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProblems();
    if (user) {
      fetchSolvedProblems();
    }
  }, [user]);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setProblems(data || []);
    } catch (err) {
      console.error("Error fetching problems:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolvedProblems = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("problem_id")
        .eq("user_id", user.id)
        .eq("status", "accepted");

      if (error) throw error;
      const solved = new Set(data?.map((s) => s.problem_id).filter(Boolean) as string[]);
      setSolvedProblems(solved);
    } catch (err) {
      console.error("Error fetching solved problems:", err);
    }
  };

  const categories = [...new Set(problems.map((p) => p.category))];

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "all" || problem.difficulty === difficultyFilter;
    const matchesCategory =
      categoryFilter === "all" || problem.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const stats = {
    total: problems.length,
    easy: problems.filter((p) => p.difficulty === "Easy").length,
    medium: problems.filter((p) => p.difficulty === "Medium").length,
    hard: problems.filter((p) => p.difficulty === "Hard").length,
    solved: solvedProblems.size,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">
                Arivu<span className="text-primary">Code</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5">
              <Trophy className="h-3 w-3 text-warm" />
              {stats.solved} Solved
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Problems</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.easy}</p>
                <p className="text-xs text-muted-foreground">Easy</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warm/10">
                <Target className="h-5 w-5 text-warm" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.medium}</p>
                <p className="text-xs text-muted-foreground">Medium</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Flame className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.hard}</p>
                <p className="text-xs text-muted-foreground">Hard</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/30 border-border/60"
            />
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-secondary/30 border-border/60">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-secondary/30 border-border/60">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Problems List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading problems...
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <Code2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No problems found</p>
            </div>
          ) : (
            filteredProblems.map((problem, index) => {
              const isSolved = solvedProblems.has(problem.id);
              return (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="bg-card/50 border-border/60 hover:border-primary/40 transition-all cursor-pointer group"
                    onClick={() => navigate(`/editor?problem=${problem.id}`)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="shrink-0">
                        {isSolved ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                            {problem.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`shrink-0 text-[10px] gap-1 ${
                              difficultyColors[problem.difficulty]
                            }`}
                          >
                            {difficultyIcons[problem.difficulty]}
                            {problem.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {problem.description}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-secondary/50"
                        >
                          {problem.category}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default ProblemsPage;
