
CREATE TABLE public.coding_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL,
  opponent_id uuid NOT NULL,
  problem_id uuid REFERENCES public.problems(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  time_limit_seconds integer NOT NULL DEFAULT 900,
  challenger_code text,
  opponent_code text,
  challenger_finished_at timestamptz,
  opponent_finished_at timestamptz,
  challenger_passed boolean DEFAULT false,
  opponent_passed boolean DEFAULT false,
  winner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz
);

ALTER TABLE public.coding_battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view battles they're part of" ON public.coding_battles
  FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can insert battles as challenger" ON public.coding_battles
  FOR INSERT WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update battles they're part of" ON public.coding_battles
  FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.coding_battles;
