import type { Menu } from '../types'

// 아이스만 판다. 딸기 퓨레가 단맛을 내서 시럽 당도는 기본 없음.
export const strawberryLatte = {
  id: 'strawberry_latte',
  category: 'non-coffee',
  temps: ['ice'],
  defaults: { sweetness: 'none' },
  sweetener: 'syrup',
  recipes: {
    ice: {
      strawberry_puree: { regular: 60, large: 90 },
      milk: { regular: 150, large: 210 },
      ice: { regular: 150, large: 200 },
    },
  },
  nonSubstitutable: ['strawberry_puree'],
} as const satisfies Menu
