import { describe, expect, it } from 'vitest'
import { americano } from '../data/menus/americano'
import { cappuccino } from '../data/menus/cappuccino'
import { latte } from '../data/menus/latte'
import { lemonAde } from '../data/menus/lemon_ade'
import { matchaLatte } from '../data/menus/matcha_latte'
import type { IngredientId } from '../data/ingredients'
import { defaultOptions, orderLines, type Line } from './recipe'
import { opts } from './testHelpers'

const amountOf = (lines: Line[], id: IngredientId) => lines.find((l) => l.id === id)?.amount

describe('옵션에 따른 재료 양', () => {
  it('라지를 고르면 라지 재료 양이 그대로 나온다 (배율 계산이 아니다)', () => {
    const lines = orderLines(latte, opts({ size: 'large' }))
    expect(amountOf(lines, 'espresso')).toBe(3)
    expect(amountOf(lines, 'milk')).toBe(210)
    expect(amountOf(lines, 'ice')).toBe(200)
  })

  it('레귤러를 고르면 레귤러 재료 양이 나온다', () => {
    const lines = orderLines(latte, opts({ size: 'regular' }))
    expect(amountOf(lines, 'espresso')).toBe(2)
    expect(amountOf(lines, 'milk')).toBe(150)
    expect(amountOf(lines, 'ice')).toBe(150)
  })

  it('샷 +1이면 에스프레소 한 샷이 더해진다', () => {
    expect(amountOf(orderLines(latte, opts({ extraShots: 1 })), 'espresso')).toBe(3)
    expect(amountOf(orderLines(latte, opts({ extraShots: 2 })), 'espresso')).toBe(4)
  })

  it('라지 + 샷 추가 +1이면 에스프레소가 4샷이 된다', () => {
    const lines = orderLines(latte, opts({ size: 'large', extraShots: 1 }))
    expect(amountOf(lines, 'espresso')).toBe(4)
  })

  it('샷 추가는 에스프레소가 없는 메뉴의 재료를 바꾸지 않는다', () => {
    expect(orderLines(matchaLatte, opts({ extraShots: 2 }))).toEqual(orderLines(matchaLatte, opts({ extraShots: 0 })))
  })

  it('당도를 고르면 시럽이 당도표의 펌프 수만큼 더해진다', () => {
    expect(amountOf(orderLines(matchaLatte, opts({ sweetness: 'normal' })), 'syrup')).toBe(2)
    expect(amountOf(orderLines(matchaLatte, opts({ size: 'large', sweetness: 'normal' })), 'syrup')).toBe(3)
    expect(amountOf(orderLines(matchaLatte, opts({ sweetness: 'more' })), 'syrup')).toBe(3)
  })

  it('당도가 없음이면 시럽이 재료에 들어가지 않는다', () => {
    const lines = orderLines(matchaLatte, opts({ sweetness: 'none' }))
    expect(lines.map((l) => l.id)).not.toContain('syrup')
  })

  it('당도 옵션이 없는 메뉴는 당도를 골라도 시럽이 들어가지 않는다', () => {
    const lines = orderLines(lemonAde, opts({ sweetness: 'more' }))
    expect(lines.map((l) => l.id)).not.toContain('syrup')
  })

  it("'컵 선까지' 같은 양은 계산하지 않고 그대로 둔다", () => {
    const lines = orderLines(americano, opts({ size: 'large', extraShots: 1 }))
    expect(amountOf(lines, 'water')).toBe('to-line')
    expect(amountOf(lines, 'ice')).toBe(200)
    expect(amountOf(lines, 'espresso')).toBe(4)
    expect(amountOf(orderLines(americano, opts({ temp: 'hot' })), 'water')).toBe('to-full')
  })

  it('핫을 고르면 얼음이 재료에 없고, 아이스를 고르면 얼음이 있다', () => {
    expect(orderLines(latte, opts({ temp: 'hot' })).map((l) => l.id)).not.toContain('ice')
    expect(orderLines(latte, opts({ temp: 'ice' })).map((l) => l.id)).toContain('ice')
  })

  it('메뉴가 팔지 않는 온도로는 재료를 계산할 수 없다', () => {
    expect(() => orderLines(cappuccino, opts({ temp: 'ice' }))).toThrow()
  })

  it('기본 옵션은 메뉴가 덮어쓴 값을 따르고 나머지는 공통 기본값이다', () => {
    expect(defaultOptions(cappuccino)).toEqual({ temp: 'hot', size: 'regular', extraShots: 0, sweetness: 'none' })
    expect(defaultOptions(matchaLatte)).toEqual({ temp: 'ice', size: 'regular', extraShots: 0, sweetness: 'normal' })
  })
})
