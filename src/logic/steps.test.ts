import { describe, expect, it } from 'vitest'
import { americano } from '../data/menus/americano'
import { latte } from '../data/menus/latte'
import { oatLatte } from '../data/menus/oat_latte'
import { menuText } from '../i18n'
import type { MenuText } from '../i18n/types'
import { guideSteps } from './steps'
import { applySubstitution, noDecisions, resolveOrder } from './substitution'
import { opts, soldOut } from './testHelpers'

const stepsOf = (menu: typeof latte | typeof americano, options = opts()) =>
  guideSteps(menuText[menu.id], options, resolveOrder(menu, options, soldOut()))

describe('가이드 단계 문장', () => {
  it("당도가 없음이면 시럽 단계가 빠진다", () => {
    const steps = stepsOf(latte, opts({ sweetness: 'none' }))
    expect(steps).toHaveLength(4)
    expect(steps.some((s) => s.includes('시럽'))).toBe(false)
  })

  it('당도를 고르면 시럽 펌프 수가 들어간 단계가 나온다', () => {
    const steps = stepsOf(latte, opts({ sweetness: 'normal' }))
    expect(steps).toHaveLength(5)
    expect(steps).toContain('시럽 2펌프 넣고 저어 섞기')
  })

  it('라지 + 샷 추가 +1이면 단계 문장에 에스프레소 4샷이 나온다', () => {
    const steps = stepsOf(latte, opts({ size: 'large', extraShots: 1 }))
    expect(steps).toContain('에스프레소 4샷 추출해 샷잔에 받기')
  })

  it("'컵 선까지', '컵 가득' 같은 양은 계산하지 않고 그대로 표시된다", () => {
    expect(stepsOf(americano, opts({ size: 'large' }))).toContain('물 컵 선까지 붓기')
    expect(stepsOf(americano, opts({ temp: 'hot' }))).toContain('뜨거운 물 컵 가득 붓기')
  })

  it('아이스 라떼는 얼음 → 우유 → 에스프레소 순서로 나온다', () => {
    const steps = stepsOf(latte, opts())
    expect(steps[0]).toBe('컵에 얼음 150g 담기')
    expect(steps[1]).toBe('우유 150ml 붓기')
    expect(steps[2]).toBe('에스프레소 2샷 추출해 샷잔에 받기')
  })

  it('대체를 적용하면 단계 문장에도 대체 재료의 이름과 양이 쓰인다', () => {
    const options = opts()
    const decisions = applySubstitution(noDecisions, 'oat_milk', 'milk')
    const lines = resolveOrder(oatLatte, options, soldOut('oat_milk'), decisions)
    const steps = guideSteps(menuText.oat_latte, options, lines)
    expect(steps).toContain('우유 150ml 붓기')
    expect(steps.some((s) => s.includes('오트밀크'))).toBe(false)
  })

  it('라지 전용 단계가 있으면 라지일 때만 그것을 쓴다', () => {
    const text: MenuText = { name: '시험', steps: { ice: ['기본'] }, largeSteps: { ice: ['라지 전용'] } }
    expect(guideSteps(text, opts({ size: 'regular' }), [])).toEqual(['기본'])
    expect(guideSteps(text, opts({ size: 'large' }), [])).toEqual(['라지 전용'])
  })

  it('라지 전용 단계가 없으면 라지도 온도별 단계를 쓴다', () => {
    const text: MenuText = { name: '시험', steps: { ice: ['기본'] } }
    expect(guideSteps(text, opts({ size: 'large' }), [])).toEqual(['기본'])
  })
})
