import type { Menu } from '../types'

// 출처: 샘플 값(아이스 단계 순서만 검토에서 아이스 커피·라떼류 기준으로 정함).
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
      ice: { regular: 150, large: 200 },
      oat_milk: { regular: 150, large: 210 },
      espresso: { regular: 2, large: 3 },
    },
  },
} as const satisfies Menu
