import type { Menu } from '../types'

// 아이스만 판다. 레몬청이 단맛이라 당도 옵션 없음(sweetener 없음).
export const lemonAde = {
  id: 'lemon_ade',
  category: 'tea-ade',
  temps: ['ice'],
  recipes: {
    ice: {
      lemon_syrup: { regular: 40, large: 60 },
      sparkling_water: { regular: 150, large: 220 },
      ice: { regular: 150, large: 200 },
    },
  },
  nonSubstitutable: ['lemon_syrup'],
} as const satisfies Menu
