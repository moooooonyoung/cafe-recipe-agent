import type { Menu } from '../types'

// 출처: 샘플 값(아이스 단계 순서만 검토에서 아이스 커피·라떼류 기준으로 정함).
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
      ice: { regular: 150, large: 200 },
      milk: { regular: 150, large: 210 },
      espresso: { regular: 2, large: 3 },
    },
  },
  nonSubstitutable: ['vanilla_syrup'],
} as const satisfies Menu
