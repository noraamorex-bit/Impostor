import type { Player, Round } from "@/types";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #8B7CFF, #5A49D6)",
  "linear-gradient(135deg, #FF8A6B, #E0543F)",
  "linear-gradient(135deg, #4FE3B0, #17A97C)",
  "linear-gradient(135deg, #FFC46B, #E08A25)",
  "linear-gradient(135deg, #6BB8FF, #2E6BD6)",
  "linear-gradient(135deg, #FF6B9E, #D63A72)",
];

export function avatarGradient(index: number): string {
  return AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
}

/** Deterministic "who talks first" pick, stable for the life of a round. */
export function firstSpeaker(round: Round): Player {
  let hash = 0;
  for (const char of round.id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return round.players[hash % round.players.length];
}

export function formatSeconds(total: number): string {
  const safe = Math.max(0, Math.round(total));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function listNames(players: Player[]): string {
  if (players.length === 1) return players[0].name;
  if (players.length === 2) return `${players[0].name} & ${players[1].name}`;
  return `${players.slice(0, -1).map((p) => p.name).join(", ")} & ${players[players.length - 1].name}`;
}
