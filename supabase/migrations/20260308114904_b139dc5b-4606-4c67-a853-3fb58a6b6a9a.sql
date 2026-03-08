
-- Badges table (predefined badges)
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'award',
  color text NOT NULL DEFAULT 'primary',
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL DEFAULT 1,
  points_reward integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

-- User badges (earned badges)
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User badges viewable by everyone" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Daily challenge tracking
CREATE TABLE public.daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  bonus_points integer NOT NULL DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Daily challenges viewable by everyone" ON public.daily_challenges FOR SELECT USING (true);

-- Code snippets library
CREATE TABLE public.code_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  code text NOT NULL,
  language text NOT NULL DEFAULT 'python',
  is_public boolean NOT NULL DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public snippets viewable by everyone" ON public.code_snippets FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own snippets" ON public.code_snippets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snippets" ON public.code_snippets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own snippets" ON public.code_snippets FOR DELETE USING (auth.uid() = user_id);

-- Problem discussions
CREATE TABLE public.problem_discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES public.problem_discussions(id) ON DELETE CASCADE,
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.problem_discussions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Discussions viewable by everyone" ON public.problem_discussions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post" ON public.problem_discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.problem_discussions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.problem_discussions FOR DELETE USING (auth.uid() = user_id);

-- Problem hints
CREATE TABLE public.problem_hints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  hint_number integer NOT NULL DEFAULT 1,
  content text NOT NULL,
  points_deduction integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(problem_id, hint_number)
);

ALTER TABLE public.problem_hints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hints viewable by everyone" ON public.problem_hints FOR SELECT USING (true);

-- Hints used by users
CREATE TABLE public.user_hints_used (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  problem_id uuid REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  hint_number integer NOT NULL,
  used_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, problem_id, hint_number)
);

ALTER TABLE public.user_hints_used ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own hints" ON public.user_hints_used FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hints" ON public.user_hints_used FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI Study plans
CREATE TABLE public.study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own plan" ON public.study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plan" ON public.study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plan" ON public.study_plans FOR UPDATE USING (auth.uid() = user_id);

-- User settings/preferences
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  theme text NOT NULL DEFAULT 'dark',
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  show_online_status boolean NOT NULL DEFAULT true,
  profile_visibility text NOT NULL DEFAULT 'public',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Streak history (for heatmap)
CREATE TABLE public.streak_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  problems_solved integer NOT NULL DEFAULT 1,
  points_earned integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

ALTER TABLE public.streak_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Streak history viewable by everyone" ON public.streak_history FOR SELECT USING (true);
CREATE POLICY "Users can insert own history" ON public.streak_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own history" ON public.streak_history FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime on notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
