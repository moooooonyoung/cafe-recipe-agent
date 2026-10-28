import type { Menu } from '../types'

// 출처: 샘플 값(3분 우리는 단계는 검토에서 정함).
// 핫만 판다.
export const chamomileTea = {
  id: 'chamomile_tea',
  category: 'tea-ade',
  temps: ['hot'],
  defaults: { temp: 'hot', sweetness: 'none' },
  sweetener: 'syrup',
  recipes: {
    hot: {
      chamomile_teabag: { regular: 1, large: 1 },
      water: { regular: 300, large: 400 },
    },
  },
  nonSubstitutable: ['chamomile_teabag'],
} as const satisfies Menu
