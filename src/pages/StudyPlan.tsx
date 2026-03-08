import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Terminal,
  ArrowLeft,
  Brain,
  Loader2,
  RefreshCw,
  Target,
  BookOpen,
  Flame,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StudyTask {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_time: string;
  reason: string;
}

const StudyPlan = () => {
  const navigate = useNavigate();
  const { user, profile, brainScore, loading } = useAuthContext();
  const [plan, setPlan] = useState<StudyTask[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("study_plans")
      .select("plan, generated_at, valid_until")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data && new Date(data.valid_until) > new Date()) {
          setPlan((data.plan as unknown as StudyTask[]) || []);
        }
        setLoadingPlan(false);
      });
  }, [user]);

  const generatePlan = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("study-plan", {
        body: {
          brainScore: brainScore?.score || 0,
          strength: brainScore?.strength || "None",
          weakness: brainScore?.weakness || "All areas",
          problemsSolved: profile?.problems_solved || 0,
          currentStreak: profile?.current_streak || 0,
        },
      });
      if (error) throw error;

      const tasks = data.plan || [];
      setPlan(tasks);
      setCompletedTasks(new Set());

      // Save plan
      const { data: existing } = await supabase.from("study_plans").select("id").eq("user_id", user.id).single();
      const planData = {
        user_id: user.id,
        plan: tasks,
        generated_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      if (existing) {
        await supabase.from("study_plans").update(planData).eq("user_id", user.id);
      } else {
        await supabase.from("study_plans").insert(planData);
      }
      toast.success("Study plan generated! 🧠");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const progress = plan.length > 0 ? Math.round((completedTasks.size / plan.length) * 100) : 0;

  const diffColor: Record<string, string> = {
    Easy: "bg-primary/20 text-primary",
    Medium: "bg-[hsl(var(--warm))]/20 text-[hsl(var(--warm))]",
    Hard: "bg-destructive/20 text-destructive",
  };

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
        <Button
          onClick={generatePlan}
          disabled={generating}
          className="gap-2 text-xs"
          size="sm"
        >
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {plan.length > 0 ? "Regenerate" : "Generate Plan"}
        </Button>
      </header>

      <main className="container px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            AI <span className="text-gradient-primary">Study Plan</span> 🧠
          </h1>
          <p className="text-muted-foreground text-sm">Personalized weekly plan based on your brain score</p>

          {plan.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-sm font-medium text-primary">{progress}%</span>
            </div>
          )}
        </motion.div>

        {loadingPlan ? (
          <div className="text-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </div>
        ) : plan.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No study plan yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Generate an AI-powered plan tailored to your weaknesses</p>
            <Button onClick={generatePlan} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              Generate My Plan
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {plan.map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`bg-card/50 border-border/60 transition-all cursor-pointer ${completedTasks.has(i) ? "opacity-60 border-primary/30" : "hover:border-primary/20"}`}
                  onClick={() => toggleTask(i)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${completedTasks.has(i) ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                      {completedTasks.has(i) && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className={`font-medium text-sm ${completedTasks.has(i) ? "line-through" : ""}`}>{task.title}</p>
                        <Badge variant="secondary" className={`text-[9px] ${diffColor[task.difficulty] || ""}`}>{task.difficulty}</Badge>
                        <Badge variant="outline" className="text-[9px] border-border/40">{task.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{task.estimated_time}</span>
                        <span className="flex items-center gap-1"><Target className="h-3 w-3" />{task.reason}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyPlan;
