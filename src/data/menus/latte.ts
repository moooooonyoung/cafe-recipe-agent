import type { Menu } from '../types'

// 출처: 아이스 라떼의 재료 순서와 단계는 근무 경험 기준이고, 양은 샘플 값이다. 핫 라떼는 전부 샘플 값.
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
      ice: { regular: 150, large: 200 },
      milk: { regular: 150, large: 210 },
      espresso: { regular: 2, large: 3 },
    },
  },
} as const satisfies Menu
