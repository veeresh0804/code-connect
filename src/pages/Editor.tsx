import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Play,
  RotateCcw,
  Copy,
  Check,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Loader2,
  Lightbulb,
  Lock,
  Unlock,
  Brain,
  CheckCircle2,
  Bot,
  Sparkles,
  X,
  Save,
  FlaskConical,
  Timer,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ProblemDiscussions } from "@/components/ProblemDiscussions";

type Language = "python" | "c" | "cpp" | "java";

interface LanguageConfig {
  label: string;
  monacoId: string;
  defaultCode: string;
}

interface TestCase {
  input: string;
  expected: string;
}

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const languages: Record<Language, LanguageConfig> = {
  python: {
    label: "Python",
    monacoId: "python",
    defaultCode: `# ArivuCode — Python Challenge\n\ndef solve(nums):\n    """Find the maximum subarray sum."""\n    max_sum = current = nums[0]\n    for n in nums[1:]:\n        current = max(n, current + n)\n        max_sum = max(max_sum, current)\n    return max_sum\n\n# Test\nprint(solve([-2, 1, -3, 4, -1, 2, 1, -5, 4]))\n`,
  },
  c: {
    label: "C",
    monacoId: "c",
    defaultCode: `// ArivuCode — C Challenge\n#include <stdio.h>\n\nint main() {\n    int nums[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};\n    int n = sizeof(nums) / sizeof(nums[0]);\n    int max_sum = nums[0], current = nums[0];\n\n    for (int i = 1; i < n; i++) {\n        current = (nums[i] > current + nums[i]) ? nums[i] : current + nums[i];\n        max_sum = (max_sum > current) ? max_sum : current;\n    }\n\n    printf("Max subarray sum: %d\\n", max_sum);\n    return 0;\n}\n`,
  },
  cpp: {
    label: "C++",
    monacoId: "cpp",
    defaultCode: `// ArivuCode — C++ Challenge\n#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};\n    int max_sum = nums[0], current = nums[0];\n\n    for (int i = 1; i < nums.size(); i++) {\n        current = max(nums[i], current + nums[i]);\n        max_sum = max(max_sum, current);\n    }\n\n    cout << "Max subarray sum: " << max_sum << endl;\n    return 0;\n}\n`,
  },
  java: {
    label: "Java",
    monacoId: "java",
    defaultCode: `// ArivuCode — Java Challenge\npublic class Solution {\n    public static void main(String[] args) {\n        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};\n        int maxSum = nums[0], current = nums[0];\n\n        for (int i = 1; i < nums.length; i++) {\n            current = Math.max(nums[i], current + nums[i]);\n            maxSum = Math.max(maxSum, current);\n        }\n\n        System.out.println("Max subarray sum: " + maxSum);\n    }\n}\n`,
  },
};

const EditorPage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(languages.python.defaultCode);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Problem state
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get("problem");
  const battleId = searchParams.get("battle");
  const [problemTitle, setProblemTitle] = useState("Maximum Subarray");
  const [problemDifficulty, setProblemDifficulty] = useState("Medium");
  const [problemDescription, setProblemDescription] = useState(
    "Given an integer array nums, find the subarray with the largest sum, and return its sum."
  );
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submissionSaved, setSubmissionSaved] = useState(false);

  // Thinking Mode state
  const [thinkingMode, setThinkingMode] = useState(true);
  const [approach, setApproach] = useState("");
  const [editorUnlocked, setEditorUnlocked] = useState(false);
  const minApproachLength = 50;

  // AI Debug Mentor state
  const [debugMentorOpen, setDebugMentorOpen] = useState(false);
  const [debugExplanation, setDebugExplanation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastError, setLastError] = useState("");

  // Battle mode state
  const [battleTimeLeft, setBattleTimeLeft] = useState<string>("");
  const [battleTimeLimitSec, setBattleTimeLimitSec] = useState(900);
  const [battleStartedAt, setBattleStartedAt] = useState<string | null>(null);
  const [battleEnded, setBattleEnded] = useState(false);
  const [submittingBattle, setSubmittingBattle] = useState(false);
  const battleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Battle timer
  useEffect(() => {
    if (!battleId || !battleStartedAt) return;
    battleTimerRef.current = setInterval(() => {
      const start = new Date(battleStartedAt).getTime();
      const end = start + battleTimeLimitSec * 1000;
      const remaining = Math.max(0, end - Date.now());
      if (remaining <= 0) {
        setBattleTimeLeft("Time's up!");
        setBattleEnded(true);
        if (battleTimerRef.current) clearInterval(battleTimerRef.current);
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setBattleTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => { if (battleTimerRef.current) clearInterval(battleTimerRef.current); };
  }, [battleId, battleStartedAt, battleTimeLimitSec]);

  // Load problem from database
  useEffect(() => {
    if (problemId) {
      const loadProblem = async () => {
        const { data, error } = await supabase
          .from("problems")
          .select("*")
          .eq("id", problemId)
          .single();
        if (data && !error) {
          setProblemTitle(data.title);
          setProblemDifficulty(data.difficulty);
          setProblemDescription(data.description);
          const cases = (data.test_cases as unknown as TestCase[]) || [];
          setTestCases(cases);
        }
      };
      loadProblem();
    }
  }, [problemId]);

  // Load battle info
  useEffect(() => {
    if (!battleId) return;
    const loadBattle = async () => {
      const { data } = await supabase
        .from("coding_battles")
        .select("*")
        .eq("id", battleId)
        .single();
      if (data) {
        setBattleStartedAt(data.started_at);
        setBattleTimeLimitSec(data.time_limit_seconds);
        if (data.status === "completed") setBattleEnded(true);
      }
    };
    loadBattle();
  }, [battleId]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(languages[lang].defaultCode);
    setOutput("");
    setTestResults([]);
    setSubmissionSaved(false);
  };

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput(`$ Running ${languages[language].label}...\n`);
    setTestResults([]);
    setSubmissionSaved(false);

    try {
      const { data, error } = await supabase.functions.invoke("code-runner", {
        body: { code, language },
      });

      if (error) throw error;

      if (data.success) {
        setOutput(
          `$ Running ${languages[language].label}...\n\n${data.output}\n\n✓ Execution completed in ${data.executionTime}s`
        );
        setLastError("");
      } else {
        const errorMsg = data.error || data.output || "Unknown error";
        setOutput(
          `$ Running ${languages[language].label}...\n\n${errorMsg}\n\n✗ Execution failed`
        );
        setLastError(errorMsg);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to execute code";
      setOutput(`$ Running ${languages[language].label}...\n\n${msg}\n\n✗ Execution failed`);
      setLastError(msg);
    } finally {
      setIsRunning(false);
    }
  }, [language, code]);

  const handleRunTests = useCallback(async () => {
    if (testCases.length === 0) {
      toast.info("No test cases available for this problem.");
      return;
    }

    setIsTesting(true);
    setTestResults([]);
    setOutput(`$ Running ${testCases.length} test cases...\n`);

    const results: TestResult[] = [];

    for (const tc of testCases) {
      try {
        const { data, error } = await supabase.functions.invoke("code-runner", {
          body: { code, language },
        });

        if (error) throw error;

        const actual = (data.output || data.error || "").trim();
        const expected = tc.expected.trim();
        const passed = actual.includes(expected) || expected.includes(actual);

        results.push({ input: tc.input, expected, actual, passed });
      } catch {
        results.push({ input: tc.input, expected: tc.expected, actual: "Error", passed: false });
      }
    }

    setTestResults(results);
    const passedCount = results.filter((r) => r.passed).length;
    const allPassed = passedCount === results.length;

    let outputStr = `$ Test Results: ${passedCount}/${results.length} passed\n\n`;
    results.forEach((r, i) => {
      outputStr += `${r.passed ? "✓" : "✗"} Test ${i + 1}: Input: ${r.input}\n`;
      outputStr += `  Expected: ${r.expected}\n`;
      outputStr += `  Got:      ${r.actual}\n\n`;
    });
    outputStr += allPassed ? "\n🎉 All test cases passed!" : "\n⚠ Some test cases failed.";

    setOutput(outputStr);
    setLastError(allPassed ? "" : "Some test cases failed");
    setIsTesting(false);

    if (allPassed) {
      toast.success("All test cases passed! 🎉");
    }
  }, [code, language, testCases]);

  const handleSaveSubmission = useCallback(async () => {
    if (!user) {
      toast.error("Please log in to save your submission.");
      return;
    }

    setIsSaving(true);
    try {
      const allPassed = testResults.length > 0 && testResults.every((r) => r.passed);
      const status = allPassed ? "accepted" : testResults.length > 0 ? "failed" : "pending";
      const points = allPassed
        ? problemDifficulty === "Easy" ? 10 : problemDifficulty === "Medium" ? 25 : 50
        : 0;

      const { error } = await supabase.from("submissions").insert({
        user_id: user.id,
        problem_id: problemId || undefined,
        code,
        language,
        approach,
        status,
        output: output.slice(0, 2000),
        points_earned: points,
      });

      if (error) throw error;

      // Update profile stats if accepted
      if (allPassed && user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("problems_solved, total_points")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              problems_solved: (profile.problems_solved || 0) + 1,
              total_points: (profile.total_points || 0) + points,
              last_solved_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        }

        // Post activity
        await supabase.from("activities").insert({
          user_id: user.id,
          activity_type: "solve",
          title: `Solved "${problemTitle}"`,
          description: `Solved in ${language} and earned ${points} points`,
          points,
        });
      }

      setSubmissionSaved(true);
      toast.success(
        allPassed
          ? `Submission saved! +${points} points 🎉`
          : "Submission saved."
      );
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save submission");
    } finally {
      setIsSaving(false);
    }
  }, [user, code, language, approach, output, problemId, problemTitle, problemDifficulty, testResults]);

  // Battle submit
  const handleBattleSubmit = useCallback(async () => {
    if (!user || !battleId) return;
    setSubmittingBattle(true);

    try {
      // Run tests first
      const results: TestResult[] = [];
      for (const tc of testCases) {
        try {
          const { data, error } = await supabase.functions.invoke("code-runner", {
            body: { code, language },
          });
          if (error) throw error;
          const actual = (data.output || data.error || "").trim();
          const expected = tc.expected.trim();
          const passed = actual.includes(expected) || expected.includes(actual);
          results.push({ input: tc.input, expected, actual, passed });
        } catch {
          results.push({ input: tc.input, expected: tc.expected, actual: "Error", passed: false });
        }
      }

      const allPassed = results.length > 0 && results.every((r) => r.passed);

      // Get current battle to check roles
      const { data: battle } = await supabase
        .from("coding_battles")
        .select("*")
        .eq("id", battleId)
        .single();

      if (!battle) throw new Error("Battle not found");

      const isChallenger = battle.challenger_id === user.id;
      const updateData: Record<string, any> = {};

      if (isChallenger) {
        updateData.challenger_code = code;
        updateData.challenger_finished_at = new Date().toISOString();
        updateData.challenger_passed = allPassed;
      } else {
        updateData.opponent_code = code;
        updateData.opponent_finished_at = new Date().toISOString();
        updateData.opponent_passed = allPassed;
      }

      // Check if opponent already finished to determine winner
      const opponentFinished = isChallenger ? battle.opponent_finished_at : battle.challenger_finished_at;
      const opponentPassed = isChallenger ? battle.opponent_passed : battle.challenger_passed;

      if (opponentFinished) {
        // Both done - determine winner
        let winnerId: string | null = null;
        if (allPassed && !opponentPassed) {
          winnerId = user.id;
        } else if (!allPassed && opponentPassed) {
          winnerId = isChallenger ? battle.opponent_id : battle.challenger_id;
        } else if (allPassed && opponentPassed) {
          // Both passed - faster wins
          const myTime = new Date().getTime();
          const theirTime = new Date(opponentFinished).getTime();
          winnerId = myTime <= theirTime ? user.id : (isChallenger ? battle.opponent_id : battle.challenger_id);
        }
        updateData.status = "completed";
        updateData.ended_at = new Date().toISOString();
        updateData.winner_id = winnerId;

        // Update profiles
        if (winnerId) {
          const loserId = winnerId === battle.challenger_id ? battle.opponent_id : battle.challenger_id;
          const { data: wp } = await supabase.from("profiles").select("challenges_won").eq("user_id", winnerId).single();
          const { data: lp } = await supabase.from("profiles").select("challenges_lost").eq("user_id", loserId).single();
          if (wp) await supabase.from("profiles").update({ challenges_won: (wp.challenges_won || 0) + 1 }).eq("user_id", winnerId);
          if (lp) await supabase.from("profiles").update({ challenges_lost: (lp.challenges_lost || 0) + 1 }).eq("user_id", loserId);
        }
      }

      const { error } = await supabase.from("coding_battles").update(updateData).eq("id", battleId);
      if (error) throw error;

      toast.success(allPassed ? "Solution submitted! All tests passed! 🎉" : "Solution submitted. Some tests failed.");
      setBattleEnded(true);

      // Post activity
      await supabase.from("activities").insert({
        user_id: user.id,
        activity_type: allPassed ? "challenge_won" : "challenge_lost",
        title: `Battle: "${problemTitle}"`,
        description: allPassed ? `Passed all tests in battle mode!` : `Attempted battle on "${problemTitle}"`,
        points: allPassed ? 50 : 0,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit battle solution");
    } finally {
      setSubmittingBattle(false);
    }
  }, [user, battleId, code, language, testCases, problemTitle]);

  const handleReset = () => {
    setCode(languages[language].defaultCode);
    setOutput("");
    setDebugExplanation("");
    setLastError("");
    setTestResults([]);
    setSubmissionSaved(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUnlockEditor = () => {
    if (approach.trim().length >= minApproachLength) {
      setEditorUnlocked(true);
      setThinkingMode(false);
    }
  };

  const handleAskDebugMentor = async () => {
    if (!lastError && !output.includes("Error") && !output.includes("error")) {
      toast.info("No errors detected. Run your code first to get AI debugging help!");
      return;
    }

    setIsAnalyzing(true);
    setDebugMentorOpen(true);
    setDebugExplanation("");

    try {
      const { data, error } = await supabase.functions.invoke("debug-mentor", {
        body: {
          code,
          error: lastError || output,
          language: languages[language].label,
        },
      });

      if (error) throw error;
      setDebugExplanation(data.explanation || "Unable to analyze the error.");
    } catch (err: any) {
      console.error("Debug mentor error:", err);
      toast.error(err.message || "Failed to analyze error");
      setDebugExplanation("Sorry, I couldn't analyze this error. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const approachProgress = Math.min((approach.trim().length / minApproachLength) * 100, 100);
  const canUnlock = approach.trim().length >= minApproachLength;
  const hasError = output.includes("✗") || output.includes("Error") || output.includes("error");
  const allTestsPassed = testResults.length > 0 && testResults.every((r) => r.passed);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-border/60 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link to={battleId ? "/battles" : problemId ? "/problems" : "/dashboard"} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Arivu<span className="text-primary">Code</span></span>
          </div>
          <div className="h-5 w-px bg-border" />
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">{problemTitle}</span>
          <Badge variant="secondary" className="bg-warm/20 text-warm text-[10px] hidden sm:flex">{problemDifficulty}</Badge>
          {battleId && battleTimeLeft && (
            <Badge variant="outline" className={`gap-1 text-[10px] ${battleTimeLeft === "Time's up!" ? "border-destructive/40 text-destructive" : "border-accent/40 text-accent animate-pulse"}`}>
              <Timer className="h-3 w-3" />
              {battleTimeLeft}
            </Badge>
          )}
          {battleId && (
            <Badge className="bg-accent/20 text-accent text-[10px] gap-1">
              <Swords className="h-3 w-3" />
              Battle Mode
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!editorUnlocked && (
            <Badge variant="outline" className="border-accent/40 text-accent text-[10px] gap-1">
              <Brain className="h-3 w-3" />
              Thinking Mode
            </Badge>
          )}
          {editorUnlocked && (
            <Badge variant="outline" className="border-primary/40 text-primary text-[10px] gap-1">
              <Unlock className="h-3 w-3" />
              Editor Unlocked
            </Badge>
          )}

          <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
            <SelectTrigger className="w-[130px] h-8 text-xs bg-secondary/50 border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(languages).map(([key, lang]) => (
                <SelectItem key={key} value={key} className="text-xs">{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} disabled={!editorUnlocked}>
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset} disabled={!editorUnlocked}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>

          {testCases.length > 0 && (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs px-3 border-accent/40 text-accent" onClick={handleRunTests} disabled={isTesting || !editorUnlocked}>
              {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
              Test
            </Button>
          )}

          <Button size="sm" className="glow-primary h-8 gap-1.5 text-xs px-4" onClick={handleRun} disabled={isRunning || !editorUnlocked}>
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? "Running..." : "Run"}
          </Button>

          {battleId && (
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs px-4 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleBattleSubmit}
              disabled={submittingBattle || battleEnded || !editorUnlocked}
            >
              {submittingBattle ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Swords className="h-3.5 w-3.5" />}
              {battleEnded ? "Submitted" : "Submit Battle"}
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className={`flex-1 flex ${isFullscreen ? "flex-col" : "flex-col lg:flex-row"}`}>
        {/* Editor pane */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${isFullscreen ? "flex-1" : "flex-1 lg:flex-[3]"} border-b lg:border-b-0 lg:border-r border-border/60 relative`}>
          <div className="h-9 border-b border-border/60 bg-card/30 flex items-center px-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-background/80 rounded-t-md border border-border/60 border-b-0 text-xs">
              <div className={`w-2 h-2 rounded-full ${editorUnlocked ? "bg-primary/60" : "bg-accent/60"}`} />
              <span className="font-mono text-muted-foreground">
                main.{language === "python" ? "py" : language === "java" ? "java" : language === "cpp" ? "cpp" : "c"}
              </span>
            </div>
          </div>

          {/* Thinking Mode Overlay */}
          <AnimatePresence>
            {!editorUnlocked && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6" style={{ top: "36px" }}>
                <Card className="max-w-lg w-full bg-card/80 border-accent/30 glow-accent">
                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Brain className="h-6 w-6 text-accent" />
                      <CardTitle className="text-xl">Thinking Mode</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">Before you start coding, describe your approach to solving this problem.</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/60">
                      <div className="flex items-start gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-warm shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{problemTitle}</p>
                          <p className="text-xs text-muted-foreground mt-1">{problemDescription}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Your Approach <span className="text-muted-foreground text-xs">(min {minApproachLength} chars)</span>
                      </label>
                      <Textarea
                        placeholder="Describe your algorithm idea..."
                        value={approach}
                        onChange={(e) => setApproach(e.target.value)}
                        className="min-h-[120px] bg-secondary/30 border-border/60 text-sm"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex-1 bg-secondary/30 rounded-full h-2 mr-3">
                          <motion.div className={`h-full rounded-full transition-colors ${canUnlock ? "bg-primary" : "bg-accent"}`} initial={{ width: 0 }} animate={{ width: `${approachProgress}%` }} />
                        </div>
                        <span className={`text-xs ${canUnlock ? "text-primary" : "text-muted-foreground"}`}>{approach.trim().length}/{minApproachLength}</span>
                      </div>
                    </div>

                    <Button className={`w-full gap-2 ${canUnlock ? "glow-primary" : ""}`} onClick={handleUnlockEditor} disabled={!canUnlock}>
                      {canUnlock ? <><Unlock className="h-4 w-4" />Unlock Editor</> : <><Lock className="h-4 w-4" />Write Your Approach First</>}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Editor
            height="calc(100% - 36px)"
            language={languages[language].monacoId}
            value={code}
            onChange={(v) => setCode(v || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              renderLineHighlight: "gutter",
              lineNumbers: "on",
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 8,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
              readOnly: !editorUnlocked,
            }}
          />
        </motion.div>

        {/* Output pane */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className={`${isFullscreen ? "h-48" : "flex-1 lg:flex-[1.2]"} flex flex-col bg-card/20`}>
          <div className="h-9 border-b border-border/60 bg-card/30 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Output</span>
            </div>
            <div className="flex items-center gap-2">
              {hasError && editorUnlocked && (
                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 border-accent/40 text-accent hover:bg-accent/10" onClick={handleAskDebugMentor}>
                  <Sparkles className="h-3 w-3" />
                  AI Debug Help
                </Button>
              )}
              {output && !hasError && editorUnlocked && !submissionSaved && (
                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 border-primary/40 text-primary hover:bg-primary/10" onClick={handleSaveSubmission} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Save Submission
                </Button>
              )}
              {submissionSaved && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-primary font-mono">saved</span>
                </div>
              )}
              {output && !hasError && !submissionSaved && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] text-primary font-mono">completed</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            {/* AI Debug Mentor Panel */}
            <AnimatePresence>
              {debugMentorOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
                  <Card className="bg-accent/5 border-accent/30">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-accent" />
                          <CardTitle className="text-sm">AI Debug Mentor</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDebugMentorOpen(false)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-accent" />
                          <span>Analyzing your code...</span>
                        </div>
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none text-sm">
                          <ReactMarkdown>{debugExplanation}</ReactMarkdown>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Test Results Summary */}
            {testResults.length > 0 && !debugMentorOpen && (
              <div className={`mb-4 p-3 rounded-lg border ${allTestsPassed ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className={`h-4 w-4 ${allTestsPassed ? "text-primary" : "text-destructive"}`} />
                  <span className={`text-xs font-medium ${allTestsPassed ? "text-primary" : "text-destructive"}`}>
                    {testResults.filter((r) => r.passed).length}/{testResults.length} Tests Passed
                  </span>
                </div>
                <div className="space-y-1">
                  {testResults.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {r.passed ? (
                        <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                      ) : (
                        <X className="h-3 w-3 text-destructive shrink-0" />
                      )}
                      <span className="text-muted-foreground truncate">
                        Test {i + 1}: {r.input}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approach summary when unlocked */}
            {editorUnlocked && approach && !debugMentorOpen && testResults.length === 0 && (
              <div className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-accent">Your Approach</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{approach}</p>
              </div>
            )}

            {isRunning || isTesting ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="font-mono">{isTesting ? "Running test cases..." : "Compiling & executing..."}</span>
              </div>
            ) : output ? (
              <pre className={`text-sm font-mono whitespace-pre-wrap leading-relaxed ${hasError ? "text-destructive/90" : "text-foreground/90"}`}>{output}</pre>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Terminal className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground/50">
                    {editorUnlocked ? <>Click <span className="text-primary font-medium">Run</span> to see output</> : <>Write your approach to unlock the editor</>}
                  </p>
                </div>
              </div>
            )}
            {/* Problem Discussions */}
            {problemId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card/50 rounded-lg border border-border/60 overflow-hidden"
              >
                <ProblemDiscussions
                  problemId={problemId}
                  userId={user?.id || null}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditorPage;
