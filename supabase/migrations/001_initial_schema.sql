-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Polls
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  share_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'voting', 'closed')),
  max_rank_choices INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_polls_share_code ON polls(share_code);
CREATE INDEX idx_polls_creator ON polls(creator_id);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE(poll_id, position)
);

-- Poll participants (who joined the poll)
CREATE TABLE poll_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  has_voted BOOLEAN DEFAULT FALSE,
  UNIQUE(poll_id, user_id)
);

-- Votes (each row = one ranking by one voter for one candidate)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, voter_id, rank),
  UNIQUE(poll_id, voter_id, candidate_id)
);

-- Stored results (computed once when poll closes)
CREATE TABLE poll_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID UNIQUE NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  winner_name TEXT NOT NULL,
  rounds_data JSONB NOT NULL,
  total_votes INTEGER NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_results ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile, manage their own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Polls: viewable by any authenticated user (needed for share code lookups)
CREATE POLICY "Polls viewable by anyone authenticated"
  ON polls FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Creator can insert polls"
  ON polls FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creator can update polls"
  ON polls FOR UPDATE USING (creator_id = auth.uid());

-- Candidates: readable by poll participants, writable by poll creator
CREATE POLICY "Candidates viewable by poll participants"
  ON candidates FOR SELECT USING (
    poll_id IN (SELECT id FROM polls WHERE creator_id = auth.uid())
    OR poll_id IN (SELECT poll_id FROM poll_participants WHERE user_id = auth.uid())
  );
CREATE POLICY "Creator can manage candidates"
  ON candidates FOR INSERT WITH CHECK (
    poll_id IN (SELECT id FROM polls WHERE creator_id = auth.uid())
  );
CREATE POLICY "Creator can delete candidates"
  ON candidates FOR DELETE USING (
    poll_id IN (SELECT id FROM polls WHERE creator_id = auth.uid())
  );

-- Participants: can see own rows or rows in polls they created
CREATE POLICY "Participants viewable by self or poll creator"
  ON poll_participants FOR SELECT USING (
    user_id = auth.uid()
    OR poll_id IN (SELECT id FROM polls WHERE creator_id = auth.uid())
  );
CREATE POLICY "Users can join polls"
  ON poll_participants FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own participation"
  ON poll_participants FOR UPDATE USING (user_id = auth.uid());

-- Votes: voters can insert their own, creator can read all for tallying
CREATE POLICY "Users can cast votes"
  ON votes FOR INSERT WITH CHECK (voter_id = auth.uid());
CREATE POLICY "Votes readable by poll creator for tallying"
  ON votes FOR SELECT USING (
    poll_id IN (SELECT id FROM polls WHERE creator_id = auth.uid())
  );

-- Results: readable by creator and participants
CREATE POLICY "Results viewable by participants and creator"
  ON poll_results FOR SELECT USING (
    poll_id IN (SELECT poll_id FROM poll_participants WHERE user_id = auth.uid())
    OR poll_id IN (SELECT id FROM polls WHERE creator_id = auth.uid())
  );
CREATE POLICY "Creator can insert results"
  ON poll_results FOR INSERT WITH CHECK (
    poll_id IN (SELECT id FROM polls WHERE creator_id = auth.uid())
  );

-- ============================================================
-- Auto-create profile on signup (trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
