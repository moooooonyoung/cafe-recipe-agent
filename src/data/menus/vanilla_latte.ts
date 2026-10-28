import type { Menu } from '../types'

// 당도 옵션이 바닐라 시럽 펌프 수다. 바닐라 시럽은 이 메뉴의 정체성이라 대체 불가.
export const vanillaLatte = {
  id: 'vanilla_latte',
  category: 'coffee',
  temps: ['hot', 'ice'],
  sweetener: 'vanilla_syrup',
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
  nonSubstitutable: ['vanilla_syrup'],
} as const satisfies Menu
