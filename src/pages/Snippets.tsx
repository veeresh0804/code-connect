import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Terminal,
  ArrowLeft,
  Code2,
  Plus,
  Search,
  Globe,
  Lock,
  Trash2,
  Edit3,
  Copy,
  Check,
  Loader2,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Snippet {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  is_public: boolean;
  tags: string[];
  created_at: string;
  user_id: string;
}

const Snippets = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [publicSnippets, setPublicSnippets] = useState<Snippet[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [isPublic, setIsPublic] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [myRes, pubRes] = await Promise.all([
        supabase.from("code_snippets").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("code_snippets").select("*").eq("is_public", true).neq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      setSnippets(myRes.data || []);
      setPublicSnippets(pubRes.data || []);
      setLoadingData(false);
    };
    load();
  }, [user]);

  const handleCreate = async () => {
    if (!user || !title || !code) {
      toast.error("Title and code are required");
      return;
    }
    setCreating(true);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const { data, error } = await supabase.from("code_snippets").insert({
        user_id: user.id,
        title,
        description: description || null,
        code,
        language,
        is_public: isPublic,
        tags,
      }).select().single();
      if (error) throw error;
      setSnippets((prev) => [data, ...prev]);
      setShowCreate(false);
      setTitle(""); setDescription(""); setCode(""); setTagsInput("");
      toast.success("Snippet saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("code_snippets").delete().eq("id", id);
    if (!error) {
      setSnippets((prev) => prev.filter((s) => s.id !== id));
      toast.success("Snippet deleted");
    }
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filterSnippets = (list: Snippet[]) =>
    list.filter((s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
        <Button className="gap-2 text-xs" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" /> New Snippet
        </Button>
      </header>

      <main className="container px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            Code <span className="text-gradient-primary">Snippets</span> 📝
          </h1>
          <p className="text-muted-foreground text-sm">Save and share useful code patterns</p>
        </motion.div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search snippets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-secondary/30 border-border/60" />
        </div>

        <Tabs defaultValue="mine">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/30 mb-4">
            <TabsTrigger value="mine" className="text-xs">My Snippets ({snippets.length})</TabsTrigger>
            <TabsTrigger value="public" className="text-xs">Community ({publicSnippets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="mine">
            <div className="space-y-3">
              {filterSnippets(snippets).map((s, i) => (
                <SnippetCard key={s.id} snippet={s} onCopy={handleCopy} copied={copied} onDelete={handleDelete} isOwner />
              ))}
              {snippets.length === 0 && !loadingData && (
                <div className="text-center py-12 text-muted-foreground">
                  <Code2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No snippets yet. Create your first one!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="public">
            <div className="space-y-3">
              {filterSnippets(publicSnippets).map((s) => (
                <SnippetCard key={s.id} snippet={s} onCopy={handleCopy} copied={copied} />
              ))}
              {publicSnippets.length === 0 && !loadingData && (
                <p className="text-center py-12 text-muted-foreground text-sm">No public snippets found</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border/60 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              New Code Snippet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-secondary/30 border-border/60" />
            <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-secondary/30 border-border/60" />
            <Textarea placeholder="Paste your code here..." value={code} onChange={(e) => setCode(e.target.value)} className="bg-secondary/30 border-border/60 font-mono text-sm min-h-[150px]" />
            <div className="flex gap-3">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-secondary/30 border-border/60 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Tags (comma-separated)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="flex-1 bg-secondary/30 border-border/60" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              <Label className="text-sm flex items-center gap-1.5">
                {isPublic ? <Globe className="h-3.5 w-3.5 text-primary" /> : <Lock className="h-3.5 w-3.5" />}
                {isPublic ? "Public" : "Private"}
              </Label>
            </div>
            <Button className="w-full gap-2" onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save Snippet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SnippetCard = ({ snippet, onCopy, copied, onDelete, isOwner }: { snippet: Snippet; onCopy: (id: string, code: string) => void; copied: string | null; onDelete?: (id: string) => void; isOwner?: boolean }) => (
  <Card className="bg-card/50 border-border/60 hover:border-primary/20 transition-colors">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-sm">{snippet.title}</p>
          {snippet.description && <p className="text-xs text-muted-foreground">{snippet.description}</p>}
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-[10px]">{snippet.language}</Badge>
          {snippet.is_public ? <Globe className="h-3 w-3 text-primary" /> : <Lock className="h-3 w-3 text-muted-foreground" />}
        </div>
      </div>
      <pre className="text-xs font-mono bg-background/50 rounded-lg p-3 overflow-x-auto max-h-32 border border-border/40">
        {snippet.code.slice(0, 300)}{snippet.code.length > 300 ? "..." : ""}
      </pre>
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-1 flex-wrap">
          {snippet.tags.map((t) => (
            <Badge key={t} variant="outline" className="text-[9px] border-border/40">
              <Tag className="h-2.5 w-2.5 mr-0.5" />{t}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onCopy(snippet.id, snippet.code)}>
            {copied === snippet.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          {isOwner && onDelete && (
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => onDelete(snippet.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Snippets;
