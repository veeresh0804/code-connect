import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ThumbsUp, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Discussion {
  id: string;
  content: string;
  upvotes: number;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  username: string;
  display_name: string | null;
  replies: Discussion[];
}

interface ProblemDiscussionsProps {
  problemId: string;
  userId: string | null;
}

const formatTimeAgo = (dateString: string) => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function ProblemDiscussions({ problemId, userId }: ProblemDiscussionsProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    loadDiscussions();
  }, [problemId]);

  const loadDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from("problem_discussions")
        .select("*")
        .eq("problem_id", problemId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        setDiscussions([]);
        setLoading(false);
        return;
      }

      // Get user profiles
      const userIds = [...new Set(data.map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name")
        .in("user_id", userIds);

      const profileMap: Record<string, { username: string; display_name: string | null }> = {};
      profiles?.forEach(p => { profileMap[p.user_id] = p; });

      // Build tree structure
      const allDiscussions: Discussion[] = data.map(d => ({
        ...d,
        username: profileMap[d.user_id]?.username || "Unknown",
        display_name: profileMap[d.user_id]?.display_name || null,
        replies: [],
      }));

      const topLevel: Discussion[] = [];
      const replyMap: Record<string, Discussion[]> = {};

      allDiscussions.forEach(d => {
        if (d.parent_id) {
          if (!replyMap[d.parent_id]) replyMap[d.parent_id] = [];
          replyMap[d.parent_id].push(d);
        } else {
          topLevel.push(d);
        }
      });

      topLevel.forEach(d => {
        d.replies = (replyMap[d.id] || []).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });

      setDiscussions(topLevel);
    } catch (err) {
      console.error("Error loading discussions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!userId) {
      toast.error("Sign in to post");
      return;
    }
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const { error } = await supabase.from("problem_discussions").insert({
        problem_id: problemId,
        user_id: userId,
        content: newComment.trim(),
      });
      if (error) throw error;
      setNewComment("");
      toast.success("Comment posted!");
      loadDiscussions();
    } catch (err) {
      toast.error("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!userId) {
      toast.error("Sign in to reply");
      return;
    }
    if (!replyContent.trim()) return;

    setPosting(true);
    try {
      const { error } = await supabase.from("problem_discussions").insert({
        problem_id: problemId,
        user_id: userId,
        content: replyContent.trim(),
        parent_id: parentId,
      });
      if (error) throw error;
      setReplyTo(null);
      setReplyContent("");
      toast.success("Reply posted!");
      loadDiscussions();
    } catch (err) {
      toast.error("Failed to post reply");
    } finally {
      setPosting(false);
    }
  };

  const handleUpvote = async (discussionId: string) => {
    if (!userId) return;
    // Simple upvote - increment count
    const disc = [...discussions, ...discussions.flatMap(d => d.replies)].find(d => d.id === discussionId);
    if (!disc) return;

    await supabase
      .from("problem_discussions")
      .update({ upvotes: disc.upvotes + 1 })
      .eq("id", discussionId);

    loadDiscussions();
  };

  return (
    <div className="border-t border-border/60 mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-accent" />
          <span>Discussions ({discussions.length})</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {/* New comment input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Share your approach or ask a question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] text-xs bg-secondary/30 border-border/60 resize-none"
                />
                <Button
                  size="sm"
                  onClick={handlePost}
                  disabled={posting || !newComment.trim()}
                  className="self-end"
                >
                  {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              ) : discussions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No discussions yet. Be the first to comment!
                </p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {discussions.map((disc) => {
                    const displayName = disc.display_name || disc.username;
                    const initials = displayName.slice(0, 2).toUpperCase();

                    return (
                      <div key={disc.id} className="space-y-2">
                        <div className="flex gap-2">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarFallback className="bg-accent/10 text-accent text-[10px]">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{displayName}</span>
                              <span className="text-[10px] text-muted-foreground">{formatTimeAgo(disc.created_at)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{disc.content}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <button
                                onClick={() => handleUpvote(disc.id)}
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                              >
                                <ThumbsUp className="h-3 w-3" />
                                {disc.upvotes > 0 && disc.upvotes}
                              </button>
                              <button
                                onClick={() => setReplyTo(replyTo === disc.id ? null : disc.id)}
                                className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Replies */}
                        {disc.replies.length > 0 && (
                          <div className="ml-8 space-y-2 border-l border-border/40 pl-3">
                            {disc.replies.map((reply) => {
                              const replyName = reply.display_name || reply.username;
                              return (
                                <div key={reply.id} className="flex gap-2">
                                  <Avatar className="h-5 w-5 shrink-0">
                                    <AvatarFallback className="bg-secondary text-[8px]">
                                      {replyName.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-medium">{replyName}</span>
                                      <span className="text-[10px] text-muted-foreground">{formatTimeAgo(reply.created_at)}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{reply.content}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reply input */}
                        {replyTo === disc.id && (
                          <div className="ml-8 flex gap-2">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="min-h-[40px] text-xs bg-secondary/30 border-border/60 resize-none"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleReply(disc.id)}
                              disabled={posting || !replyContent.trim()}
                              className="self-end h-7"
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}