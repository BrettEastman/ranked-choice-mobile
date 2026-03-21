import { create } from 'zustand';
import { LocalPoll, LocalVoter, PollResult } from '../types';
import {
  calculateWinner,
  candidateNamesFromArray,
} from '../lib/calculateWinner';
import { limits } from '../lib/constants';

interface PollState {
  // Current poll being created/voted on
  currentPoll: LocalPoll | null;
  voters: LocalVoter[];
  currentVoterIndex: number;

  // Draft state for creating a poll
  draftTitle: string;
  draftCandidates: string[];
  draftMaxRankChoices: number;
  draftVoterNames: string[];

  // Actions - draft
  setDraftTitle: (title: string) => void;
  addDraftCandidate: (name: string) => void;
  removeDraftCandidate: (index: number) => void;
  updateDraftCandidate: (index: number, name: string) => void;
  setDraftMaxRankChoices: (count: number) => void;
  addDraftVoter: (name: string) => void;
  removeDraftVoter: (index: number) => void;
  updateDraftVoter: (index: number, name: string) => void;

  // Actions - poll lifecycle
  createPoll: () => void;
  submitBallot: (rankedCandidates: string[]) => void;
  advanceToNextVoter: () => void;
  closePoll: () => void;
  resetPoll: () => void;
}

let pollIdCounter = 0;

export const usePollStore = create<PollState>((set, get) => ({
  currentPoll: null,
  voters: [],
  currentVoterIndex: 0,

  draftTitle: '',
  draftCandidates: ['', '', ''],
  draftMaxRankChoices: limits.defaultMaxRankChoices,
  draftVoterNames: ['', '', ''],

  setDraftTitle: (title) => set({ draftTitle: title }),

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

  createPoll: () => {
    const state = get();
    const candidates = state.draftCandidates.filter((c) => c.trim() !== '');
    const voterNames = state.draftVoterNames.filter((v) => v.trim() !== '');

    if (candidates.length < limits.minCandidates) return;
    if (voterNames.length < limits.minVoters) return;

    const maxRank = Math.min(state.draftMaxRankChoices, candidates.length - 1);

    const poll: LocalPoll = {
      id: String(++pollIdCounter),
      title: state.draftTitle || 'Untitled Poll',
      candidates,
      maxRankChoices: maxRank,
      ballots: [],
      status: 'voting',
    };

    const voters: LocalVoter[] = voterNames.map((name) => ({
      name,
      hasVoted: false,
    }));

    set({
      currentPoll: poll,
      voters,
      currentVoterIndex: 0,
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
  },

  resetPoll: () =>
    set({
      currentPoll: null,
      voters: [],
      currentVoterIndex: 0,
      draftTitle: '',
      draftCandidates: ['', '', ''],
      draftMaxRankChoices: limits.defaultMaxRankChoices,
      draftVoterNames: ['', '', ''],
    }),
}));
