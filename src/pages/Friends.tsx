import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Terminal,
  ArrowLeft,
  Users,
  Search,
  UserPlus,
  UserCheck,
  Clock,
  X,
  Trophy,
  Flame,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FriendProfile {
  user_id: string;
  username: string;
  display_name: string | null;
  total_points: number;
  current_streak: number;
  problems_solved: number;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
}

const Friends = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [profiles, setProfiles] = useState<Record<string, FriendProfile>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: fs } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (fs) {
        setFriendships(fs);
        const ids = new Set<string>();
        fs.forEach((f) => { ids.add(f.user_id); ids.add(f.friend_id); });
        ids.delete(user.id);
        if (ids.size > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("user_id, username, display_name, total_points, current_streak, problems_solved")
            .in("user_id", Array.from(ids));
          if (profs) {
            const map: Record<string, FriendProfile> = {};
            profs.forEach((p) => (map[p.user_id] = p));
            setProfiles(map);
          }
        }
      }
      setLoadingData(false);
    };
    load();
  }, [user]);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, total_points, current_streak, problems_solved")
      .neq("user_id", user?.id || "")
      .ilike("username", `%${q}%`)
      .limit(10);
    setSearchResults(data || []);
    setSearching(false);
  };

  const handleAddFriend = async (friendId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: friendId,
        status: "pending",
      });
      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: friendId,
        type: "friend_request",
        title: "Friend Request",
        message: `${user.user_metadata?.username || "Someone"} sent you a friend request`,
      });

      toast.success("Friend request sent!");
      setFriendships((prev) => [...prev, { id: "temp", user_id: user.id, friend_id: friendId, status: "pending", created_at: new Date().toISOString() }]);
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    }
  };

  const handleAccept = async (friendship: Friendship) => {
    try {
      const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendship.id);
      if (error) throw error;
      setFriendships((prev) => prev.map((f) => (f.id === friendship.id ? { ...f, status: "accepted" } : f)));
      toast.success("Friend added!");
    } catch (err: any) {
      toast.error(err.message || "Failed to accept");
    }
  };

  const getFriendId = (f: Friendship) => (f.user_id === user?.id ? f.friend_id : f.user_id);

  const accepted = friendships.filter((f) => f.status === "accepted");
  const pendingReceived = friendships.filter((f) => f.status === "pending" && f.friend_id === user?.id);
  const pendingSent = friendships.filter((f) => f.status === "pending" && f.user_id === user?.id);
  const friendIds = new Set(friendships.map((f) => getFriendId(f)));

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
        <Badge variant="outline" className="gap-1.5">
          <Users className="h-3 w-3" />
          {accepted.length} friends
        </Badge>
      </header>

      <main className="container px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            <span className="text-gradient-primary">Friends</span> 👥
          </h1>
          <p className="text-muted-foreground text-sm">Connect with fellow coders</p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-secondary/30 border-border/60"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-xs text-muted-foreground">Search Results</p>
            {searchResults.map((p) => (
              <Card key={p.user_id} className="bg-card/50 border-border/60">
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-accent/10 text-accent text-xs">{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.display_name || p.username}</p>
                    <p className="text-[10px] text-muted-foreground">{p.total_points} pts · {p.problems_solved} solved</p>
                  </div>
                  {friendIds.has(p.user_id) ? (
                    <Badge variant="secondary" className="text-[10px]">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Added
                    </Badge>
                  ) : (
                    <Button size="sm" className="gap-1 text-xs" onClick={() => handleAddFriend(p.user_id)}>
                      <UserPlus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Tabs defaultValue="friends">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/30 mb-4">
            <TabsTrigger value="friends" className="text-xs">Friends ({accepted.length})</TabsTrigger>
            <TabsTrigger value="requests" className="text-xs">Requests ({pendingReceived.length})</TabsTrigger>
            <TabsTrigger value="sent" className="text-xs">Sent ({pendingSent.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <div className="space-y-2">
              {accepted.map((f) => {
                const p = profiles[getFriendId(f)];
                if (!p) return null;
                return (
                  <Card key={f.id} className="bg-card/50 border-border/60">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.display_name || p.username}</p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-primary" />{p.total_points}</span>
                          <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-[hsl(var(--warm))]" />{p.current_streak}d</span>
                        </div>
                      </div>
                      <Link to={`/battles`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1">
                          Challenge
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
              {accepted.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No friends yet. Search and add some!</p>}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <div className="space-y-2">
              {pendingReceived.map((f) => {
                const p = profiles[getFriendId(f)];
                if (!p) return null;
                return (
                  <Card key={f.id} className="bg-card/50 border-border/60">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-accent/10 text-accent text-xs">{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.display_name || p.username}</p>
                      </div>
                      <Button size="sm" className="text-xs gap-1" onClick={() => handleAccept(f)}>
                        <UserCheck className="h-3.5 w-3.5" /> Accept
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              {pendingReceived.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No pending requests</p>}
            </div>
          </TabsContent>

          <TabsContent value="sent">
            <div className="space-y-2">
              {pendingSent.map((f) => {
                const p = profiles[getFriendId(f)];
                if (!p) return null;
                return (
                  <Card key={f.id} className="bg-card/50 border-border/60">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.display_name || p.username}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        <Clock className="h-3 w-3 mr-1" /> Pending
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
              {pendingSent.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No pending sent requests</p>}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Friends;
