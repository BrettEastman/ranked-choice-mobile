import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Participant {
  id: string;
  user_id: string;
  display_name: string;
  has_voted: boolean;
  joined_at: string;
}

interface PollStatus {
  status: "setup" | "voting" | "closed";
}

export function useRealtimePoll(pollId: string | null) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pollStatus, setPollStatus] = useState<PollStatus>({ status: "setup" });
  const [loading, setLoading] = useState(true);

  // Fetch participants with display names
  const fetchParticipants = useCallback(async () => {
    if (!pollId) return;

    const { data, error } = await supabase
      .from("poll_participants")
      .select("id, user_id, has_voted, joined_at, profiles(display_name)")
      .eq("poll_id", pollId)
      .order("joined_at");

    if (error) {
      console.error("Error fetching participants:", error);
      return;
    }

    const mapped: Participant[] = (data ?? []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      display_name: row.profiles?.display_name ?? "Unknown",
      has_voted: row.has_voted,
      joined_at: row.joined_at,
    }));

    setParticipants(mapped);
    setLoading(false);
  }, [pollId]);

  // Fetch poll status
  const fetchPollStatus = useCallback(async () => {
    if (!pollId) return;

    const { data, error } = await supabase
      .from("polls")
      .select("status")
      .eq("id", pollId)
      .single();

    if (error) {
      console.error("Error fetching poll status:", error);
      return;
    }

    if (data) {
      setPollStatus({ status: data.status as PollStatus["status"] });
    }
  }, [pollId]);

  useEffect(() => {
    if (!pollId) return;

    // Initial fetch
    fetchParticipants();
    fetchPollStatus();

    // Subscribe to participant changes
    const participantChannel = supabase
      .channel(`poll-participants-${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poll_participants",
          filter: `poll_id=eq.${pollId}`,
        },
        () => {
          // Re-fetch on any change (insert, update)
          fetchParticipants();
        },
      )
      .subscribe();

    // Subscribe to poll status changes
    const pollChannel = supabase
      .channel(`poll-status-${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "polls",
          filter: `id=eq.${pollId}`,
        },
        (payload) => {
          if (payload.new && "status" in payload.new) {
            setPollStatus({
              status: payload.new.status as PollStatus["status"],
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantChannel);
      supabase.removeChannel(pollChannel);
    };
  }, [pollId, fetchParticipants, fetchPollStatus]);

  return {
    participants,
    pollStatus: pollStatus.status,
    loading,
    refetchParticipants: fetchParticipants,
  };
}
