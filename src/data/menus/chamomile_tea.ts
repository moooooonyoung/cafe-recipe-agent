import type { Menu } from '../types'

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
