import type { IngredientId } from '../data/ingredients'
import type { Stock } from '../data/stock'
import { substitutions } from '../data/substitutions'
import type { Menu, Options, Qty, Substitute } from '../data/types'
import { orderLines, type Line } from './recipe'
import { isAvailable } from './stock'

// 손님 앞에서 [대체 적용] / [취소]로 내린 결정. 화면 상태로 들고 있다가 함께 넘긴다.
export type Decisions = {
  applied: Partial<Record<IngredientId, IngredientId>> // 원래 재료 → 적용한 대체 재료
  rejected: Partial<Record<IngredientId, readonly IngredientId[]>> // 원래 재료 → 취소한 후보들
}

export const noDecisions: Decisions = { applied: {}, rejected: {} }

export function applySubstitution(d: Decisions, from: IngredientId, to: IngredientId): Decisions {
  return { ...d, applied: { ...d.applied, [from]: to } }
}

// [취소]: 이 후보는 쓰지 않는다. 다음 순위 후보가 제안된다.
export function rejectSubstitution(d: Decisions, from: IngredientId, to: IngredientId): Decisions {
  return { ...d, rejected: { ...d.rejected, [from]: [...(d.rejected[from] ?? []), to] } }
}

// ok: 재고 있음 / substituted: 대체 적용됨 / suggest: 대체를 제안하는 중 / blocked: 만들 수 없음
export type ResolvedLine = {
  id: IngredientId // 레시피에 적힌 재료
  use: IngredientId // 실제로 쓰는 재료(대체했다면 id와 다르다)
  amount: Qty // use 기준 양
  state: 'ok' | 'substituted' | 'suggest' | 'blocked'
  candidate?: Substitute // suggest일 때 제안하는 후보
}

function scale(amount: Qty, ratio = 1): Qty {
  return typeof amount === 'number' ? amount * ratio : amount
}

function resolveLine(line: Line, menu: Menu, stock: Stock, decisions: Decisions): ResolvedLine {
  const { id, amount } = line
  if (isAvailable(id, stock)) return { id, use: id, amount, state: 'ok' }
  if (menu.nonSubstitutable?.includes(id)) return { id, use: id, amount, state: 'blocked' }

  const candidates = substitutions[id] ?? []

  // 이미 적용한 대체. 그 재료도 품절이 됐다면 적용하지 않은 것으로 본다.
  const applied = candidates.find((c) => c.id === decisions.applied[id] && isAvailable(c.id, stock))
  if (applied) return { id, use: applied.id, amount: scale(amount, applied.ratio), state: 'substituted' }

  // 취소했거나 품절인 후보는 건너뛰고 다음 순위를 제안한다. 남은 후보가 없으면 제조 불가.
  const rejected = decisions.rejected[id] ?? []
  const next = candidates.find((c) => !rejected.includes(c.id) && isAvailable(c.id, stock))
  if (next) return { id, use: id, amount, state: 'suggest', candidate: next }

  return { id, use: id, amount, state: 'blocked' }
}

// 옵션과 재고에 맞춘 재료 목록. 대체는 한 단계만 본다.
export function resolveOrder(
  menu: Menu,
  options: Options,
  stock: Stock,
  decisions: Decisions = noDecisions,
): ResolvedLine[] {
  return orderLines(menu, options).map((line) => resolveLine(line, menu, stock, decisions))
}
