import { RoundResult, RoundTally, PollResult } from '../types';

/**
 * Enhanced Ranked Choice Voting / Single Transferable Vote algorithm.
 *
 * Unlike the original Svelte version which pre-aggregated votes into a
 * votes[] array per candidate, this version works from raw ballots
 * and re-counts each round after elimination. This is simpler, more correct
 * for variable rank depths, and returns full round-by-round data for visualization.
 *
 * @param candidateNames - Map of candidateId -> display name
 * @param ballots - Array of ballots, where each ballot is an ordered array of candidate IDs
 *                  (index 0 = first choice, index 1 = second choice, etc.)
 * @returns PollResult with winner, rounds breakdown, and total vote count
 */
export function calculateWinner(
  candidateNames: Map<string, string>,
  ballots: string[][]
): PollResult {
  const rounds: RoundResult[] = [];
  const remainingCandidates = new Set(candidateNames.keys());
  const totalVoters = ballots.length;
  const majorityThreshold = totalVoters / 2;
  let round = 0;

  while (remainingCandidates.size > 1) {
    // Count first-choice votes among remaining candidates
    const counts = new Map<string, number>();
    for (const id of remainingCandidates) {
      counts.set(id, 0);
    }

    for (const ballot of ballots) {
      // Find this voter's highest-ranked candidate still in the race
      const pick = ballot.find((id) => remainingCandidates.has(id));
      if (pick) {
        counts.set(pick, (counts.get(pick) ?? 0) + 1);
      }
    }

    const tallies: RoundTally[] = Array.from(counts.entries()).map(
      ([id, count]) => ({
        candidateId: id,
        name: candidateNames.get(id)!,
        count,
      })
    );

    // Check for majority winner
    let winner: string | undefined;
    for (const [id, count] of counts) {
      if (count > majorityThreshold) {
        winner = candidateNames.get(id)!;
      }
    }

    if (winner) {
      rounds.push({ round, tallies, winner });
      return { winner, rounds, totalVotes: totalVoters };
    }

    // Find candidate with the lowest vote count
    let lowestCount = Infinity;
    let lowestId = '';
    for (const [id, count] of counts) {
      if (count < lowestCount) {
        lowestCount = count;
        lowestId = id;
      }
    }

    rounds.push({
      round,
      tallies,
      eliminated: candidateNames.get(lowestId)!,
    });

    remainingCandidates.delete(lowestId);
    round++;
  }

  // Last candidate standing
  const winnerId = Array.from(remainingCandidates)[0];
  const winnerName = candidateNames.get(winnerId)!;

  // Final round tally
  const finalCount = ballots.filter((ballot) =>
    ballot.some((id) => id === winnerId)
  ).length;

  rounds.push({
    round,
    tallies: [{ candidateId: winnerId, name: winnerName, count: finalCount }],
    winner: winnerName,
  });

  return { winner: winnerName, rounds, totalVotes: totalVoters };
}

/**
 * Helper to create candidateNames map from a simple string array.
 * Uses the candidate name as both the ID and display name (for local/Phase 1 use).
 */
export function candidateNamesFromArray(
  candidates: string[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const name of candidates) {
    map.set(name, name);
  }
  return map;
}
