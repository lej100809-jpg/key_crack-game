const P = 3

function toRects(rows: string[], colorMap: Record<string, string>, scale = P) {
  const rects: { x: number; y: number; c: string }[] = []
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => { if (ch !== ' ' && colorMap[ch]) rects.push({ x, y, c: colorMap[ch] }) })
  )
  const W = Math.max(...rows.map(r => r.length)) * scale
  const H = rows.length * scale
  return { rects, W, H }
}

// ─── 캐릭터 데이터 ────────────────────────────────────────────────────────────

const DEFS: Record<string, { g: string[]; c: Record<string, string> }> = {

  // 1. CIPHER — 사이버 에이전트 (기본)
  skin_cipher: { g:[
    '    HHHHHH   ',
    '   HHHHHHHH  ',
    '   HSSSSSSSH ',
    '   HWWWWWWWH ',
    '   HCCCCCCCH ',
    '    HSSSSSH  ',
    '   AAACCAAAA ',
    '   AAAAAAAAAA',
    '   ABBBBBBAAA',
    '   AAAAAAAAAA',
    '    AA    AA ',
    '    LL    LL ',
    '    LL    LL ',
    '   LLL    LLL',
  ], c:{ H:'#1a3a5c',S:'#f4c5a0',W:'#b8e4ff',C:'#00d4ff',A:'#1a4a8a',B:'#0088cc',L:'#0f2a4a' } },

  // 2. GHOST — 스텔스 요원
  skin_ghost: { g:[
    '   WWWWWWW   ',
    '  WWWWWWWWW  ',
    '  WGGGGGGGW  ',
    '  WG B B GW  ',
    '  WWGGGGGWW  ',
    '   WGGGGGW   ',
    '  DDDDDDDDD  ',
    '  DDDDDDDDD  ',
    '  DDWWWWWDD  ',
    '  DDDDDDDDD  ',
    '  DDDDDDDDD  ',
    '   DD    DD  ',
    '   GL    LG  ',
    '   GLL  LLG  ',
  ], c:{ W:'#e8e8f0',G:'#888899',B:'#333344',D:'#c8c8d8',L:'#aaaabc' } },

  // 3. MATRIX — 해커 (후드)
  skin_matrix: { g:[
    '  GGGGGGGGG  ',
    ' GGGGGGGGGGG ',
    ' GHHHHHHHHHG ',
    ' GH S   S HG ',
    ' GHSSSSSSSSHG',
    ' GHHHHHHHHG  ',
    ' GGAAAAAAGGG ',
    '  GAAAAAAAAG ',
    '  GAAGGGGGAG ',
    '  GAAAAAAAG  ',
    '   GA    AG  ',
    '   LL    LL  ',
    '   LL    LL  ',
    '  LLL    LLL ',
  ], c:{ G:'#003300',H:'#004400',S:'#c8a878',A:'#005500',L:'#002200' } },

  // 4. PHANTOM — 마법사
  skin_phantom: { g:[
    '    PPPPPP   ',
    '   PPPPPPP   ',
    '   PP  PPPP  ',
    '   PSSSSSP   ',
    '   PSE ESP   ',
    '   PSSMSSP   ',
    '  RRRRRRRRR  ',
    ' RRRRRRRRRRR ',
    ' RRAAAAAAARR ',
    ' RRRRRRRRRRR ',
    ' RRRRRRRRR   ',
    '  RRR    RRR ',
    '  RL      LR ',
    ' RLL      LLR',
  ], c:{ P:'#5500aa',S:'#f0c8a0',E:'#220044',M:'#cc6677',R:'#7700cc',A:'#9922dd',L:'#440088' } },

  // 5. CRIMSON — 전사
  skin_crimson: { g:[
    '   DDDDDDD   ',
    '   DSSSSSSD  ',
    '   DS     SD ',
    '   DSSSSSD   ',
    '    DSSSSD   ',
    '    DSMMSD   ',
    '  AAADDAAAA  ',
    '  AAAAAAAA   ',
    '  ARRRRRAA   ',
    '  AAAAAAAA   ',
    '  AAAAAAA    ',
    '   AA    AA  ',
    '   LL    LL  ',
    '  LLL    LLL ',
  ], c:{ D:'#220000',S:'#f0b090',A:'#880000',R:'#cc2200',L:'#440000',M:'#cc6655' } },

  // 6. GOLDEN — 전설 (왕관)
  skin_golden: { g:[
    '  G G G GG   ',
    '  GGGGGGG    ',
    '  GSSSSSSG   ',
    '  GS E E SG  ',
    '  GSSSSSSG   ',
    '   GGGGGGG   ',
    '  AAAAAAAAAA ',
    '  AKKKKKAAA  ',
    '  AAAAAAAAAA ',
    '  AKKKKKAAA  ',
    '  AAAAAAA    ',
    '   AA    AA  ',
    '   LL    LL  ',
    '  LLL    LLL ',
  ], c:{ G:'#b8860b',S:'#f5d5a0',E:'#442200',A:'#cc9900',K:'#ffdd00',L:'#886600' } },

  // 7. STORM — 번개 기사
  skin_storm: { g:[
    '   HHHHHHH   ',
    '   HSSSSSH   ',
    '  HSSSSSSSH  ',
    '  HS B  BSH  ',
    '  HSSSSSSSH  ',
    '   HSSMMSH   ',
    '  WWWWWWWWW  ',
    '  WYYYYYYYW  ',
    '  WYYWWWYYW  ',
    '  WYYYYYYYW  ',
    '   WW    WW  ',
    '   YL    LY  ',
    '   YL    LY  ',
    '  YLL    LLY ',
  ], c:{ H:'#334466',S:'#f0d0b0',B:'#223355',M:'#cc9966',W:'#aaccee',Y:'#ffee44',L:'#445566' } },

  // 8. NEON — 핑크 네온
  skin_neon: { g:[
    '   PPPPPP    ',
    '  PPPPPPPP   ',
    '  PSSSSSSP   ',
    '  PS E ESP   ',
    '  PSSSSSP    ',
    '   PSMMSP    ',
    '  NNNNNNNN   ',
    '  NNNNNNNN   ',
    '  NPPPPNN    ',
    '  NNNNNNNN   ',
    '   NN    NN  ',
    '   PL    LP  ',
    '   PL    LP  ',
    '  PLL    LLP ',
  ], c:{ P:'#ff44aa',S:'#f5d0b0',E:'#220033',M:'#ee6688',N:'#cc0077',L:'#881155' } },

  // 9. ICE — 빙결 술사
  skin_ice: { g:[
    '   IIIIIII   ',
    '   ISSSSSI   ',
    '   IS   SI   ',
    '   ISSSSSI   ',
    '    ISSI I   ',
    '    ISMSI    ',
    '  IIIIIIIIII ',
    '  IBBBBBBII  ',
    '  IIIIIIIIII ',
    '  IBBBBBBII  ',
    '   II    II  ',
    '   BL    LB  ',
    '   BL    LB  ',
    '  BLL    LLB ',
  ], c:{ I:'#88ccee',S:'#eef8ff',B:'#4499bb',L:'#336688',M:'#aaddff' } },

  // 10. SHADOW — 다크 어쌔신
  skin_shadow: { g:[
    '  KKKKKKKK   ',
    '  KSSSSSSKK  ',
    '  KS B B SK  ',
    '  KSSSSSSK   ',
    '  KSSMMSK    ',
    '   KKKKKK    ',
    '  KKKKKKKKK  ',
    '  KVVVVVKK   ',
    '  KKKKKKKKK  ',
    '  KVVVVVKK   ',
    '   KK    KK  ',
    '   KL    LK  ',
    '   KL    LK  ',
    '  KLL    LLK ',
  ], c:{ K:'#111122',S:'#d0b090',B:'#331144',M:'#995566',V:'#440066',L:'#220033' } },

  // 11. OMEGA — 궁극의 전사
  skin_omega: { g:[
    '   DDDDDDDD  ',
    '   DSSSSSSSD ',
    '   DS R  RSD ',
    '   DSSSSSSSD ',
    '    DSSSSSD  ',
    '    DSMMSD   ',
    '  OOODOOOOO  ',
    '  OOOOOOOO   ',
    '  ODDDDOOO   ',
    '  OOOOOOOO   ',
    '   OO    OO  ',
    '   OL    LO  ',
    '   OL    LO  ',
    '  OLL    LLO ',
  ], c:{ D:'#330000',S:'#e8b090',R:'#ff2200',M:'#cc5544',O:'#550000',L:'#220000' } },

  // 12. CIRCUIT — 오렌지 회로
  skin_circuit: { g:[
    '    CCCCCC   ',
    '   CSSSSSC   ',
    '   CS    SC  ',
    '   CSSSSSC   ',
    '    CSSC C   ',
    '    CSMC     ',
    '  OOOCCCOO   ',
    '  OOOOOOO    ',
    '  OCCCCCOO   ',
    '  OOOOOOO    ',
    '   OO    OO  ',
    '   CL    LC  ',
    '   CL    LC  ',
    '  CLL    LLC ',
  ], c:{ C:'#ff6600',S:'#f0c090',O:'#cc4400',L:'#882200',M:'#ff9944' } },

  // 13. VIRUS — 독성 바이러스
  skin_virus: { g:[
    '  VVVVVVVVV  ',
    '  VSSSSSSV   ',
    '  VS B B SV  ',
    '  VSSSSSSSV  ',
    '   VSSMSV    ',
    '    VVVV     ',
    '  YYYYVYYYY  ',
    '  YYYYYYYYY  ',
    '  YVVVVVYY   ',
    '  YYYYYYYYY  ',
    '   YY    YY  ',
    '   VL    LV  ',
    '   VL    LV  ',
    '  VLL    LLV ',
  ], c:{ V:'#226600',S:'#d0e8a0',B:'#113300',M:'#88bb44',Y:'#44aa00',L:'#114400' } },

  // 14. ANGEL — 천사
  skin_angel: { g:[
    ' W W AAAA W W',
    '  WWAAAAAWW  ',
    '   WSSSSSSW  ',
    '   WS   SW   ',
    '   WSSSSW    ',
    '    WSMSW    ',
    '  WWWWWWWWWW ',
    '  WBBBBBBBWW ',
    '  WWWWWWWWWW ',
    '   WW    WW  ',
    '   BL    LB  ',
    '   BL    LB  ',
    '  BLL    LLB ',
  ], c:{ W:'#fffff0',A:'#ffeeaa',S:'#f5d5b0',M:'#ee9999',B:'#ddeeff',L:'#aabbcc' } },

  // 15. DEMON — 악마
  skin_demon: { g:[
    ' R R DDDD R R',
    '  RRDDDDDRR  ',
    '   RDSSSSDR  ',
    '   RD R RDR  ',
    '   RDSSSSDR  ',
    '    RDSM DR  ',
    '  BBBDDDBBBB ',
    '  BBBBBBBBB  ',
    '  BDDDDDBBB  ',
    '  BBBBBBBBB  ',
    '   BB    BB  ',
    '   DL    LD  ',
    '   DL    LD  ',
    '  DLL    LLD ',
  ], c:{ R:'#cc2200',D:'#440000',S:'#d09080',B:'#220000',L:'#330000',M:'#ff4422' } },

  // 16. NINJA — 닌자
  skin_ninja: { g:[
    '   KKKKKKKK  ',
    '  KKKKKKKKKK ',
    '  KKSSSSSKKK ',
    '  KKS B SKK  ',
    '  KKSSSSSKK  ',
    '  KKKKKKKK   ',
    '  KKKKKKKKK  ',
    '  KGGGGGKK   ',
    '  KKKKKKKKK  ',
    '  KGGGGGKK   ',
    '   KK    KK  ',
    '   KL    LK  ',
    '   KL    LK  ',
    '  KLL    LLK ',
  ], c:{ K:'#111111',S:'#e0c8a0',B:'#220022',G:'#333333',L:'#222222' } },

  // 17. KNIGHT — 기사
  skin_knight: { g:[
    '   SSSSSSSS  ',
    '   SSSSSSSSS ',
    '   SSSSSSSSS ',
    '   SS B B SS ',
    '   SSSSSSSSS ',
    '   SSSSSSSSS ',
    '  SSSSSSSSSS ',
    '  SBBBBBBBSS ',
    '  SSSSSSSSSS ',
    '  SBBBBBBBSS ',
    '   SS    SS  ',
    '   SL    LS  ',
    '   SL    LS  ',
    '  SLL    LLS ',
  ], c:{ S:'#aabbcc',B:'#778899',L:'#556677' } },

  // 18. WIZARD — 마법사 (파란)
  skin_wizard: { g:[
    '    BBBBBB   ',
    '   BBBBBBB   ',
    '   BBB BBB   ',
    '   BSSSSSSB  ',
    '   BS E E SB ',
    '   BSSSMSSB  ',
    '  RRBBBBRRR  ',
    ' RRRRRRRRRR  ',
    ' RRBBBBBBRRR ',
    ' RRRRRRRRRR  ',
    '  RRR    RR  ',
    '  RL      LR ',
    '  RL      LR ',
    ' RLL      LLR',
  ], c:{ B:'#224488',S:'#f0d0b0',E:'#001133',M:'#cc8866',R:'#3355aa',L:'#112266' } },

  // 19. HUNTER — 사냥꾼
  skin_hunter: { g:[
    '   BBBBBBB   ',
    '   BSSSSSSB  ',
    '   BS     SB ',
    '   BSSSSSSB  ',
    '    BSSSSB   ',
    '    BSMMBS   ',
    '  GGGBBGGGG  ',
    '  GGGGGGGGG  ',
    '  GBBBBGGGG  ',
    '  GGGGGGGGG  ',
    '   GG    GG  ',
    '   GL    LG  ',
    '   GL    LG  ',
    '  GLL    LLG ',
  ], c:{ B:'#5c3a1e',S:'#f0c090',G:'#4a6a3a',L:'#2a4a1a',M:'#cc8866' } },

  // 20. CYBER — 사이버 핑크
  skin_cyber: { g:[
    '   PPHHHHPP  ',
    '  PPHSSSSHHP ',
    '  PPHSSSSHHP ',
    '  PPH B BHHP ',
    '  PPHHSSHHPP ',
    '   PPHSMHPP  ',
    '  CCPPPPPCC  ',
    '  CCPPPPPCC  ',
    '  CCPPCPPCC  ',
    '  CCPPPPPCC  ',
    '   PP    PP  ',
    '   PL    LP  ',
    '   PL    LP  ',
    '  PLL    LLP ',
  ], c:{ P:'#ff44cc',H:'#ff88dd',S:'#f5d0c0',B:'#440033',C:'#cc0099',L:'#881166',M:'#ff6699' } },

}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

interface Props {
  skinId: string
  scale?: number
  style?: React.CSSProperties
}

export default function PixelChar({ skinId, scale = P, style }: Props) {
  const def = DEFS[skinId] ?? DEFS['skin_cipher']
  const { rects, W, H } = toRects(def.g, def.c, scale)

  return (
    <svg
      width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ imageRendering:'pixelated', ...style }}
      shapeRendering="crispEdges"
    >
      {rects.map(({ x, y, c }, i) => (
        <rect key={i} x={x*scale} y={y*scale} width={scale} height={scale} fill={c} />
      ))}
    </svg>
  )
}
