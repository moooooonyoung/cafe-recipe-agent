import type { Sweetness } from '../../data/types'

// 화면에 보이는 한국어 문구. 영어를 추가하면 en.ts를 같은 모양으로 만든다.
export const ko = {
  appTitle: '카페 레시피 가이드',
  sweetness: {
    none: '없음',
    less: '덜 달게',
    normal: '보통',
    more: '많이',
  } satisfies Record<Sweetness, string>,
}
