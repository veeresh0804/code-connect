import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  problems_solved: number;
  challenges_won: number;
  challenges_lost: number;
  last_solved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrainScore {
  id: string;
  user_id: string;
  score: number;
  solve_speed_score: number;
  optimization_score: number;
  consistency_score: number;
  difficulty_score: number;
  strength: string | null;
  weakness: string | null;
  coding_personality: string | null;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [brainScore, setBrainScore] = useState<BrainScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            setProfile(profileData);

            const { data: brainData } = await supabase
              .from('brain_scores')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            setBrainScore(brainData);
          }, 0);
        } else {
          setProfile(null);
          setBrainScore(null);
        }
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
        emailRedirectTo: window.location.origin,
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    profile,
    brainScore,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
