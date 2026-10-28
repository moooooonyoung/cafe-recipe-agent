import type { IngredientId } from './ingredients'
import type { Substitute } from './types'

// 재료별 대체 후보. 앞쪽일수록 먼저 제안한다. 후보의 안내 메모는 src/i18n/ko/substitutions.ts.
// 적혀 있지 않은 재료는 대체할 수 없다(품절이면 제조 불가).
// 대체는 한 단계만 본다: 후보의 후보까지 따라가지 않는다.
export const substitutions: Partial<Record<IngredientId, readonly Substitute[]>> = {
  oat_milk: [{ id: 'milk' }, { id: 'soy_milk' }],
  milk: [{ id: 'oat_milk' }, { id: 'soy_milk' }],
  // ⚠️ [사용자 검토 필요] 시럽 ↔ 바닐라 시럽 대체를 둘지 결정
  syrup: [{ id: 'vanilla_syrup' }],
  vanilla_syrup: [{ id: 'syrup' }],
  // ⚠️ [사용자 검토 필요] 탄산수 → 물 대체를 둘지 결정
  sparkling_water: [{ id: 'water' }],
}
