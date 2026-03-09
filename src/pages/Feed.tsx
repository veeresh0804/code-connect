import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Terminal,
  Heart,
  MessageCircle,
  Swords,
  Trophy,
  Flame,
  Award,
  Users,
  Code2,
  Send,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeedItem {
  id: string;
  user_id: string;
  username: string;
  initials: string;
  activity_type: string;
  title: string;
  description: string | null;
  points: number;
  created_at: string;
  likes: number;
  comments: number;
  liked: boolean;
}

const activityIcons: Record<string, any> = {
  solve: Code2,
  streak: Flame,
  challenge_won: Trophy,
  challenge_lost: Swords,
  badge_earned: Award,
  friend_added: Users,
};

const activityColors: Record<string, string> = {
  solve: "text-primary",
  streak: "text-warm",
  challenge_won: "text-primary",
  challenge_lost: "text-destructive",
  badge_earned: "text-accent",
  friend_added: "text-primary",
};

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

const Feed = () => {
  const { user, profile } = useAuthContext();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFeed();
  }, [user]);

  const loadFeed = async () => {
    try {
      // Fetch activities
      const { data: activities, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!activities || activities.length === 0) {
        setFeed([]);
        setLoadingFeed(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(activities.map(a => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name")
        .in("user_id", userIds);

      const profileMap: Record<string, { username: string; display_name: string | null }> = {};
      profiles?.forEach(p => { profileMap[p.user_id] = p; });

      // Get like counts and user likes
      const activityIds = activities.map(a => a.id);
      const [likesRes, userLikesRes, commentsRes] = await Promise.all([
        supabase.from("activity_likes").select("activity_id").in("activity_id", activityIds),
        user
          ? supabase.from("activity_likes").select("activity_id").eq("user_id", user.id).in("activity_id", activityIds)
          : Promise.resolve({ data: [] }),
        supabase.from("activity_comments").select("activity_id").in("activity_id", activityIds),
      ]);

      // Count likes per activity
      const likeCounts: Record<string, number> = {};
      likesRes.data?.forEach(l => { likeCounts[l.activity_id] = (likeCounts[l.activity_id] || 0) + 1; });

      const userLikedSet = new Set(userLikesRes.data?.map(l => l.activity_id) || []);

      // Count comments per activity
      const commentCounts: Record<string, number> = {};
      commentsRes.data?.forEach(c => { commentCounts[c.activity_id] = (commentCounts[c.activity_id] || 0) + 1; });

      const feedItems: FeedItem[] = activities.map(a => {
        const prof = profileMap[a.user_id];
        const displayName = prof?.display_name || prof?.username || "Unknown";
        return {
          id: a.id,
          user_id: a.user_id,
          username: displayName,
          initials: displayName.slice(0, 2).toUpperCase(),
          activity_type: a.activity_type,
          title: a.title,
          description: a.description,
          points: a.points || 0,
          created_at: a.created_at,
          likes: likeCounts[a.id] || 0,
          comments: commentCounts[a.id] || 0,
          liked: userLikedSet.has(a.id),
        };
      });

      setFeed(feedItems);
    } catch (err) {
      console.error("Error loading feed:", err);
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleLike = async (id: string) => {
    if (!user) {
      toast.error("Sign in to like posts");
      return;
    }

    const item = feed.find(f => f.id === id);
    if (!item) return;

    if (item.liked) {
      // Unlike
      await supabase.from("activity_likes").delete().eq("activity_id", id).eq("user_id", user.id);
      setFeed(prev => prev.map(f => f.id === id ? { ...f, liked: false, likes: f.likes - 1 } : f));
    } else {
      // Like
      await supabase.from("activity_likes").insert({ activity_id: id, user_id: user.id });
      setFeed(prev => prev.map(f => f.id === id ? { ...f, liked: true, likes: f.likes + 1 } : f));
    }
  };

  const handleComment = async (id: string) => {
    if (!user) {
      toast.error("Sign in to comment");
      return;
    }

    const content = commentInputs[id]?.trim();
    if (!content) return;

    const { error } = await supabase.from("activity_comments").insert({
      activity_id: id,
      user_id: user.id,
      content,
    });

    if (error) {
      toast.error("Failed to post comment");
      return;
    }

    setFeed(prev => prev.map(f => f.id === id ? { ...f, comments: f.comments + 1 } : f));
    setCommentInputs(prev => ({ ...prev, [id]: "" }));
    toast.success("Comment posted!");
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
        
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-xs">Dashboard</Button>
          </Link>
          <Link to="/editor">
            <Button variant="ghost" size="sm" className="text-xs">Editor</Button>
          </Link>
          <Button variant="ghost" size="sm" className="text-xs text-primary">Feed</Button>
        </nav>

        <Link to="/profile">
          <Avatar className="h-8 w-8 border border-primary/30 cursor-pointer hover:border-primary transition-colors">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {profile?.username?.slice(0, 2).toUpperCase() || "AC"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </header>

      <main className="container px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold mb-1">
            Social <span className="text-gradient-primary">Feed</span>
          </h1>
          <p className="text-muted-foreground text-sm">See what your friends are coding</p>
        </motion.div>

        {loadingFeed ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : feed.length === 0 ? (
          <Card className="bg-card/50 border-border/60">
            <CardContent className="p-8 text-center">
              <Code2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No activity yet. Start solving problems to see your feed!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feed.map((item, index) => {
              const Icon = activityIcons[item.activity_type] || Code2;
              const iconColor = activityColors[item.activity_type] || "text-primary";
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-card/50 border-border/60 hover:border-primary/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-10 w-10 border border-border/60">
                          <AvatarFallback className="bg-accent/10 text-accent text-sm">
                            {item.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{item.username}</span>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(item.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Icon className={`h-4 w-4 ${iconColor}`} />
                            <span className="text-sm">{item.title}</span>
                          </div>
                        </div>
                        {item.points > 0 && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs shrink-0">
                            +{item.points} pts
                          </Badge>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-4 ml-13 pl-10">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 ml-13 pl-10">
                        <button
                          onClick={() => handleLike(item.id)}
                          className={`flex items-center gap-1.5 text-sm transition-colors ${
                            item.liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${item.liked ? "fill-current" : ""}`} />
                          <span>{item.likes}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>{item.comments}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-4 ml-13 pl-10">
                        <Input
                          placeholder="Write a comment..."
                          value={commentInputs[item.id] || ""}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleComment(item.id)}
                          className="h-8 text-xs bg-secondary/30 border-border/60"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleComment(item.id)}
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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

export default Feed;