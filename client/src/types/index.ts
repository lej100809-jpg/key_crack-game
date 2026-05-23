// ─── Difficulty ───────────────────────────────────────────────────────────────
export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

// ─── RSA Puzzle ───────────────────────────────────────────────────────────────
export interface RSAPuzzle {
  id: string;
  n: number;
  e: number;
  c: number;
  difficulty: Difficulty;
  hints: {
    pHint?: number;
    phiN?: number;
    dCandidates?: number[];
  };
}

export interface PuzzleState {
  puzzle: RSAPuzzle | null;
  currentStep: 1 | 2 | 3 | 4;
  inputs: {
    p: number | null;
    q: number | null;
    phiN: number | null;
    d: number | null;
    m: number | null;
  };
  hintsUsed: number;
  startedAt: number;
  status: 'idle' | 'solving' | 'success' | 'failed';
}

// ─── Difficulty config ────────────────────────────────────────────────────────
export interface DifficultyConfig {
  primeRange: [number, number];
  timeLimitSec: number | null;
  hintCount: number;
  step1Mode: 'table' | 'hint' | 'free';
  step2Mode: 'auto' | 'formula' | 'free';
  step3Mode: 'choice3' | 'choice5' | 'free';
  step4Mode: 'calculator' | 'free';
  wrongPenaltySec: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  beginner: {
    primeRange: [2, 10],   timeLimitSec: null, hintCount: 99,
    step1Mode: 'table',    step2Mode: 'auto',    step3Mode: 'choice3', step4Mode: 'calculator',
    wrongPenaltySec: 0,
  },
  easy: {
    primeRange: [2, 20],   timeLimitSec: null, hintCount: 3,
    step1Mode: 'hint',     step2Mode: 'formula', step3Mode: 'choice5', step4Mode: 'calculator',
    wrongPenaltySec: 0,
  },
  medium: {
    primeRange: [2, 50],   timeLimitSec: 180,  hintCount: 1,
    step1Mode: 'free',     step2Mode: 'free',    step3Mode: 'choice5', step4Mode: 'calculator',
    wrongPenaltySec: 5,
  },
  hard: {
    primeRange: [2, 97],   timeLimitSec: 120,  hintCount: 0,
    step1Mode: 'free',     step2Mode: 'free',    step3Mode: 'choice5', step4Mode: 'free',
    wrongPenaltySec: 10,
  },
  expert: {
    primeRange: [2, 97],   timeLimitSec: 90,   hintCount: 0,
    step1Mode: 'free',     step2Mode: 'free',    step3Mode: 'choice3', step4Mode: 'free',
    wrongPenaltySec: 15,
  },
};

// ─── Player ───────────────────────────────────────────────────────────────────
export type Badge = string;
export type GameMode = 'stage' | 'vault' | 'battle';

export interface Player {
  id: string;
  nickname: string;
  coins: number;
  badges: Badge[];
  rating: number;
  unlockedModes: GameMode[];
}

// ─── Stage ────────────────────────────────────────────────────────────────────
export interface Stage {
  id: number;
  title: string;
  storyText: string;
  difficulty: Difficulty;
  primeRange: [number, number];
  timeLimitSec: number | null;
  hintCount: number;
  rewards: { coins: number; badge?: Badge };
}

// ─── Vault ────────────────────────────────────────────────────────────────────
export type VaultGrade = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Vault {
  grade: VaultGrade;
  label: string;
  primeRange: [number, number];
  timeLimitSec: number;
  hintCount: number;
  rewardCoins: number;
  isChained: boolean;
}

export const VAULT_CONFIG: Record<VaultGrade, Vault> = {
  bronze:   { grade: 'bronze',   label: 'Bronze',   primeRange: [2, 20], timeLimitSec: 180, hintCount: 3, rewardCoins: 50,   isChained: false },
  silver:   { grade: 'silver',   label: 'Silver',   primeRange: [2, 50], timeLimitSec: 120, hintCount: 2, rewardCoins: 150,  isChained: false },
  gold:     { grade: 'gold',     label: 'Gold',     primeRange: [2, 97], timeLimitSec: 90,  hintCount: 1, rewardCoins: 400,  isChained: false },
  platinum: { grade: 'platinum', label: 'Platinum', primeRange: [2, 97], timeLimitSec: 60,  hintCount: 0, rewardCoins: 1000, isChained: true  },
};

// ─── Battle / Skills ──────────────────────────────────────────────────────────
export type SkillType = 'fake_hint' | 'time_cut' | 'shield' | 'bonus_hint';

export interface Skill {
  id: SkillType;
  label: string;
  description: string;
  cooldownSec: number;
  targetsSelf: boolean;
}

export const SKILLS: Record<SkillType, Skill> = {
  fake_hint:  { id: 'fake_hint',  label: '🎭 가짜 힌트',  description: '상대방에게 잘못된 소인수분해 힌트를 전송한다.', cooldownSec: 60,  targetsSelf: false },
  time_cut:   { id: 'time_cut',   label: '⏱ 시간 단축',  description: '상대방의 남은 시간을 20초 감소시킨다.',         cooldownSec: 45,  targetsSelf: false },
  shield:     { id: 'shield',     label: '🛡 방어막',     description: '다음으로 받는 스킬 1회를 무효화한다.',          cooldownSec: 90,  targetsSelf: true  },
  bonus_hint: { id: 'bonus_hint', label: '💡 힌트 충전',  description: '힌트 사용 횟수를 1회 즉시 회복한다.',          cooldownSec: 120, targetsSelf: true  },
};

export interface BattlePlayer {
  id: string;
  nickname: string;
  score: number;
  currentStep: 1 | 2 | 3 | 4;
  skills: SkillType[];
  skillCooldowns: Record<SkillType, number>;
  isReady: boolean;
}

export interface BattleRoom {
  roomId: string;
  players: BattlePlayer[];
  currentRound: number;
  totalRounds: number;
  puzzle: RSAPuzzle | null;
  status: 'waiting' | 'in_round' | 'round_end' | 'game_over';
}

export const BATTLE_ROUNDS: { round: number; difficulty: Difficulty; skillsEnabled: boolean }[] = [
  { round: 1, difficulty: 'beginner', skillsEnabled: false },
  { round: 2, difficulty: 'easy',     skillsEnabled: false },
  { round: 3, difficulty: 'medium',   skillsEnabled: true  },
  { round: 4, difficulty: 'hard',     skillsEnabled: true  },
  { round: 5, difficulty: 'expert',   skillsEnabled: true  },
];

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  score: number;
  badge?: Badge;
}
