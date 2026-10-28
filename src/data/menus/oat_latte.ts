import type { Menu } from '../types'

// 오트밀크가 품절이면 우유 등으로 대체를 제안한다(substitutions.ts).
export const oatLatte = {
  id: 'oat_latte',
  category: 'coffee',
  temps: ['hot', 'ice'],
  defaults: { sweetness: 'none' },
  sweetener: 'syrup',
  recipes: {
    hot: {
      espresso: { regular: 2, large: 3 },
      oat_milk: { regular: 200, large: 280 },
    },
    ice: {
      espresso: { regular: 2, large: 3 },
      oat_milk: { regular: 150, large: 210 },
      ice: { regular: 150, large: 200 },
    },
  },
} as const satisfies Menu
