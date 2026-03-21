// Core data types for the Ranked Choice Voting app

export interface Poll {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  shareCode: string;
  status: 'setup' | 'voting' | 'closed';
  maxRankChoices: number;
  createdAt: string;
  closedAt?: string;
}

export interface Candidate {
  id: string;
  pollId: string;
  name: string;
  position: number;
}

export interface Vote {
  id: string;
  pollId: string;
  voterId: string;
  candidateId: string;
  rank: number;
  createdAt: string;
}

export interface PollParticipant {
  id: string;
  pollId: string;
  userId: string;
  joinedAt: string;
  hasVoted: boolean;
}

// RCV algorithm types

export interface RoundTally {
  name: string;
  candidateId: string;
  count: number;
}

export interface RoundResult {
  round: number;
  tallies: RoundTally[];
  eliminated?: string;
  winner?: string;
}

export interface PollResult {
  winner: string;
  rounds: RoundResult[];
  totalVotes: number;
}

// Local-only types for Phase 1 (before Supabase)

export interface LocalPoll {
  id: string;
  title: string;
  candidates: string[];
  maxRankChoices: number;
  ballots: string[][]; // each ballot is ordered candidate names
  status: 'setup' | 'voting' | 'closed';
  result?: PollResult;
}

export interface LocalVoter {
  name: string;
  hasVoted: boolean;
}
