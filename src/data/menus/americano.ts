import type { Menu } from '../types'

export const americano = {
  id: 'americano',
  category: 'coffee',
  temps: ['hot', 'ice'],
  defaults: { sweetness: 'none' },
  sweetener: 'syrup',
  recipes: {
    hot: {
      espresso: { regular: 2, large: 3 },
      water: { regular: 150, large: 230 },
    },
    ice: {
      espresso: { regular: 2, large: 3 },
      water: { regular: 120, large: 180 },
      ice: { regular: 150, large: 200 },
    },
  },
} as const satisfies Menu
