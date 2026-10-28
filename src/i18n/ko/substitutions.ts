import type { SubstitutionNotes } from '../types'

// 대체 후보마다 붙는 짧은 안내 메모. 후보 목록 자체는 src/data/substitutions.ts.
export const substitutionNotes: SubstitutionNotes = {
  oat_milk: {
    milk: '맛이 달라질 수 있음 – 손님께 안내',
    soy_milk: '콩 향이 날 수 있음 – 손님께 안내',
  },
  milk: {
    oat_milk: '고소한 맛이 더해짐 – 손님께 안내',
    soy_milk: '콩 향이 날 수 있음 – 손님께 안내',
  },
  syrup: {
    vanilla_syrup: '바닐라 향이 더해짐 – 손님께 안내',
  },
}
