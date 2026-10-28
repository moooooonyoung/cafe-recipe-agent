import type { Menu } from '../types'

export const latte = {
  id: 'latte',
  category: 'coffee',
  temps: ['hot', 'ice'],
  defaults: { sweetness: 'none' },
  sweetener: 'syrup',
  recipes: {
    hot: {
      espresso: { regular: 2, large: 3 },
      milk: { regular: 200, large: 280 },
    },
    ice: {
      espresso: { regular: 2, large: 3 },
      milk: { regular: 150, large: 210 },
      ice: { regular: 150, large: 200 },
    },
  },
} as const satisfies Menu
