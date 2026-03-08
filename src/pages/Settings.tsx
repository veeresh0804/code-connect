import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Terminal,
  ArrowLeft,
  Settings as SettingsIcon,
  Bell,
  Eye,
  Shield,
  Save,
  Edit3,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuthContext();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  // Settings
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [showOnline, setShowOnline] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setEmailNotif(data.email_notifications);
          setPushNotif(data.push_notifications);
          setShowOnline(data.show_online_status);
          setProfileVisibility(data.profile_visibility);
        }
      });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, bio })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSavingSettings(true);
    try {
      const settings = {
        user_id: user.id,
        email_notifications: emailNotif,
        push_notifications: pushNotif,
        show_online_status: showOnline,
        profile_visibility: profileVisibility,
      };

      const { data: existing } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("user_settings")
          .update(settings)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_settings").insert(settings);
        if (error) throw error;
      }
      toast.success("Settings saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border/60 bg-card/50 backdrop-blur-xl flex items-center px-4 sm:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-5 w-px bg-border" />
          <Link to="/" className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Arivu<span className="text-primary">Code</span></span>
          </Link>
        </div>
      </header>

      <main className="container px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            <span className="text-gradient-primary">Settings</span> ⚙️
          </h1>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Edit */}
          <Card className="bg-card/50 border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-primary" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Display Name</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 bg-secondary/30 border-border/60" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 bg-secondary/30 border-border/60 min-h-[80px]" placeholder="Tell the world about your coding journey..." />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-card/50 border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Email Notifications</Label>
                <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Push Notifications</Label>
                <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="bg-card/50 border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-[hsl(var(--warm))]" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show Online Status</Label>
                <Switch checked={showOnline} onCheckedChange={setShowOnline} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Profile Visibility</Label>
                <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                  <SelectTrigger className="bg-secondary/30 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveSettings} disabled={savingSettings} className="gap-2">
                {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
