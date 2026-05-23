import type { Stage } from '@/types'

export const STAGES: Stage[] = [
  // ── 입문 (1-3) ────────────────────────────────────────────────────────────
  { id:1,  title:'첫 번째 암호',      storyText:'요원, 첫 번째 암호 메시지가 도착했습니다. 기초부터 시작하죠.',           difficulty:'beginner', primeRange:[2,10], timeLimitSec:null, hintCount:99, rewards:{ coins:20 } },
  { id:2,  title:'암호문 해독',        storyText:'조직은 작은 소수를 사용합니다. 하지만 원리는 같습니다.',                 difficulty:'beginner', primeRange:[2,10], timeLimitSec:null, hintCount:99, rewards:{ coins:20 } },
  { id:3,  title:'원리를 기억하라',    storyText:'이제 RSA의 원리를 이해했군요. 다음 레벨로 넘어갑시다.',                 difficulty:'beginner', primeRange:[2,10], timeLimitSec:null, hintCount:99, rewards:{ coins:30, badge:'badge_beginner' } },
  // ── 초급 (4-7) ────────────────────────────────────────────────────────────
  { id:4,  title:'소수가 커졌다',      storyText:'적들이 더 큰 소수를 쓰기 시작했습니다. 집중하세요.',                    difficulty:'easy',     primeRange:[2,20], timeLimitSec:null, hintCount:3, rewards:{ coins:50 } },
  { id:5,  title:'이중 확인',          storyText:'힌트 없이 소인수분해를 시도해 보십시오.',                               difficulty:'easy',     primeRange:[2,20], timeLimitSec:null, hintCount:3, rewards:{ coins:50 } },
  { id:6,  title:'공개키 분석',        storyText:'적의 공개키 n=323을 분석하라. 소수 테이블을 참조하세요.',               difficulty:'easy',     primeRange:[2,20], timeLimitSec:null, hintCount:3, rewards:{ coins:60 } },
  { id:7,  title:'초급 완료',          storyText:'초급 훈련을 마쳤습니다. 실전에 가까워지고 있습니다.',                   difficulty:'easy',     primeRange:[2,20], timeLimitSec:null, hintCount:3, rewards:{ coins:80, badge:'badge_easy' } },
  // ── 중급 (8-12) ──────────────────────────────────────────────────────────
  { id:8,  title:'시간이 없다',        storyText:'3분 안에 해독하지 못하면 메시지가 자폭합니다.',                         difficulty:'medium',   primeRange:[2,50], timeLimitSec:180, hintCount:1, rewards:{ coins:100 } },
  { id:9,  title:'압박 작전',          storyText:'적이 방해 신호를 보내고 있습니다. 빠르게 해독하세요.',                  difficulty:'medium',   primeRange:[2,50], timeLimitSec:180, hintCount:1, rewards:{ coins:100 } },
  { id:10, title:'50 이하의 소수',     storyText:'소수의 범위가 늘어났습니다. 차분하게 접근하세요.',                      difficulty:'medium',   primeRange:[2,50], timeLimitSec:180, hintCount:1, rewards:{ coins:120 } },
  { id:11, title:'타이머 압박',        storyText:'시간이 줄어들수록 점수가 높아집니다.',                                  difficulty:'medium',   primeRange:[2,50], timeLimitSec:180, hintCount:1, rewards:{ coins:120 } },
  { id:12, title:'중급 마스터',        storyText:'중급 과정 완료. 적의 전략이 강화되고 있습니다.',                        difficulty:'medium',   primeRange:[2,50], timeLimitSec:180, hintCount:1, rewards:{ coins:150, badge:'badge_medium' } },
  // ── 고급 (13-17) ─────────────────────────────────────────────────────────
  { id:13, title:'97의 장벽',          storyText:'97 이하의 모든 소수가 동원되었습니다. 집중하십시오.',                   difficulty:'hard',     primeRange:[2,97], timeLimitSec:120, hintCount:0, rewards:{ coins:200 } },
  { id:14, title:'힌트 없음',          storyText:'모든 힌트 시스템이 차단되었습니다. 혼자서 해결하세요.',                 difficulty:'hard',     primeRange:[2,97], timeLimitSec:120, hintCount:0, rewards:{ coins:200 } },
  { id:15, title:'2분의 법칙',         storyText:'2분 안에 해독해야 합니다. 소수 테이블을 기억하세요.',                   difficulty:'hard',     primeRange:[2,97], timeLimitSec:120, hintCount:0, rewards:{ coins:220 } },
  { id:16, title:'오류 패널티',        storyText:'오답 입력 시 20초가 차감됩니다. 신중하게 접근하세요.',                  difficulty:'hard',     primeRange:[2,97], timeLimitSec:120, hintCount:0, rewards:{ coins:220 } },
  { id:17, title:'고급 완료',          storyText:'고급 과정 완료. 이제 전문가 단계입니다.',                               difficulty:'hard',     primeRange:[2,97], timeLimitSec:120, hintCount:0, rewards:{ coins:300, badge:'badge_hard' } },
  // ── 전문가 (18-20) ───────────────────────────────────────────────────────
  { id:18, title:'90초의 위기',        storyText:'90초 안에 해독하라. 실패하면 적이 코드를 바꿉니다.',                    difficulty:'expert',   primeRange:[2,97], timeLimitSec:90, hintCount:0, rewards:{ coins:500 } },
  { id:19, title:'최후의 암호',        storyText:'이것이 마지막 임무입니다. 모든 실력을 발휘하세요.',                      difficulty:'expert',   primeRange:[2,97], timeLimitSec:90, hintCount:0, rewards:{ coins:500 } },
  { id:20, title:'MASTER AGENT',       storyText:'축하합니다. 당신은 진정한 암호 해독 마스터입니다.',                      difficulty:'expert',   primeRange:[2,97], timeLimitSec:90, hintCount:0, rewards:{ coins:1000, badge:'badge_expert' } },
]

export const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'BEGINNER',
  easy:     'EASY',
  medium:   'MEDIUM',
  hard:     'HARD',
  expert:   'EXPERT',
}

export const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#6366f1',
  easy:     '#06b6d4',
  medium:   '#f59e0b',
  hard:     '#ff2d78',
  expert:   '#ff0000',
}
