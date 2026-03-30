import { useCallback } from "react";
import { generateShareCode } from "../lib/shareCode";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";

interface CreatePollParams {
  title: string;
  description?: string;
  candidates: string[];
  maxRankChoices: number;
}

interface PollRow {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  share_code: string;
  status: string;
  max_rank_choices: number;
  created_at: string;
  closed_at: string | null;
}

interface CandidateRow {
  id: string;
  poll_id: string;
  name: string;
  position: number;
}

export function usePoll() {
  const { user } = useAuth();

  const createPoll = useCallback(
    async (params: CreatePollParams) => {
      if (!user) throw new Error("Must be signed in to create a poll");

      // Generate a unique share code (retry on collision)
      let shareCode = generateShareCode();
      let attempts = 0;
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from("polls")
          .select("id")
          .eq("share_code", shareCode)
          .single();

        if (!existing) break;
        shareCode = generateShareCode();
        attempts++;
      }

      // Insert the poll
      const { data: poll, error: pollError } = await supabase
        .from("polls")
        .insert({
          creator_id: user.id,
          title: params.title,
          description: params.description ?? null,
          share_code: shareCode,
          status: "setup",
          max_rank_choices: params.maxRankChoices,
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Insert candidates
      const candidateRows = params.candidates.map((name, index) => ({
        poll_id: (poll as PollRow).id,
        name,
        position: index,
      }));

      const { error: candidatesError } = await supabase
        .from("candidates")
        .insert(candidateRows);

      if (candidatesError) throw candidatesError;

      // Creator auto-joins as participant
      const { error: participantError } = await supabase
        .from("poll_participants")
        .insert({
          poll_id: (poll as PollRow).id,
          user_id: user.id,
        });

      if (participantError) throw participantError;

      return poll as PollRow;
    },
    [user],
  );

  const fetchPoll = useCallback(async (pollId: string) => {
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("*")
      .eq("id", pollId)
      .single();

    if (pollError) throw pollError;

    const { data: candidates, error: candidatesError } = await supabase
      .from("candidates")
      .select("*")
      .eq("poll_id", pollId)
      .order("position");

    if (candidatesError) throw candidatesError;

    return {
      poll: poll as PollRow,
      candidates: candidates as CandidateRow[],
    };
  }, []);

  const fetchUserPolls = useCallback(async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as PollRow[];
  }, [user]);

  const updatePollStatus = useCallback(
    async (pollId: string, status: "setup" | "voting" | "closed") => {
      const update: Record<string, unknown> = { status };
      if (status === "closed") {
        update.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("polls")
        .update(update)
        .eq("id", pollId);

      if (error) throw error;
    },
    [],
  );

  const lookupByShareCode = useCallback(async (shareCode: string) => {
    const { data, error } = await supabase
      .from("polls")
      .select("*, candidates(*)")
      .eq("share_code", shareCode.toUpperCase())
      .single();

    if (error) throw error;
    return data;
  }, []);

  return {
    createPoll,
    fetchPoll,
    fetchUserPolls,
    updatePollStatus,
    lookupByShareCode,
  };
}
