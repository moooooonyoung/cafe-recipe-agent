import type { Menu } from '../types'

// 핫만 판다. 거품이 핵심이라 우유는 대체 불가.
export const cappuccino = {
  id: 'cappuccino',
  category: 'coffee',
  temps: ['hot'],
  defaults: { temp: 'hot', sweetness: 'none' },
  sweetener: 'syrup',
  recipes: {
    hot: {
      espresso: { regular: 2, large: 3 },
      milk: { regular: 120, large: 180 },
    },
  },
  nonSubstitutable: ['milk'],
} as const satisfies Menu
