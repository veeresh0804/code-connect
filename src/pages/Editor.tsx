import { useState, useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

type Language = "python" | "c" | "cpp" | "java";

interface LanguageConfig {
  label: string;
  monacoId: string;
  defaultCode: string;
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

const problemInfo = {
  title: "Maximum Subarray",
  difficulty: "Medium",
  description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
};

const EditorPage = () => {
  const { user, profile } = useAuthContext();
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(languages.python.defaultCode);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(languages[lang].defaultCode);
    setOutput("");
  };

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput("");
    
    // Simulate execution with possible error
    setTimeout(() => {
      // Randomly simulate success or error for demo
      const hasError = Math.random() > 0.7;
      
      if (hasError) {
        const errorOutput = `$ Running ${languages[language].label}...\n\nTraceback (most recent call last):\n  File "main.py", line 8, in <module>\n    print(solve([-2, 1, -3, 4, -1, 2, 1, -5, 4]))\n  File "main.py", line 5, in solve\n    max_sum = max(max_sum, current)\nTypeError: 'int' object is not callable\n\n✗ Execution failed`;
        setOutput(errorOutput);
        setLastError("TypeError: 'int' object is not callable");
      } else {
        setOutput(
          `$ Running ${languages[language].label}...\n\n> Max subarray sum: 6\n\n✓ Execution completed in 0.042s\n✓ Memory used: 2.1 MB`
        );
        setLastError("");
      }
      setIsRunning(false);
    }, 1500);
  }, [language]);

  const handleReset = () => {
    setCode(languages[language].defaultCode);
    setOutput("");
    setDebugExplanation("");
    setLastError("");
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

      if (error) {
        throw error;
      }

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
  const hasError = output.includes("Error") || output.includes("error") || output.includes("failed");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-border/60 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Arivu<span className="text-primary">Code</span></span>
          </div>
          <div className="h-5 w-px bg-border" />
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">{problemInfo.title}</span>
          <Badge variant="secondary" className="bg-warm/20 text-warm text-[10px] hidden sm:flex">{problemInfo.difficulty}</Badge>
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

          <Button size="sm" className="glow-primary h-8 gap-1.5 text-xs px-4" onClick={handleRun} disabled={isRunning || !editorUnlocked}>
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? "Running..." : "Run Code"}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className={`flex-1 flex ${isFullscreen ? "flex-col" : "flex-col lg:flex-row"}`}>
        {/* Editor pane */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${isFullscreen ? "flex-1" : "flex-1 lg:flex-[3]"} border-b lg:border-b-0 lg:border-r border-border/60 relative`}>
          {/* Editor tab bar */}
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
                    <p className="text-sm text-muted-foreground">Before you start coding, describe your approach to solving this problem. This helps you think clearly and prevents copy-pasting.</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/60">
                      <div className="flex items-start gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-warm shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{problemInfo.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{problemInfo.description}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Your Approach <span className="text-muted-foreground text-xs">(min {minApproachLength} chars)</span>
                      </label>
                      <Textarea
                        placeholder="Describe your algorithm idea... For example: 'I will use Kadane's algorithm to track the maximum subarray sum by maintaining a running sum and resetting it when it becomes negative...'"
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
              {output && !hasError && (
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

            {/* Approach summary when unlocked */}
            {editorUnlocked && approach && !debugMentorOpen && (
              <div className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-accent">Your Approach</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{approach}</p>
              </div>
            )}

            {isRunning ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="font-mono">Compiling & executing...</span>
              </div>
            ) : output ? (
              <pre className={`text-sm font-mono whitespace-pre-wrap leading-relaxed ${hasError ? "text-destructive/90" : "text-foreground/90"}`}>{output}</pre>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Terminal className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground/50">
                    {editorUnlocked ? <>Click <span className="text-primary font-medium">Run Code</span> to see output</> : <>Write your approach to unlock the editor</>}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditorPage;
