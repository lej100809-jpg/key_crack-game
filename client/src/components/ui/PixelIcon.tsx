/**
 * 도트아트 아이콘 컴포넌트
 * 모든 아이콘은 SVG rect 픽셀로 렌더링 — 이모지/이미지 없음
 */

const ICONS: Record<string, { g: string[]; c: Record<string, string> }> = {

  // ── 검 (배틀/전투) ──────────────────────────────────
  sword: { g: [
    '    X    ',
    '    X    ',
    '   XXX   ',
    '    X    ',
    '    X    ',
    '    X    ',
    '    X    ',
    '    X    ',
    '  XXXXX  ',
    '    X    ',
  ], c: { X: '#aac0d8' } },

  // ── 교차 검 (배틀 모드) ─────────────────────────────
  crossed_swords: { g: [
    'X       X',
    ' X     X ',
    '  X   X  ',
    '   X X   ',
    '    X    ',
    '   X X   ',
    '  X   X  ',
    ' X     X ',
    'X       X',
  ], c: { X: '#aac0d8' } },

  // ── 자물쇠 (볼트/잠금) ─────────────────────────────
  lock: { g: [
    '  XXXXX  ',
    ' X     X ',
    ' X     X ',
    ' XXXXXXX ',
    ' X  X  X ',
    ' X  X  X ',
    ' X  X  X ',
    ' XXXXXXX ',
  ], c: { X: '#ffd700' } },

  // ── 열린 자물쇠 ─────────────────────────────────────
  unlock: { g: [
    ' XXXXX   ',
    'X     X  ',
    'X     X  ',
    ' XXXXXXX ',
    ' X  X  X ',
    ' X  X  X ',
    ' XXXXXXX ',
  ], c: { X: '#00ff88' } },

  // ── 열쇠 (key crack) ────────────────────────────────
  key: { g: [
    ' XXX     ',
    'X   X    ',
    'X   X XXX',
    ' XXX X   ',
    '     X X ',
    '     X   ',
    '     X   ',
  ], c: { X: '#ffd700' } },

  // ── 번개 (도전/스톰) ───────────────────────────────
  bolt: { g: [
    '   XXXX  ',
    '  XXXXX  ',
    ' XXXXXX  ',
    ' XXXXX   ',
    '  XXXXXX ',
    '   XXXXX ',
    '    XXXX ',
    '     XXX ',
  ], c: { X: '#ffee44' } },

  // ── 폴더/스테이지 ──────────────────────────────────
  folder: { g: [
    ' XXXXX   ',
    'XXXXXXXXX',
    'X       X',
    'X       X',
    'X       X',
    'X       X',
    'XXXXXXXXX',
  ], c: { X: '#06b6d4' } },

  // ── 책 (학습) ───────────────────────────────────────
  book: { g: [
    ' XXXXXXX ',
    ' X     X ',
    ' X XXX X ',
    ' X     X ',
    ' X XXX X ',
    ' X     X ',
    ' X XXX X ',
    ' X     X ',
    ' XXXXXXX ',
  ], c: { X: '#00d4ff' } },

    // ── 전구 (힌트) ─────────────────────────────────────
  bulb: { g: [
    '   XXX   ',
    '  XXXXX  ',
    ' XXXXXXX ',
    ' XXXXXXX ',
    ' XXXXXXX ',
    '  XXXXX  ',
    '   XXX   ',
    '   X X   ',
    '   XXX   ',
  ], c: { X: '#ffee44' } },

  // ── 모래시계 (타이머) ───────────────────────────────
  hourglass: { g: [
    ' XXXXXXX ',
    ' X     X ',
    '  X   X  ',
    '   X X   ',
    '   XXX   ',
    '   X X   ',
    '  X   X  ',
    ' X     X ',
    ' XXXXXXX ',
  ], c: { X: '#00d4ff' } },

  // ── 다이아몬드 (프리미엄) ───────────────────────────
  diamond: { g: [
    '    X    ',
    '   XXX   ',
    '  XXXXX  ',
    ' XXXXXXX ',
    'XXXXXXXXX',
    ' XXXXXXX ',
    '  XXXXX  ',
    '   XXX   ',
    '    X    ',
  ], c: { X: '#44ddff' } },

  // ── 쇼핑백 (상점) ───────────────────────────────────
  bag: { g: [
    '  X   X  ',
    ' XXXXXXX ',
    'XXXXXXXXX',
    'X       X',
    'X  XXX  X',
    'X       X',
    'X       X',
    'XXXXXXXXX',
  ], c: { X: '#ff88cc' } },

  // ── 게임 컨트롤러 ──────────────────────────────────
  gamepad: { g: [
    ' XXXXXXX ',
    'XXXXXXXXX',
    'X X X X X',
    'X   X   X',
    'X X X X X',
    'XXXXXXXXX',
    ' X     X ',
    '  XXXXX  ',
  ], c: { X: '#00d4ff' } },

  // ── 메달/배지 ───────────────────────────────────────
  medal: { g: [
    '  XXXXX  ',
    ' X     X ',
    'X  XXX  X',
    'X  X X  X',
    'X  XXX  X',
    ' X     X ',
    '  XXXXX  ',
    '    X    ',
    '   XXX   ',
  ], c: { X: '#ffd700' } },

  // ── 알약/소모품 ─────────────────────────────────────
  pill: { g: [
    '  XXXX   ',
    ' X    X  ',
    'X  XX  X ',
    'X  XX  X ',
    'X      X ',
    ' X    X  ',
    '  XXXX   ',
  ], c: { X: '#00ff88' } },

  // ── 방패 ────────────────────────────────────────────
  shield: { g: [
    ' XXXXXXX ',
    'XXXXXXXXX',
    'X       X',
    'X  XXX  X',
    'X  XXX  X',
    ' X     X ',
    '  X   X  ',
    '   X X   ',
    '    X    ',
  ], c: { X: '#00d4ff' } },

  // ── 해골 (나이트메어) ──────────────────────────────
  skull: { g: [
    '  XXXXX  ',
    ' XXXXXXX ',
    'X X   X X',
    'X XXXXX X',
    ' XXXXXXX ',
    '  XXXXX  ',
    '  X   X  ',
    ' XX   XX ',
  ], c: { X: '#ff2d78' } },

  // ── 별 (레이팅) ─────────────────────────────────────
  star: { g: [
    '    X    ',
    '    X    ',
    ' X  X  X ',
    '  XXXXX  ',
    '   XXX   ',
    '  XXXXX  ',
    ' X  X  X ',
    'X   X   X',
  ], c: { X: '#ffd700' } },

  // ── 코인 ────────────────────────────────────────────
  coin: { g: [
    '  XXXXX  ',
    ' X     X ',
    'X  XXX  X',
    'X X   X X',
    'X  XXX  X',
    ' X     X ',
    '  XXXXX  ',
  ], c: { X: '#ffd700' } },

  // ── 사람/유저 ───────────────────────────────────────
  user: { g: [
    '  XXXXX  ',
    ' X     X ',
    ' X     X ',
    '  XXXXX  ',
    ' XXXXXXX ',
    'XXXXXXXXX',
    'X       X',
    'X       X',
  ], c: { X: '#aab8cc' } },

  // ── 체크 (정답) ─────────────────────────────────────
  check: { g: [
    '        X',
    '       XX',
    'X     XX ',
    'XX   XX  ',
    ' XX XX   ',
    '  XXX    ',
    '   X     ',
  ], c: { X: '#00ff88' } },

  // ── X (오답) ────────────────────────────────────────
  cross: { g: [
    'X       X',
    ' X     X ',
    '  X   X  ',
    '   X X   ',
    '    X    ',
    '   X X   ',
    '  X   X  ',
    ' X     X ',
    'X       X',
  ], c: { X: '#ff2d78' } },

  // ── 블라인드 (눈 가림) ─────────────────────────────
  blind: { g: [
    '  XXXXX  ',
    'XXXXXXXXX',
    'X       X',
    'XXXXXXXXX',
    '  XXXXX  ',
    '    X    ',
    '   XXX   ',
  ], c: { X: '#888899' } },

  // ── 홈 ─────────────────────────────────────────────
  home: { g: [
    '    X    ',
    '   XXX   ',
    '  XXXXX  ',
    ' XXXXXXX ',
    'XXXXXXXXX',
    ' X     X ',
    ' X  X  X ',
    ' X  X  X ',
    ' XXXXXXX ',
  ], c: { X: '#00d4ff' } },
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

interface Props {
  name:    string
  scale?:  number      // 기본 2 (1칸=2px)
  color?:  string      // 단색 오버라이드
  style?:  React.CSSProperties
}

export default function PixelIcon({ name, scale = 2, color, style }: Props) {
  const def = ICONS[name]
  if (!def) return null

  const colorMap = color
    ? Object.fromEntries(Object.keys(def.c).map(k => [k, color]))
    : def.c

  const rects: { x: number; y: number; c: string }[] = []
  def.g.forEach((row, y) =>
    [...row].forEach((ch, x) => { if (ch !== ' ' && colorMap[ch]) rects.push({ x, y, c: colorMap[ch] }) })
  )

  const W = Math.max(...def.g.map(r => r.length)) * scale
  const H = def.g.length * scale

  return (
    <svg
      width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ imageRendering: 'pixelated', display: 'inline-block', verticalAlign: 'middle', ...style }}
      shapeRendering="crispEdges"
    >
      {rects.map(({ x, y, c }, i) => (
        <rect key={i} x={x * scale} y={y * scale} width={scale} height={scale} fill={c} />
      ))}
    </svg>
  )
}

// 이모지 → 아이콘 이름 매핑 (편의 함수)
export const EMOJI_MAP: Record<string, string> = {
  '⚔️': 'crossed_swords',
  '🔒': 'lock',
  '🔓': 'unlock',
  '🗂️': 'folder',
  '📐': 'book',
  '💡': 'bulb',
  '⏳': 'hourglass',
  '💎': 'diamond',
  '🛒': 'bag',
  '🎮': 'gamepad',
  '🏅': 'medal',
  '💊': 'pill',
  '⚡': 'bolt',
  '💀': 'skull',
  '🙈': 'blind',
  '⭐': 'star',
  '💰': 'coin',
  '👤': 'user',
  '✓': 'check',
  '✗': 'cross',
  '🔑': 'key',
  '🛡': 'shield',
  '🏠': 'home',
}
