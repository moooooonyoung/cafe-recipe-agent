import type { FillLevel, Sweetness } from '../../data/types'

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
}
