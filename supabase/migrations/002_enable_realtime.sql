-- Enable Realtime on tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE poll_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE polls;
