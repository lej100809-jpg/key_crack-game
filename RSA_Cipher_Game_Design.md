


# 🔐 RSA Cipher Break — Vibe Coding Spec

> **이 문서의 목적**: AI(Cursor / Copilot / Claude)가 이 파일 하나만 읽고 전체 프로젝트를 코드로 생성할 수 있을 만큼 구체적으로 작성된 개발 명세서다.

---

## 0. 빠른 요약

| 항목 | 내용 |
|------|------|
| 프로젝트명 | RSA Cipher Break |
| 장르 | 암호 해독 퍼즐 + 멀티플레이 배틀 |
| 스택 | React 18 + TypeScript + Vite + Tailwind CSS + Socket.io |
| 상태 관리 | Zustand |
| 백엔드 | Node.js + Express + Socket.io + Firebase Firestore |
| 배포 | 프론트: Vercel / 백엔드: Railway |
| 핵심 수학 | RSA 암호 (소인수분해 → φ(n) → 모듈러 역원 → 복호화), BigInt 활용 |

---

## 1. 프로젝트 구조

```
rsa-cipher-break/
├── client/                        # React 프론트엔드
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx           # 메인 허브 (모드 선택)
│   │   │   ├── LearnPage.tsx          # RSA 학습 페이지
│   │   │   ├── StageModePage.tsx      # 스테이지 모드
│   │   │   ├── VaultModePage.tsx      # 금고 모드
│   │   │   └── BattleModePage.tsx     # 배틀 모드
│   │   ├── components/
│   │   │   ├── puzzle/
│   │   │   │   ├── PuzzleBoard.tsx    # RSA 풀이 메인 UI
│   │   │   │   ├── StepFactorize.tsx  # Step 1: 소인수분해
│   │   │   │   ├── StepPhi.tsx        # Step 2: φ(n) 계산
│   │   │   │   ├── StepPrivateKey.tsx # Step 3: d 찾기
│   │   │   │   └── StepDecrypt.tsx    # Step 4: 복호화
│   │   │   ├── ui/
│   │   │   │   ├── HintPanel.tsx      # 힌트 표시 패널
│   │   │   │   ├── TimerBar.tsx       # 타이머 바
│   │   │   │   ├── Calculator.tsx     # 인게임 계산기
│   │   │   │   └── PrimeTable.tsx     # 소수 참조 테이블
│   │   │   ├── battle/
│   │   │   │   ├── BattleRoom.tsx     # 배틀 룸 UI
│   │   │   │   ├── OpponentPanel.tsx  # 상대방 진행도
│   │   │   │   └── SkillBar.tsx       # 스킬 버튼 모음
│   │   │   └── vault/
│   │   │       ├── VaultSelector.tsx  # 금고 등급 선택
│   │   │       └── VaultDoor.tsx      # 금고 문 애니메이션
│   │   ├── store/
│   │   │   ├── usePuzzleStore.ts      # 현재 풀이 상태
│   │   │   ├── usePlayerStore.ts      # 플레이어 정보, 코인, 배지
│   │   │   └── useBattleStore.ts      # 배틀 룸 상태
│   │   ├── lib/
│   │   │   ├── rsa.ts                 # RSA 핵심 수학 함수
│   │   │   ├── puzzleGenerator.ts     # 난이도별 문제 생성
│   │   │   └── socket.ts             # Socket.io 클라이언트
│   │   └── types/
│   │       └── index.ts               # 공용 타입 정의
│   └── package.json
│
└── server/                        # Node.js 백엔드
    ├── src/
    │   ├── index.ts                   # 엔트리포인트
    │   ├── routes/
    │   │   ├── puzzle.ts              # 문제 생성 API
    │   │   └── player.ts             # 플레이어 데이터 API
    │   ├── socket/
    │   │   ├── battleHandler.ts       # 배틀 모드 Socket 이벤트
    │   │   └── roomManager.ts         # 방 생성/관리
    │   └── lib/
    │       └── rsa.ts                 # 서버 사이드 RSA (문제 생성)
    └── package.json
```

---

## 2. 핵심 타입 정의 (`client/src/types/index.ts`)

```typescript
// ─── RSA 문제 ───────────────────────────────────────────────────────────────
export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export interface RSAPuzzle {
  id: string;
  n: number;          // 공개키 n = p × q
  e: number;          // 공개키 e
  c: number;          // 암호문 (복호화 목표값)
  answer: number;     // 정답 m (서버에서만 사용, 클라이언트에 노출 금지)
  difficulty: Difficulty;
  // 힌트 데이터 (난이도에 따라 일부만 제공)
  hints: {
    pHint?: number;          // p의 첫 자리 숫자 힌트
    phiN?: number;           // φ(n) 자동 제공 여부
    dCandidates?: number[];  // d 후보 배열 (3~5개)
  };
}

export interface PuzzleState {
  puzzle: RSAPuzzle | null;
  currentStep: 1 | 2 | 3 | 4;   // 현재 진행 단계
  inputs: {
    p: number | null;
    q: number | null;
    phiN: number | null;
    d: number | null;
    m: number | null;
  };
  hintsUsed: number;
  startedAt: number;             // Date.now()
  status: 'idle' | 'solving' | 'success' | 'failed';
}

// ─── 플레이어 ────────────────────────────────────────────────────────────────
export interface Player {
  id: string;
  nickname: string;
  coins: number;
  badges: Badge[];
  rating: number;               // ELO 레이팅 (배틀 모드)
  unlockedModes: GameMode[];
}

export type Badge = 'gold_stage_1' | 'gold_stage_2' | /* ... */ string;
export type GameMode = 'stage' | 'vault' | 'battle';

// ─── 스테이지 모드 ───────────────────────────────────────────────────────────
export interface Stage {
  id: number;                   // 1 ~ 20
  title: string;
  storyText: string;            // 스토리 대사
  difficulty: Difficulty;
  primeRange: [number, number]; // [최솟값, 최댓값]
  timeLimitSec: number | null;  // null이면 제한 없음
  hintCount: number;            // 사용 가능한 힌트 횟수
  rewards: {
    coins: number;
    badge?: Badge;
  };
}

// ─── 금고 모드 ───────────────────────────────────────────────────────────────
export type VaultGrade = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Vault {
  grade: VaultGrade;
  label: string;
  primeRange: [number, number];
  timeLimitSec: number;
  hintCount: number;
  rewardCoins: number;
  isChained: boolean;           // true이면 2단계 연쇄 RSA
}

export const VAULT_CONFIG: Record<VaultGrade, Vault> = {
  bronze:   { grade: 'bronze',   label: 'Bronze',   primeRange: [2, 20],  timeLimitSec: 180, hintCount: 3, rewardCoins: 50,   isChained: false },
  silver:   { grade: 'silver',   label: 'Silver',   primeRange: [2, 50],  timeLimitSec: 120, hintCount: 2, rewardCoins: 150,  isChained: false },
  gold:     { grade: 'gold',     label: 'Gold',     primeRange: [2, 97],  timeLimitSec: 90,  hintCount: 1, rewardCoins: 400,  isChained: false },
  platinum: { grade: 'platinum', label: 'Platinum', primeRange: [2, 97],  timeLimitSec: 60,  hintCount: 0, rewardCoins: 1000, isChained: true  },
};

// ─── 배틀 모드 ───────────────────────────────────────────────────────────────
export type SkillType = 'fake_hint' | 'time_cut' | 'shield' | 'bonus_hint';

export interface Skill {
  id: SkillType;
  label: string;
  description: string;
  cooldownSec: number;
  targetsSelf: boolean;         // false면 상대방 대상
}

export interface BattleRoom {
  roomId: string;
  players: BattlePlayer[];
  currentRound: number;        // 1 ~ 5
  totalRounds: number;
  puzzle: RSAPuzzle | null;
  status: 'waiting' | 'in_round' | 'round_end' | 'game_over';
}

export interface BattlePlayer {
  id: string;
  nickname: string;
  score: number;
  currentStep: 1 | 2 | 3 | 4;
  skills: SkillType[];
  skillCooldowns: Record<SkillType, number>;  // 남은 쿨타임 (초)
  isReady: boolean;
}

// ─── 라운드별 배틀 난이도 ─────────────────────────────────────────────────────
export const BATTLE_ROUNDS: { round: number; difficulty: Difficulty; skillsEnabled: boolean }[] = [
  { round: 1, difficulty: 'beginner', skillsEnabled: false },
  { round: 2, difficulty: 'easy',     skillsEnabled: false },
  { round: 3, difficulty: 'medium',   skillsEnabled: true  },
  { round: 4, difficulty: 'hard',     skillsEnabled: true  },
  { round: 5, difficulty: 'expert',   skillsEnabled: true  },
];
```

---

## 3. RSA 수학 라이브러리 (`client/src/lib/rsa.ts`)

> **주의**: 모든 연산은 `number` 범위에서 처리 가능하도록 소수 범위를 제한한다.  
> Platinum 등급처럼 연산이 커질 경우 `BigInt`로 자동 전환한다.

```typescript
// 구현해야 할 함수 목록 (시그니처만 정의, 구현은 AI가 생성)

/** n 이하의 소수 배열 반환 */
export function primesUpTo(n: number): number[]

/** n이 소수인지 판별 */
export function isPrime(n: number): boolean

/** n을 소인수분해하여 [p, q] 반환. 소인수가 2개가 아니면 null */
export function factorize(n: number): [number, number] | null

/** 오일러 피 함수: φ(n) = (p-1)(q-1) */
export function eulerPhi(p: number, q: number): number

/** 최대공약수 (유클리드 호제법) */
export function gcd(a: number, b: number): number

/** 모듈러 역원: e*d ≡ 1 (mod phi) 인 d 반환. 없으면 null */
export function modInverse(e: number, phi: number): number | null

/** 모듈러 거듭제곱: base^exp mod mod (BigInt 사용으로 오버플로우 방지) */
export function modPow(base: number, exp: number, mod: number): number

/** d 후보 배열 생성 (정답 포함, 오답 랜덤 혼합) */
export function generateDCandidates(d: number, phi: number, count: number): number[]

/**
 * 난이도에 맞는 RSA 문제 생성
 * difficulty에 따라 primeRange, hintLevel 자동 설정
 */
export function generatePuzzle(difficulty: Difficulty): RSAPuzzle

/**
 * 플레이어 입력값 검증
 * step별로 맞는지 확인하고 결과 반환
 */
export function validateStep(
  step: 1 | 2 | 3 | 4,
  input: number,
  puzzle: RSAPuzzle
): { correct: boolean; penalty?: string }
```

---

## 4. 난이도 시스템 상세 명세

### 4.1 Difficulty별 설정값

```typescript
export const DIFFICULTY_CONFIG: Record<Difficulty, {
  primeRange: [number, number];
  timeLimitSec: number | null;
  hintCount: number;
  // Step별 UI 모드
  step1Mode: 'table' | 'hint' | 'free';     // 소인수분해
  step2Mode: 'auto' | 'formula' | 'free';   // φ(n)
  step3Mode: 'choice3' | 'choice5' | 'free'; // d 선택
  step4Mode: 'calculator' | 'free';          // 복호화
  wrongPenaltySec: number;                   // 오답시 차감 초
}> = {
  beginner: {
    primeRange: [2, 10],   timeLimitSec: null,  hintCount: 99,
    step1Mode: 'table',    step2Mode: 'auto',   step3Mode: 'choice3', step4Mode: 'calculator',
    wrongPenaltySec: 0,
  },
  easy: {
    primeRange: [2, 20],   timeLimitSec: null,  hintCount: 3,
    step1Mode: 'hint',     step2Mode: 'formula', step3Mode: 'choice5', step4Mode: 'calculator',
    wrongPenaltySec: 0,
  },
  medium: {
    primeRange: [2, 50],   timeLimitSec: 180,   hintCount: 1,
    step1Mode: 'free',     step2Mode: 'free',   step3Mode: 'free',   step4Mode: 'calculator',
    wrongPenaltySec: 20,
  },
  hard: {
    primeRange: [2, 97],   timeLimitSec: 120,   hintCount: 0,
    step1Mode: 'free',     step2Mode: 'free',   step3Mode: 'free',   step4Mode: 'free',
    wrongPenaltySec: 20,
  },
  expert: {
    primeRange: [2, 97],   timeLimitSec: 90,    hintCount: 0,
    step1Mode: 'free',     step2Mode: 'free',   step3Mode: 'free',   step4Mode: 'free',
    wrongPenaltySec: 30,
  },
};
```

---

## 5. 컴포넌트 명세

### 5.1 PuzzleBoard (메인 풀이 UI)

```
역할: RSA 풀이의 4단계를 순서대로 표시하는 메인 컨테이너

Props:
  puzzle: RSAPuzzle
  difficulty: Difficulty
  onSolve: (timeTaken: number, hintsUsed: number) => void
  onFail: () => void

레이아웃:
  ┌─────────────────────────────────────────────────────┐
  │  🔒 PUBLIC KEY  n = 77   e = 13   │  📨 c = 10     │
  │  ─────────────────────────────────────────────────  │
  │  [TimerBar]                      [🔑 힌트: 3/3]    │
  ├─────────────────────────────────────────────────────┤
  │  STEP 1 ▶ 소인수분해                                │
  │           n = [___] × [___]                         │
  ├─────────────────────────────────────────────────────┤
  │  STEP 2 ▶ φ(n) = (p-1)(q-1) = [___]               │
  ├─────────────────────────────────────────────────────┤
  │  STEP 3 ▶ e × d ≡ 1 (mod φ(n))  →  d = [___]      │
  ├─────────────────────────────────────────────────────┤
  │  STEP 4 ▶ m = c^d mod n = [___]  [계산기] [제출]   │
  └─────────────────────────────────────────────────────┘

상태 흐름:
  - currentStep이 증가할수록 이전 step은 잠금 해제된 채로 유지
  - 각 step 정답 입력 시 초록색 체크 + 다음 step 활성화
  - 오답 입력 시 빨간 흔들림 애니메이션 + 패널티 적용
```

### 5.2 StepFactorize (소인수분해)

```
step1Mode별 렌더링:
  'table'  → PrimeTable 컴포넌트 옆에 표시, 드롭다운으로 p, q 선택
  'hint'   → "p는 __보다 작은 소수입니다" 형태 힌트 1개 표시, 직접 입력
  'free'   → 입력 필드만, 힌트 없음

검증 로직:
  - p × q === n 이고 isPrime(p) && isPrime(q) 이면 정답
  - p > q 순서는 무관 (둘 다 수용)
```

### 5.3 StepPhi (φ(n) 계산)

```
step2Mode별 렌더링:
  'auto'    → φ(n) 값 자동 표시 (입력 불필요)
  'formula' → "φ(n) = (p-1) × (q-1) = __ × __ = ?" 공식 표시, 빈칸 입력
  'free'    → "φ(n) = [___]" 직접 입력만
```

### 5.4 StepPrivateKey (d 찾기)

```
step3Mode별 렌더링:
  'choice3' → 버튼 3개 (정답 1 + 오답 2), 클릭 선택
  'choice5' → 버튼 5개 (정답 1 + 오답 4), 클릭 선택
  'free'    → "d = [___]" 직접 입력

힌트 표시 (요청 시):
  "e × d ≡ 1 (mod φ(n)) 조건을 확인하세요"
  "e = {e}, φ(n) = {phiN}"
```

### 5.5 TimerBar

```
Props:
  totalSec: number
  onTimeUp: () => void
  penaltyTrigger: number   // 외부에서 감소 이벤트를 트리거하는 카운터

- 바 색상: 50% 이상 → 초록, 25~50% → 노랑, 25% 미만 → 빨강
- 25% 미만 시 화면 전체에 빨간 테두리 pulse 애니메이션
- penaltyTrigger 변경 시 -20초 효과 + 빨간 플래시 효과
```

### 5.6 HintPanel

```
Props:
  hints: RSAPuzzle['hints']
  difficulty: Difficulty
  hintsUsed: number
  maxHints: number
  onUseHint: (step: 1 | 2 | 3 | 4) => void

힌트 내용 (step별):
  Step 1: "p = {pHint} × ?" 또는 소수 테이블 강조
  Step 2: "φ(n) = (p-1) × (q-1) 공식을 사용하세요"
  Step 3: d 후보 중 오답 하나 제거 (5지선다 → 4지선다)
  Step 4: "계산기를 이용해 c^d mod n을 구하세요"
```

### 5.7 Calculator (인게임 계산기)

```
지원 기능:
  - 기본 사칙연산
  - mod 연산 (버튼: "mod")
  - 거듭제곱 (버튼: "x^y")
  - 계산 결과를 Step 4 입력창에 "붙여넣기" 버튼

BigInt 사용 강제:
  - 내부적으로 BigInt로 계산 후 number로 변환하여 표시
  - 오버플로우 방지 필수
```

---

## 6. 상태 관리 (Zustand)

### 6.1 usePuzzleStore

```typescript
interface PuzzleStore {
  // 상태
  puzzle: RSAPuzzle | null;
  state: PuzzleState;

  // 액션
  loadPuzzle: (difficulty: Difficulty) => void;
  submitStep: (step: 1 | 2 | 3 | 4, value: number) => 'correct' | 'wrong';
  useHint: (step: 1 | 2 | 3 | 4) => void;
  applyTimePenalty: (sec: number) => void;   // 배틀 모드 방해 스킬용
  resetPuzzle: () => void;
}
```

### 6.2 usePlayerStore

```typescript
interface PlayerStore {
  player: Player | null;
  addCoins: (amount: number) => void;
  addBadge: (badge: Badge) => void;
  updateRating: (delta: number) => void;     // ELO 변동
  unlockMode: (mode: GameMode) => void;
}
```

### 6.3 useBattleStore

```typescript
interface BattleStore {
  room: BattleRoom | null;
  myId: string | null;

  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  useSkill: (skill: SkillType, targetId: string) => void;
  updateOpponentProgress: (playerId: string, step: number) => void;
}
```

---

## 7. Socket.io 이벤트 명세 (배틀 모드)

### 클라이언트 → 서버

```typescript
// 방 관련
socket.emit('battle:join',    { nickname: string })
socket.emit('battle:ready',   { roomId: string })
socket.emit('battle:leave',   { roomId: string })

// 풀이 제출
socket.emit('battle:submit',  { roomId: string, round: number, answer: number, timeTaken: number })

// 스킬 사용
socket.emit('battle:skill',   { roomId: string, skill: SkillType, targetId: string })

// 진행도 브로드캐스트 (매 step 완료 시)
socket.emit('battle:progress', { roomId: string, step: 1 | 2 | 3 | 4 })
```

### 서버 → 클라이언트

```typescript
// 방 상태
socket.on('battle:room_update',    (room: BattleRoom) => void)
socket.on('battle:round_start',    (puzzle: RSAPuzzle, round: number) => void)
socket.on('battle:round_end',      (results: RoundResult[]) => void)
socket.on('battle:game_over',      (finalRanking: FinalRank[]) => void)

// 실시간 이벤트
socket.on('battle:opponent_progress', (playerId: string, step: number) => void)
socket.on('battle:skill_received',    (skill: SkillType, fromId: string) => void)
```

---

## 8. 스테이지 데이터 (`client/src/data/stages.ts`)

```typescript
// 20개 스테이지 전체 정의
export const STAGES: Stage[] = [
  // ─── 입문 (1~3) ───
  {
    id: 1, title: "첫 번째 암호",
    storyText: "요원, 첫 번째 메시지가 도착했습니다. 기초부터 시작하죠.",
    difficulty: 'beginner', primeRange: [2, 10],
    timeLimitSec: null, hintCount: 99,
    rewards: { coins: 20 }
  },
  {
    id: 2, title: "암호문 해독",
    storyText: "조직은 작은 수를 사용합니다. 하지만 원리는 같습니다.",
    difficulty: 'beginner', primeRange: [2, 10],
    timeLimitSec: null, hintCount: 99,
    rewards: { coins: 20 }
  },
  {
    id: 3, title: "원리를 기억하라",
    storyText: "이제 원리를 이해했군요. 다음 단계로 넘어갑시다.",
    difficulty: 'beginner', primeRange: [2, 10],
    timeLimitSec: null, hintCount: 99,
    rewards: { coins: 30, badge: 'gold_beginner' }
  },
  // ─── 초급 (4~7) ───
  {
    id: 4, title: "소수가 커졌다",
    storyText: "적들이 더 큰 소수를 쓰기 시작했습니다.",
    difficulty: 'easy', primeRange: [2, 20],
    timeLimitSec: null, hintCount: 3,
    rewards: { coins: 50 }
  },
  // ... (5~7 동일 패턴으로 생성)

  // ─── 중급 (8~12) ───
  {
    id: 8, title: "시간이 없다",
    storyText: "3분 안에 해독하지 못하면 메시지가 자폭합니다.",
    difficulty: 'medium', primeRange: [2, 50],
    timeLimitSec: 180, hintCount: 1,
    rewards: { coins: 100 }
  },
  // ... (9~12 동일 패턴)

  // ─── 고급 (13~17) ───
  {
    id: 13, title: "97의 장벽",
    storyText: "97 이하의 모든 소수가 동원되었습니다. 집중하십시오.",
    difficulty: 'hard', primeRange: [2, 97],
    timeLimitSec: 120, hintCount: 0,
    rewards: { coins: 200 }
  },
  // ... (14~17 동일 패턴)

  // ─── 전문가 (18~20) ───
  {
    id: 18, title: "이중 자물쇠",
    storyText: "두 겹의 RSA. 첫 번째 복호화 결과가 두 번째의 키입니다.",
    difficulty: 'expert', primeRange: [2, 97],
    timeLimitSec: 90, hintCount: 0,
    rewards: { coins: 500, badge: 'gold_expert' }
  },
  // ... (19~20 동일 패턴)
];
```

---

## 9. 스킬 명세 (배틀 모드)

```typescript
export const SKILLS: Record<SkillType, Skill> = {
  fake_hint: {
    id: 'fake_hint',
    label: '🎭 가짜 힌트',
    description: '상대방에게 잘못된 소인수분해 힌트를 전송한다.',
    cooldownSec: 60,
    targetsSelf: false,
  },
  time_cut: {
    id: 'time_cut',
    label: '⏱ 시간 단축',
    description: '상대방의 남은 시간을 20초 감소시킨다.',
    cooldownSec: 45,
    targetsSelf: false,
  },
  shield: {
    id: 'shield',
    label: '🛡 방어막',
    description: '다음으로 받는 스킬 1회를 무효화한다.',
    cooldownSec: 90,
    targetsSelf: true,
  },
  bonus_hint: {
    id: 'bonus_hint',
    label: '💡 힌트 충전',
    description: '힌트 사용 횟수를 1회 즉시 회복한다.',
    cooldownSec: 120,
    targetsSelf: true,
  },
};
```

---

## 10. 디자인 시스템

```css
/* 전체 테마: 다크 사이버펑크 */
/* 폰트: JetBrains Mono (코드), Rajdhani (제목) */
/* Google Fonts import: JetBrains Mono, Rajdhani */

:root {
  --bg-base:        #0a0e17;   /* 최하단 배경 */
  --bg-panel:       #111827;   /* 카드/패널 배경 */
  --bg-input:       #1f2937;   /* 입력창 배경 */

  --accent-primary: #00ff88;   /* 메인 강조색 (초록) */
  --accent-secondary: #00d4ff; /* 보조 강조색 (청록) */
  --accent-danger:  #ff4444;   /* 경고/오답 색 */
  --accent-warning: #ffbb00;   /* 타이머 경고 색 */

  --text-primary:   #e2e8f0;
  --text-secondary: #94a3b8;
  --text-code:      #00ff88;   /* 수식/코드 텍스트 */

  --border:         #1e293b;
  --border-active:  #00ff88;

  /* 단계별 색 */
  --step-1: #6366f1;  /* 보라 */
  --step-2: #06b6d4;  /* 하늘 */
  --step-3: #f59e0b;  /* 주황 */
  --step-4: #10b981;  /* 에메랄드 */

  /* 금고 등급 색 */
  --vault-bronze:   #cd7f32;
  --vault-silver:   #c0c0c0;
  --vault-gold:     #ffd700;
  --vault-platinum: #e5e4e2;
}

/* 컴포넌트 스타일 가이드 */
/* 모든 패널: border border-[--border] rounded-lg bg-[--bg-panel] */
/* 입력창: font-mono text-[--text-code] border-[--border-active] */
/* 버튼(정답): bg-[--accent-primary] text-black font-bold */
/* 버튼(위험): bg-[--accent-danger] */
/* 수식 표시: font-mono text-xl text-[--text-code] */
```

---

## 11. RSA 학습 페이지 구성 (`LearnPage.tsx`)

```
섹션 구성:
  Section 1 — RSA란 무엇인가?
    - 공개키 암호의 개념 (카드 박스 애니메이션으로 설명)
    - 왜 안전한가? (소인수분해의 어려움)

  Section 2 — 6단계 원리 설명
    - Step별 인터랙티브 예시 (p=5, q=11 고정값으로 직접 클릭하며 체험)
    - 각 단계 완료 시 다음 단계 언락 애니메이션

  Section 3 — 게임과의 차이점
    - 실제 RSA vs 게임 내 RSA 비교 테이블
    - 단순화 이유 설명

  Section 4 — 소수 참조 테이블
    - 100 이하 소수 전체 표시
    - 게임 중 참조용 (별도 탭 또는 모달)

컴포넌트:
  <InteractiveRSADemo />   // p, q를 슬라이더로 조작하며 n, φ(n), d 실시간 계산
  <PrimeTable />           // 소수 목록, 클릭 시 해당 소수 강조
  <StepByStepGuide />      // 6단계 아코디언 UI
```

---

## 12. API 엔드포인트

```
GET  /api/puzzle?difficulty={difficulty}   → RSAPuzzle (answer 제외)
POST /api/puzzle/verify                    → { correct: boolean }
  body: { puzzleId, step, value }

GET  /api/player/:id                       → Player
POST /api/player/:id/reward               → { coins, badge? }
  body: { stageId, hintsUsed, timeTaken }

GET  /api/stages                           → Stage[]
GET  /api/leaderboard?mode={mode}          → LeaderboardEntry[]
```

---

## 13. 미구현 / 추후 논의 항목

```
[ ] 계정 시스템 (Firebase Auth 소셜 로그인)
[ ] 스테이지 5~7, 9~12, 14~17, 19~20 스토리 텍스트 작성
[ ] 배틀 모드 매치메이킹 알고리즘 (ELO 기반)
[ ] 관전 모드 UI
[ ] 모바일 반응형 레이아웃
[ ] 효과음 / BGM (Howler.js)
[ ] 다국어 지원 (i18n)
[ ] 금고 외형 커스터마이징 에셋
```

---

*버전: v0.2-vibe | 2026*
