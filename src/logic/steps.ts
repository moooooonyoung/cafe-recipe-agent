import type { IngredientId } from '../data/ingredients'
import { ingredients } from '../data/ingredients'
import type { Options, Qty } from '../data/types'
import { ingredientNames, strings } from '../i18n'
import type { MenuText } from '../i18n/types'
import type { ResolvedLine } from './substitution'

const PLACEHOLDER = /\{(\w+)\}/g

// 숫자는 단위를 붙이고(2샷), '컵 선까지' 같은 양은 계산하지 않고 문구 그대로 보여준다.
export function formatAmount(use: IngredientId, amount: Qty): string {
  if (typeof amount !== 'number') return strings.fillLevel[amount]
  return `${amount}${strings.unit[ingredients[use].unit]}`
}

// 재료 한 줄을 "이름 양"으로. 대체했다면 대체 재료 이름과 양이 나온다.
export function formatLine(line: ResolvedLine): string {
  return `${ingredientNames[line.use]} ${formatAmount(line.use, line.amount)}`
}

// 가이드 화면의 단계 문장. 라지 전용 단계가 있으면 그것을 쓰고, 없으면 온도별 단계를 쓴다.
// 이번 주문에 들어가지 않는 재료를 참조하는 단계는 뺀다(예: 당도 '없음'이면 시럽 단계).
export function guideSteps(text: MenuText, options: Options, lines: readonly ResolvedLine[]): string[] {
  const templates = (options.size === 'large' && text.largeSteps?.[options.temp]) || text.steps[options.temp] || []
  const byId = new Map(lines.map((l) => [l.id, l]))

  return templates
    .filter((t) => [...t.matchAll(PLACEHOLDER)].every((m) => byId.has(m[1] as IngredientId)))
    .map((t) => t.replace(PLACEHOLDER, (_, id) => formatLine(byId.get(id as IngredientId)!)))
}
