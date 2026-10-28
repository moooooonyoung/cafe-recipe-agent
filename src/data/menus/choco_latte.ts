import type { Menu } from '../types'

// 출처: 샘플 값.
// 초코 소스가 기본 단맛이라 시럽 당도는 기본 없음.
export const chocoLatte = {
  id: 'choco_latte',
  category: 'non-coffee',
  temps: ['hot', 'ice'],
  defaults: { sweetness: 'none' },
  sweetener: 'syrup',
  recipes: {
    hot: {
      chocolate_sauce: { regular: 3, large: 4 },
      milk: { regular: 200, large: 280 },
    },
    ice: {
      chocolate_sauce: { regular: 3, large: 4 },
      milk: { regular: 150, large: 210 },
      ice: { regular: 150, large: 200 },
    },
  },
  nonSubstitutable: ['chocolate_sauce'],
} as const satisfies Menu
