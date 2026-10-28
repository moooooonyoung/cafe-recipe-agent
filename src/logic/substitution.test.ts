import { describe, expect, it } from 'vitest'
import type { IngredientId } from '../data/ingredients'
import { cappuccino } from '../data/menus/cappuccino'
import { oatLatte } from '../data/menus/oat_latte'
import { applySubstitution, noDecisions, rejectSubstitution, resolveOrder, type ResolvedLine } from './substitution'
import { statusOf } from './status'
import { opts, soldOut } from './testHelpers'

const lineOf = (lines: ResolvedLine[], id: IngredientId) => lines.find((l) => l.id === id)!

describe('대체 재료 제안', () => {
  it('오트밀크 품절이면 우유를 먼저 제안한다', () => {
    const line = lineOf(resolveOrder(oatLatte, opts(), soldOut('oat_milk')), 'oat_milk')
    expect(line.state).toBe('suggest')
    expect(line.candidate?.id).toBe('milk')
  })

  it('우유도 품절이면 다음 순위 후보인 두유를 제안한다', () => {
    const line = lineOf(resolveOrder(oatLatte, opts(), soldOut('oat_milk', 'milk')), 'oat_milk')
    expect(line.state).toBe('suggest')
    expect(line.candidate?.id).toBe('soy_milk')
  })

  it('취소를 누르면 다음 후보인 두유를 제안한다', () => {
    const decisions = rejectSubstitution(noDecisions, 'oat_milk', 'milk')
    const line = lineOf(resolveOrder(oatLatte, opts(), soldOut('oat_milk'), decisions), 'oat_milk')
    expect(line.state).toBe('suggest')
    expect(line.candidate?.id).toBe('soy_milk')
  })

  it('두유까지 취소하면 남은 후보가 없어 제조 불가가 된다', () => {
    let decisions = rejectSubstitution(noDecisions, 'oat_milk', 'milk')
    decisions = rejectSubstitution(decisions, 'oat_milk', 'soy_milk')
    const lines = resolveOrder(oatLatte, opts(), soldOut('oat_milk'), decisions)
    expect(lineOf(lines, 'oat_milk').state).toBe('blocked')
    expect(statusOf(lines)).toBe('blocked')
  })

  it('후보가 모두 품절이면 제조 불가로 표시한다', () => {
    const lines = resolveOrder(oatLatte, opts(), soldOut('oat_milk', 'milk', 'soy_milk'))
    expect(lineOf(lines, 'oat_milk').state).toBe('blocked')
    expect(statusOf(lines)).toBe('blocked')
  })

  it('대체 불가로 지정된 재료가 품절이면 후보가 있어도 바로 제조 불가가 된다', () => {
    // 우유는 대체 후보(오트밀크, 두유)가 있지만 카푸치노에서는 대체 불가
    const lines = resolveOrder(cappuccino, opts({ temp: 'hot' }), soldOut('milk'))
    expect(lineOf(lines, 'milk').state).toBe('blocked')
    expect(lineOf(lines, 'milk').candidate).toBeUndefined()
  })

  it('대체를 적용하면 대체 재료와 그 양을 쓰고 대체 필요 상태가 된다', () => {
    const decisions = applySubstitution(noDecisions, 'oat_milk', 'milk')
    const lines = resolveOrder(oatLatte, opts(), soldOut('oat_milk'), decisions)
    expect(lineOf(lines, 'oat_milk')).toMatchObject({ state: 'substituted', use: 'milk', amount: 150 })
    expect(statusOf(lines)).toBe('substitute')
  })

  it('적용한 대체 재료도 품절이 되면 다음 후보를 다시 제안한다', () => {
    const decisions = applySubstitution(noDecisions, 'oat_milk', 'milk')
    const line = lineOf(resolveOrder(oatLatte, opts(), soldOut('oat_milk', 'milk'), decisions), 'oat_milk')
    expect(line.state).toBe('suggest')
    expect(line.candidate?.id).toBe('soy_milk')
  })

  it('원래 재료가 다시 들어오면 적용했던 대체는 쓰지 않는다', () => {
    const decisions = applySubstitution(noDecisions, 'oat_milk', 'milk')
    const lines = resolveOrder(oatLatte, opts(), soldOut(), decisions)
    expect(lineOf(lines, 'oat_milk')).toMatchObject({ state: 'ok', use: 'oat_milk' })
  })

  it('대체 후보가 없는 재료가 품절이면 제조 불가가 된다', () => {
    const lines = resolveOrder(oatLatte, opts(), soldOut('ice'))
    expect(lineOf(lines, 'ice').state).toBe('blocked')
  })
})
