import type { IngredientId } from '../data/ingredients'
import type { Temperature } from '../data/types'

// 단계 문장 목록(온도별). 문장 안의 {재료id}는 화면에서 "이름 + 양"으로 바뀐다(예: {milk} → 우유 200ml).
// 양에 단위까지 붙어서 나오므로, 조사가 바뀌는 을/를·이/가 같은 말은 {재료id} 바로 뒤에 쓰지 않는다.
// ("에"처럼 안 바뀌는 조사는 괜찮다.) 그래서 단계는 "~ 붓기"처럼 명사형으로 끝낸다.
// 메뉴의 sweetener를 참조하는 단계는 당도가 '없음'(펌프 0)이면 건너뛴다.
export type Steps = { [T in Temperature]?: readonly string[] }

export type MenuText = {
  name: string
  steps: Steps
  // 라지에서 단계가 실제로 다른 메뉴만 적는다. 없으면 steps를 그대로 쓴다.
  largeSteps?: Steps
}

// 대체 안내 메모: 원래 재료 id → 대체 재료 id → 메모
export type SubstitutionNotes = Partial<Record<IngredientId, Partial<Record<IngredientId, string>>>>
