import { create } from 'zustand';
import { LocalPoll, LocalVoter, PollResult } from '../types';
import {
  calculateWinner,
  candidateNamesFromArray,
} from '../lib/calculateWinner';
import { supabase } from '../lib/supabase';
import { generateShareCode } from '../lib/shareCode';
import { limits } from '../lib/constants';

interface PollState {
  // Current poll being created/voted on
  currentPoll: LocalPoll | null;
  voters: LocalVoter[];
  currentVoterIndex: number;
  supabasePollId: string | null;
  shareCode: string | null;

  // Draft state for creating a poll
  draftTitle: string;
  draftDescription: string;
  draftCandidates: string[];
  draftMaxRankChoices: number;
  draftVoterNames: string[];

  // Actions - draft
  setDraftTitle: (title: string) => void;
  setDraftDescription: (description: string) => void;
  addDraftCandidate: (name: string) => void;
  removeDraftCandidate: (index: number) => void;
  updateDraftCandidate: (index: number, name: string) => void;
  setDraftMaxRankChoices: (count: number) => void;
  addDraftVoter: (name: string) => void;
  removeDraftVoter: (index: number) => void;
  updateDraftVoter: (index: number, name: string) => void;

  // Actions - poll lifecycle
  createPoll: () => Promise<void>;
  submitBallot: (rankedCandidates: string[]) => void;
  advanceToNextVoter: () => void;
  closePoll: () => void;
  resetPoll: () => void;
}

export const usePollStore = create<PollState>((set, get) => ({
  currentPoll: null,
  voters: [],
  currentVoterIndex: 0,
  supabasePollId: null,
  shareCode: null,

  draftTitle: '',
  draftDescription: '',
  draftCandidates: ['', '', ''],
  draftMaxRankChoices: limits.defaultMaxRankChoices,
  draftVoterNames: ['', '', ''],

  setDraftTitle: (title) => set({ draftTitle: title }),
  setDraftDescription: (description) => set({ draftDescription: description }),

  addDraftCandidate: (name) =>
    set((state) => ({
      draftCandidates: [...state.draftCandidates, name],
    })),

  removeDraftCandidate: (index) =>
    set((state) => ({
      draftCandidates: state.draftCandidates.filter((_, i) => i !== index),
    })),

  updateDraftCandidate: (index, name) =>
    set((state) => ({
      draftCandidates: state.draftCandidates.map((c, i) =>
        i === index ? name : c
      ),
    })),

  setDraftMaxRankChoices: (count) => set({ draftMaxRankChoices: count }),

  addDraftVoter: (name) =>
    set((state) => ({
      draftVoterNames: [...state.draftVoterNames, name],
    })),

  removeDraftVoter: (index) =>
    set((state) => ({
      draftVoterNames: state.draftVoterNames.filter((_, i) => i !== index),
    })),

  updateDraftVoter: (index, name) =>
    set((state) => ({
      draftVoterNames: state.draftVoterNames.map((v, i) =>
        i === index ? name : v
      ),
    })),

  createPoll: async () => {
    const state = get();
    const candidates = state.draftCandidates.filter((c) => c.trim() !== '');

    if (candidates.length < limits.minCandidates) return;

    const maxRank = Math.min(
      state.draftMaxRankChoices,
      candidates.length - 1
    );

    const title = state.draftTitle || 'Untitled Poll';
    const description = state.draftDescription.trim() || null;

    // Persist to Supabase
    let supabasePollId: string | null = null;
    let shareCode: string | null = null;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        shareCode = generateShareCode();

        const { data: poll, error: pollError } = await supabase
          .from('polls')
          .insert({
            creator_id: user.id,
            title,
            description,
            share_code: shareCode,
            status: 'setup',
            max_rank_choices: maxRank,
          })
          .select()
          .single();

        if (pollError) {
          console.error('Error creating poll in Supabase:', pollError);
        } else if (poll) {
          supabasePollId = poll.id;

          // Insert candidates
          const candidateRows = candidates.map((name, index) => ({
            poll_id: poll.id,
            name,
            position: index,
          }));

          const { error: candError } = await supabase
            .from('candidates')
            .insert(candidateRows);

          if (candError) {
            console.error('Error inserting candidates:', candError);
          }

          // Creator joins as participant
          const { error: partError } = await supabase
            .from('poll_participants')
            .insert({
              poll_id: poll.id,
              user_id: user.id,
            });

          if (partError) {
            console.error('Error joining poll:', partError);
          }
        }
      }
    } catch (err) {
      console.error('Supabase poll creation failed:', err);
    }

    // Set local state
    const poll: LocalPoll = {
      id: supabasePollId ?? String(Date.now()),
      title,
      candidates,
      maxRankChoices: maxRank,
      ballots: [],
      status: 'setup',
    };

    set({
      currentPoll: poll,
      voters: [],
      currentVoterIndex: 0,
      supabasePollId,
      shareCode,
    });
  },

  submitBallot: (rankedCandidates) => {
    const state = get();
    if (!state.currentPoll) return;

    set({
      currentPoll: {
        ...state.currentPoll,
        ballots: [...state.currentPoll.ballots, rankedCandidates],
      },
      voters: state.voters.map((v, i) =>
        i === state.currentVoterIndex ? { ...v, hasVoted: true } : v
      ),
    });
  },

  advanceToNextVoter: () => {
    const state = get();
    const nextIndex = state.currentVoterIndex + 1;
    if (nextIndex < state.voters.length) {
      set({ currentVoterIndex: nextIndex });
    }
  },

  closePoll: () => {
    const state = get();
    if (!state.currentPoll) return;

    const candidateNames = candidateNamesFromArray(
      state.currentPoll.candidates
    );
    const result: PollResult = calculateWinner(
      candidateNames,
      state.currentPoll.ballots
    );

    set({
      currentPoll: {
        ...state.currentPoll,
        status: 'closed',
        result,
      },
    });

    // Persist results to Supabase
    if (state.supabasePollId) {
      (async () => {
        try {
          // Update poll status
          await supabase
            .from('polls')
            .update({ status: 'closed', closed_at: new Date().toISOString() })
            .eq('id', state.supabasePollId);

          // Store computed results
          await supabase.from('poll_results').insert({
            poll_id: state.supabasePollId,
            winner_name: result.winner,
            rounds_data: result.rounds,
            total_votes: result.totalVotes,
          });
        } catch (err) {
          console.error('Error saving results to Supabase:', err);
        }
      })();
    }
  },

  resetPoll: () =>
    set({
      currentPoll: null,
      voters: [],
      currentVoterIndex: 0,
      supabasePollId: null,
      shareCode: null,
      draftTitle: '',
      draftDescription: '',
      draftCandidates: ['', '', ''],
      draftMaxRankChoices: limits.defaultMaxRankChoices,
      draftVoterNames: ['', '', ''],
    }),
}));
