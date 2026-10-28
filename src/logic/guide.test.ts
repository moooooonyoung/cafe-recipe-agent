import { describe, expect, it } from 'vitest'
import { matchaLatte } from '../data/menus/matcha_latte'
import { oatLatte } from '../data/menus/oat_latte'
import { cappuccino } from '../data/menus/cappuccino'
import { blockedCause, currentStepIndex, guideStage, pendingSuggestion, toggleDone } from './guide'
import { blockedReason, statusOf } from './status'
import { applySubstitution, noDecisions, rejectSubstitution, resolveOrder, type Decisions } from './substitution'
import { opts, soldOut } from './testHelpers'

describe('대체 제안 흐름', () => {
  const oatOut = soldOut('oat_milk')
  const order = (decisions: Decisions) => resolveOrder(oatLatte, opts(), oatOut, decisions)

  it('오트밀크가 품절이면 우유로 대체할지 먼저 묻는다', () => {
    const lines = order(noDecisions)
    expect(guideStage(lines)).toBe('suggest')
    expect(pendingSuggestion(lines)).toMatchObject({ id: 'oat_milk', candidate: { id: 'milk' } })
  })

  it('대체 적용을 누르면 더 묻지 않고 대체한 재료로 만든다', () => {
    const lines = order(applySubstitution(noDecisions, 'oat_milk', 'milk'))
    expect(guideStage(lines)).toBe('cooking')
    expect(pendingSuggestion(lines)).toBeUndefined()
    expect(lines.find((l) => l.id === 'oat_milk')).toMatchObject({ state: 'substituted', use: 'milk' })
  })

  it('취소를 누르면 다음 후보인 두유를 묻는다', () => {
    const lines = order(rejectSubstitution(noDecisions, 'oat_milk', 'milk'))
    expect(guideStage(lines)).toBe('suggest')
    expect(pendingSuggestion(lines)?.candidate?.id).toBe('soy_milk')
  })

  it('후보를 모두 취소하면 제조 불가가 된다', () => {
    let decisions = rejectSubstitution(noDecisions, 'oat_milk', 'milk')
    decisions = rejectSubstitution(decisions, 'oat_milk', 'soy_milk')
    const lines = order(decisions)
    expect(guideStage(lines)).toBe('blocked')
    expect(pendingSuggestion(lines)).toBeUndefined()
  })

  it('후보가 이미 모두 품절이면 묻지 않고 바로 제조 불가다', () => {
    const lines = resolveOrder(oatLatte, opts(), soldOut('oat_milk', 'milk', 'soy_milk'))
    expect(guideStage(lines)).toBe('blocked')
  })

  it('대체할 재료가 여럿이면 하나씩 차례로 묻는다', () => {
    // 말차 라떼(아이스, 당도 보통): 우유와 시럽이 모두 품절
    const stock = soldOut('milk', 'syrup')
    const order = (d: Decisions) => resolveOrder(matchaLatte, opts({ sweetness: 'normal' }), stock, d)

    const first = order(noDecisions)
    expect(pendingSuggestion(first)).toMatchObject({ id: 'milk', candidate: { id: 'oat_milk' } })

    const second = order(applySubstitution(noDecisions, 'milk', 'oat_milk'))
    expect(guideStage(second)).toBe('suggest')
    expect(pendingSuggestion(second)).toMatchObject({ id: 'syrup', candidate: { id: 'vanilla_syrup' } })

    const done = order(applySubstitution(applySubstitution(noDecisions, 'milk', 'oat_milk'), 'syrup', 'vanilla_syrup'))
    expect(guideStage(done)).toBe('cooking')
    expect(statusOf(done)).toBe('substitute')
  })

  it('만들 수 없는 재료가 있으면 다른 재료의 대체를 묻지 않고 제조 불가를 보여준다', () => {
    // 아이스 오트 라떼: 얼음(대체 후보가 없다)과 오트밀크가 모두 품절
    const lines = resolveOrder(oatLatte, opts(), soldOut('ice', 'oat_milk'))
    expect(pendingSuggestion(lines)).toBeDefined()
    expect(guideStage(lines)).toBe('blocked')
  })

  it('재고가 모두 있으면 바로 단계 목록을 보여준다', () => {
    expect(guideStage(resolveOrder(oatLatte, opts(), soldOut()))).toBe('cooking')
  })
})

describe('제조 불가 패널의 이유', () => {
  const blockedLines = (stock: ReturnType<typeof soldOut>, decisions: Decisions = noDecisions) =>
    resolveOrder(oatLatte, opts(), stock, decisions)

  it('우유와 두유가 재고에 있는데 모두 취소해서 제조 불가가 되면 취소했다고 알려준다', () => {
    let decisions = rejectSubstitution(noDecisions, 'oat_milk', 'milk')
    decisions = rejectSubstitution(decisions, 'oat_milk', 'soy_milk')
    const lines = blockedLines(soldOut('oat_milk'), decisions)
    expect(guideStage(lines)).toBe('blocked')
    expect(blockedCause(lines)).toBe('cancelled')
  })

  it('일부 후보는 품절이고 남은 후보를 모두 취소해도 취소했다고 알려준다', () => {
    // 우유는 품절이라 처음부터 후보가 아니고, 남은 두유를 취소
    const lines = blockedLines(soldOut('oat_milk', 'milk'), rejectSubstitution(noDecisions, 'oat_milk', 'soy_milk'))
    expect(guideStage(lines)).toBe('blocked')
    expect(blockedCause(lines)).toBe('cancelled')
  })

  it('후보가 모두 품절이면 취소가 아니라 대체할 재료가 없다고 알려준다', () => {
    const lines = blockedLines(soldOut('oat_milk', 'milk', 'soy_milk'))
    expect(guideStage(lines)).toBe('blocked')
    expect(blockedCause(lines)).toBe('unavailable')
  })

  it('후보가 모두 품절이면 예전에 취소한 기록이 있어도 대체할 재료가 없다고 알려준다', () => {
    const lines = blockedLines(soldOut('oat_milk', 'milk', 'soy_milk'), rejectSubstitution(noDecisions, 'oat_milk', 'milk'))
    expect(blockedCause(lines)).toBe('unavailable')
  })

  it('대체 후보가 없는 재료(얼음)가 품절이면 대체할 재료가 없다고 알려준다', () => {
    expect(blockedCause(blockedLines(soldOut('ice')))).toBe('unavailable')
  })

  it('대체 불가로 지정된 재료가 품절이면 대체할 재료가 없다고 알려준다', () => {
    // 카푸치노의 우유는 오트밀크·두유 후보가 재고에 있어도 대체 불가
    const lines = resolveOrder(cappuccino, opts({ temp: 'hot' }), soldOut('milk'))
    expect(guideStage(lines)).toBe('blocked')
    expect(blockedCause(lines)).toBe('unavailable')
  })

  it('패널에 보여주는 첫 번째 막힌 재료를 기준으로 이유를 정한다', () => {
    // 얼음(후보 없음)이 먼저 막히고 오트밀크는 취소: 첫 번째 막힌 재료는 얼음
    const decisions = rejectSubstitution(rejectSubstitution(noDecisions, 'oat_milk', 'milk'), 'oat_milk', 'soy_milk')
    const lines = blockedLines(soldOut('ice', 'oat_milk'), decisions)
    expect(blockedReason(lines)).toBe('얼음 품절')
    expect(blockedCause(lines)).toBe('unavailable')
  })

  it('취소했다는 표시는 차례로 취소하는 도중에는 나오지 않는다', () => {
    // 우유만 취소한 상태: 아직 두유를 제안하는 중이라 제조 불가가 아니다
    const lines = blockedLines(soldOut('oat_milk'), rejectSubstitution(noDecisions, 'oat_milk', 'milk'))
    expect(guideStage(lines)).toBe('suggest')
    expect(lines.some((l) => l.cancelled)).toBe(false)
  })
})

describe('단계 체크', () => {
  it('처음에는 첫 단계가 현재 단계다', () => {
    expect(currentStepIndex(5, new Set())).toBe(0)
  })

  it('탭하면 체크되고 현재 단계가 다음으로 넘어간다', () => {
    const done = toggleDone(new Set(), 0)
    expect(done.has(0)).toBe(true)
    expect(currentStepIndex(5, done)).toBe(1)
  })

  it('다시 탭하면 체크가 해제되고 현재 단계가 돌아온다', () => {
    const once = toggleDone(new Set(), 0)
    const twice = toggleDone(once, 0)
    expect(twice.has(0)).toBe(false)
    expect(currentStepIndex(5, twice)).toBe(0)
  })

  it('앞 단계의 체크를 해제하면 현재 단계가 그 단계로 돌아간다', () => {
    let done: ReadonlySet<number> = new Set()
    for (const i of [0, 1, 2]) done = toggleDone(done, i)
    expect(currentStepIndex(5, done)).toBe(3)
    done = toggleDone(done, 1)
    expect(currentStepIndex(5, done)).toBe(1)
  })

  it('순서와 상관없이 탭해도 체크하지 않은 첫 단계가 현재 단계다', () => {
    const done = toggleDone(new Set(), 2)
    expect(currentStepIndex(5, done)).toBe(0)
  })

  it('마지막 단계까지 모두 체크하면 완료(-1)가 된다', () => {
    let done: ReadonlySet<number> = new Set()
    for (let i = 0; i < 5; i++) done = toggleDone(done, i)
    expect(currentStepIndex(5, done)).toBe(-1)
  })

  it('마지막 단계의 체크를 해제하면 완료가 풀린다', () => {
    let done: ReadonlySet<number> = new Set()
    for (let i = 0; i < 5; i++) done = toggleDone(done, i)
    expect(currentStepIndex(5, toggleDone(done, 4))).toBe(4)
  })

  it('체크해도 받은 집합은 바뀌지 않는다', () => {
    const before = new Set([0])
    toggleDone(before, 1)
    expect([...before]).toEqual([0])
  })
})
