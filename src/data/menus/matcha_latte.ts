import type { Menu } from '../types'

export const matchaLatte = {
  id: 'matcha_latte',
  category: 'non-coffee',
  temps: ['hot', 'ice'],
  sweetener: 'syrup',
  recipes: {
    hot: {
      matcha_powder: { regular: 10, large: 15 },
      water: { regular: 40, large: 60 },
      milk: { regular: 180, large: 250 },
    },
    ice: {
      matcha_powder: { regular: 10, large: 15 },
      water: { regular: 40, large: 60 },
      milk: { regular: 150, large: 210 },
      ice: { regular: 150, large: 200 },
    },
  },
  nonSubstitutable: ['matcha_powder'],
} as const satisfies Menu
