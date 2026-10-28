import type { Menu } from '../types'

// 출처: 샘플 값. 탄산수는 대체할 수 없어서 품절이면 제조 불가(검토에서 정함).
// 아이스만 판다. 자몽청이 단맛이라 당도 옵션 없음(sweetener 없음).
export const grapefruitAde = {
  id: 'grapefruit_ade',
  category: 'tea-ade',
  temps: ['ice'],
  recipes: {
    ice: {
      grapefruit_syrup: { regular: 50, large: 70 },
      sparkling_water: { regular: 150, large: 220 },
      ice: { regular: 150, large: 200 },
    },
  },
  nonSubstitutable: ['grapefruit_syrup'],
} as const satisfies Menu
