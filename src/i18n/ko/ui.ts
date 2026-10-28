import type { Unit } from '../../data/ingredients'
import type { Category, ExtraShots, FillLevel, Size, Sweetness, Temperature } from '../../data/types'
import { euro } from './josa'

// 화면에 보이는 한국어 문구. 영어를 추가하면 en.ts를 같은 모양으로 만든다.
export const ko = {
  // 이 언어의 정렬 기준(Intl.Collator에 넘긴다). 영어를 추가하면 'en'.
  locale: 'ko',
  appTitle: '카페 레시피 가이드',
  sweetness: {
    none: '없음',
    less: '덜 달게',
    normal: '보통',
    more: '많이',
  } satisfies Record<Sweetness, string>,
  // 숫자 대신 FillLevel로 적은 재료 양(예: 물 '컵 선까지')
  fillLevel: {
    'to-line': '컵 선까지',
    'to-full': '컵 가득',
  } satisfies Record<FillLevel, string>,
  // 숫자 양 뒤에 붙는 단위
  unit: {
    ml: 'ml',
    g: 'g',
    shot: '샷',
    pump: '펌프',
    ea: '개',
  } satisfies Record<Unit, string>,
  // 아이스·핫은 색과 글자를 함께 쓴다(색만으로 구분하지 않는다)
  temp: {
    ice: 'ICE ❄️',
    hot: 'HOT 🔥',
  } satisfies Record<Temperature, string>,
  size: { regular: '레귤러', large: '라지' } satisfies Record<Size, string>,
  shots: { 0: '추가 없음', 1: '+1샷', 2: '+2샷' } satisfies Record<ExtraShots, string>,
  // 옵션 요약(가이드 화면 맨 위)
  summary: {
    shots: (n: number) => `샷 +${n}`,
    sweetness: (label: string) => `당도 ${label}`,
  },
  // 옵션 확인 화면
  options: {
    back: '메뉴로 돌아가기',
    temp: '온도',
    size: '사이즈',
    extraShots: '샷 추가',
    sweetness: '당도',
    start: '레시피 보기',
    // 기본 옵션이 재고 때문에 막혀서 옵션을 자동으로 바꿨을 때의 안내. cause는 '얼음 품절' 같은 이유
    notice: '안내',
    switchedTemp: {
      ice: (cause: string) => `${cause}로 ICE로 바꿨어요`,
      hot: (cause: string) => `${cause}로 HOT으로 바꿨어요`,
    } satisfies Record<Temperature, (cause: string) => string>,
    switchedSweetness: (cause: string, label: string) => `${cause}로 당도를 바꿨어요 (${label})`,
  },
  // 제조 가이드 화면
  guide: {
    editOptions: '옵션 바꾸기', // 옵션 요약을 누르면 옵션 화면으로 돌아간다
    ingredients: '재료',
    stepsLabel: '만드는 순서', // 단계 목록의 이름(화면 낭독기용)
    soldOut: '✕ 품절',
    // 대체한 재료에 붙는 배지. from은 원래 재료 이름
    substituted: (from: string) => `대체 · ${from} 대신`,
    // 대체 제안 배너. from은 품절된 재료, to는 대체 후보
    suggest: (from: string, to: string) => `${from} 품절 → ${euro(to)} 대체할까요?`,
    apply: '대체 적용',
    cancel: '취소',
    blocked: '✕ 제조 불가',
    // 제조 불가 패널의 설명: 후보를 모두 취소했는지, 처음부터 대체할 수 없었는지
    blockedHint: {
      cancelled: '대체 후보를 모두 취소했어요',
      unavailable: '대체할 수 있는 재료가 없어요',
    },
    done: '✓ 완료',
    toMenu: '메뉴로 돌아가기',
  },
  // 메뉴 선택 화면
  menu: {
    openStock: '재고 관리',
    category: {
      coffee: '커피',
      'non-coffee': '논커피',
      'tea-ade': '티·에이드',
    } satisfies Record<Category, string>,
    substitute: '대체 필요',
    blocked: '✕ 제조 불가',
    tempOff: '불가', // 안 되는 온도 칩(취소선)을 화면 낭독기에 알린다
  },
  // 재고 관리 화면
  stock: {
    title: '재고 관리',
    back: '메뉴로 돌아가기',
    hint: '재료를 누르면 있음과 품절이 바뀝니다',
    inStock: '있음',
    soldOut: '품절',
    allInStock: '모두 있음',
    soldOutCount: (n: number) => `품절 ${n}개`,
    reset: '초기화',
    resetAsk: '기본 재고로 되돌릴까요?',
    resetCancel: '취소',
  },
  // 메뉴 카드 배지와 옵션 선택지에 붙는 짧은 사유
  reason: {
    soldOut: (name: string) => `${name} 품절`,
    substitute: (from: string, to: string) => `${from} → ${to} 대체`,
    onlyTemp: { hot: 'HOT만 가능', ice: 'ICE만 가능' } satisfies Record<Temperature, string>,
    onlySweetness: (label: string) => `당도 ${label}만 가능`,
    separator: ' · ',
  },
}
