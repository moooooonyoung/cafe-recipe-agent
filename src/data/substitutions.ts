import type { IngredientId } from './ingredients'
import type { Substitute } from './types'

// 출처: 검토에서 정함(사용자가 직접 결정). 재료별 대체 후보. 앞쪽일수록 먼저 제안한다. 후보의 안내 메모는 src/i18n/ko/substitutions.ts.
// 적혀 있지 않은 재료는 대체할 수 없다(품절이면 제조 불가). 예: 탄산수는 품절이면 에이드가 제조 불가.
// 대체는 한 단계만 본다: 후보의 후보까지 따라가지 않는다.
export const substitutions: Partial<Record<IngredientId, readonly Substitute[]>> = {
  oat_milk: [{ id: 'milk' }, { id: 'soy_milk' }],
  milk: [{ id: 'oat_milk' }, { id: 'soy_milk' }],
  // 검토에서 유지하기로 정함. 반대 방향(바닐라 시럽 → 시럽)은 두지 않는다.
  syrup: [{ id: 'vanilla_syrup' }],
}
