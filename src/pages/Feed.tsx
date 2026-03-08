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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Mock data for initial display
const mockFeedData = [
  {
    id: "1",
    user: { username: "Kavi", initials: "KV" },
    activity_type: "solve",
    title: "Solved 'Two Sum' in Python",
    description: "First try! Used a hashmap approach.",
    points: 50,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: 12,
    comments: 3,
    liked: false,
  },
  {
    id: "2",
    user: { username: "Priya", initials: "PR" },
    activity_type: "streak",
    title: "🔥 Reached 30-day streak!",
    description: "Consistency is key. One problem a day keeps the bugs away.",
    points: 200,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 45,
    comments: 8,
    liked: true,
  },
  {
    id: "3",
    user: { username: "Ravi", initials: "RV" },
    activity_type: "challenge_won",
    title: "Won a challenge against @Arun",
    description: "Binary Search - solved in 4:32 minutes!",
    points: 100,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: 23,
    comments: 5,
    liked: false,
  },
  {
    id: "4",
    user: { username: "Deepa", initials: "DP" },
    activity_type: "badge_earned",
    title: "Earned the 'Speed Demon' badge ⚡",
    description: "Solved 10 problems under 5 minutes each.",
    points: 150,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    likes: 67,
    comments: 12,
    liked: true,
  },
  {
    id: "5",
    user: { username: "Arun", initials: "AR" },
    activity_type: "solve",
    title: "Cracked 'Graph Traversal' (Hard)",
    description: "DFS + memoization. Took 3 attempts but finally got it!",
    points: 150,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likes: 34,
    comments: 7,
    liked: false,
  },
];

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
  const [feed, setFeed] = useState(mockFeedData);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleLike = (id: string) => {
    setFeed(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, liked: !item.liked, likes: item.liked ? item.likes - 1 : item.likes + 1 }
          : item
      )
    );
  };

  const handleComment = (id: string) => {
    const comment = commentInputs[id]?.trim();
    if (!comment) return;
    
    setFeed(prev =>
      prev.map(item =>
        item.id === id ? { ...item, comments: item.comments + 1 } : item
      )
    );
    setCommentInputs(prev => ({ ...prev, [id]: "" }));
  };

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

        {/* Feed items */}
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
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-10 w-10 border border-border/60">
                        <AvatarFallback className="bg-accent/10 text-accent text-sm">
                          {item.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{item.user.username}</span>
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

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-4 ml-13 pl-10">
                        {item.description}
                      </p>
                    )}

                    {/* Actions */}
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
                      <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors">
                        <Swords className="h-4 w-4" />
                        <span className="text-xs">Challenge</span>
                      </button>
                    </div>

                    {/* Comment input */}
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
      </main>
    </div>
  );
};

export default Feed;
