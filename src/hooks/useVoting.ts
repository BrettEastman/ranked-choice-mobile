import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import {
  calculateWinner,
  candidateNamesFromArray,
} from '../lib/calculateWinner';

interface CandidateRow {
  id: string;
  name: string;
  position: number;
}

interface VoteRow {
  voter_id: string;
  candidate_id: string;
  rank: number;
}

export function useVoting() {
  const { user } = useAuth();

  /**
   * Submit a ballot for the current user.
   * @param pollId - The poll ID
   * @param rankedCandidateIds - Ordered array of candidate IDs (index 0 = 1st choice)
   */
  const submitVote = useCallback(
    async (pollId: string, rankedCandidateIds: string[]) => {
      if (!user) throw new Error('Must be signed in to vote');

      // Insert vote rows
      const voteRows = rankedCandidateIds.map((candidateId, index) => ({
        poll_id: pollId,
        voter_id: user.id,
        candidate_id: candidateId,
        rank: index + 1,
      }));

      const { error: voteError } = await supabase
        .from('votes')
        .insert(voteRows);

      if (voteError) throw voteError;

      // Mark participant as having voted
      const { error: updateError } = await supabase
        .from('poll_participants')
        .update({ has_voted: true })
        .eq('poll_id', pollId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    },
    [user]
  );

  /**
   * Check if the current user has already voted in a poll.
   */
  const checkHasVoted = useCallback(
    async (pollId: string): Promise<boolean> => {
      if (!user) return false;

      const { data } = await supabase
        .from('poll_participants')
        .select('has_voted')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .single();

      return data?.has_voted ?? false;
    },
    [user]
  );

  /**
   * Compute results for a poll: fetch all votes, run the RCV algorithm,
   * and store the result in poll_results.
   */
  const computeAndStoreResults = useCallback(
    async (pollId: string) => {
      // Fetch candidates
      const { data: candidates, error: candError } = await supabase
        .from('candidates')
        .select('*')
        .eq('poll_id', pollId)
        .order('position');

      if (candError) throw candError;

      const candidateList = candidates as CandidateRow[];

      // Fetch all votes for this poll
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('voter_id, candidate_id, rank')
        .eq('poll_id', pollId)
        .order('rank');

      if (votesError) throw votesError;

      const voteList = votes as VoteRow[];

      // Group votes into ballots (one ballot per voter)
      const ballotMap = new Map<string, string[]>();
      for (const vote of voteList) {
        if (!ballotMap.has(vote.voter_id)) {
          ballotMap.set(vote.voter_id, []);
        }
        ballotMap.get(vote.voter_id)!.push(vote.candidate_id);
      }

      const ballots = Array.from(ballotMap.values());

      // Build candidate name map
      const candidateNames = new Map<string, string>();
      for (const c of candidateList) {
        candidateNames.set(c.id, c.name);
      }

      // Run the algorithm
      const result = calculateWinner(candidateNames, ballots);

      // Store the result
      const { error: resultError } = await supabase
        .from('poll_results')
        .insert({
          poll_id: pollId,
          winner_name: result.winner,
          rounds_data: result.rounds,
          total_votes: result.totalVotes,
        });

      if (resultError) throw resultError;

      return result;
    },
    []
  );

  /**
   * Fetch stored results for a poll.
   */
  const fetchResults = useCallback(async (pollId: string) => {
    const { data, error } = await supabase
      .from('poll_results')
      .select('*')
      .eq('poll_id', pollId)
      .single();

    if (error) throw error;
    return data;
  }, []);

  return {
    submitVote,
    checkHasVoted,
    computeAndStoreResults,
    fetchResults,
  };
}
