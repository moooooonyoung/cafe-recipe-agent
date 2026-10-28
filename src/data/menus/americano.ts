import type { Menu } from '../types'

// 출처: 근무 경험 기준. 줄마다 적은 대로, 근무 경험이 아닌 값은 샘플 값이고 기억이 불확실한 값은 추정이다.
export const americano = {
  id: 'americano',
  category: 'coffee',
  temps: ['hot', 'ice'],
  defaults: { sweetness: 'none' }, // 샘플 값
  sweetener: 'syrup',
  recipes: {
    hot: {
      espresso: { regular: 2, large: 3 }, // 샘플 값
      water: { regular: 'to-full', large: 'to-full' }, // 근무 경험 기준
    },
    ice: {
      ice: { regular: 180, large: 200 }, // 근무 경험 기준. 라지 200g은 추정
      water: { regular: 'to-line', large: 'to-line' }, // 근무 경험 기준
      espresso: { regular: 2, large: 3 }, // 근무 경험 기준
    },
  },
} as const satisfies Menu
