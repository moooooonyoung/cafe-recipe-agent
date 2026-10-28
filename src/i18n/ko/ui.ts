import type { Unit } from '../../data/ingredients'
import type { FillLevel, Sweetness, Temperature } from '../../data/types'

// 화면에 보이는 한국어 문구. 영어를 추가하면 en.ts를 같은 모양으로 만든다.
export const ko = {
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
  // 재고 관리 화면
  stock: {
    title: '재고 관리',
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
