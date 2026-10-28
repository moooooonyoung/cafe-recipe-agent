import { describe, expect, it } from 'vitest'
import { menus } from '../data/menus'
import { americano } from '../data/menus/americano'
import { cappuccino } from '../data/menus/cappuccino'
import { grapefruitAde } from '../data/menus/grapefruit_ade'
import { latte } from '../data/menus/latte'
import { lemonAde } from '../data/menus/lemon_ade'
import { matchaLatte } from '../data/menus/matcha_latte'
import { oatLatte } from '../data/menus/oat_latte'
import { strawberryLatte } from '../data/menus/strawberry_latte'
import { menuStatus, optionChoices, statusOf } from './status'
import { resolveOrder } from './substitution'
import { opts, soldOut } from './testHelpers'

describe('메뉴 카드 상태', () => {
  it('재고가 모두 있으면 모든 메뉴가 정상이다', () => {
    for (const menu of menus) {
      expect(menuStatus(menu, soldOut()), menu.id).toEqual({ status: 'ok' })
    }
  })

  it('오트밀크 품절이면 오트 라떼 카드가 대체 필요이고 이유에 대체 재료가 나온다', () => {
    expect(menuStatus(oatLatte, soldOut('oat_milk'))).toEqual({
      status: 'substitute',
      reason: '오트밀크 → 우유 대체',
    })
  })

  it("시럽 품절이면 바닐라 시럽 대체로 '대체 필요' 상태가 된다", () => {
    const lines = resolveOrder(americano, opts({ sweetness: 'normal' }), soldOut('syrup'))
    expect(lines.find((l) => l.id === 'syrup')).toMatchObject({ state: 'suggest', candidate: { id: 'vanilla_syrup' } })
    expect(statusOf(lines)).toBe('substitute')
    // 기본 당도가 '보통'인 말차 라떼는 카드에서도 같다
    expect(menuStatus(matchaLatte, soldOut('syrup'))).toEqual({
      status: 'substitute',
      reason: '시럽 → 바닐라 시럽 대체',
    })
  })

  it('시럽과 바닐라 시럽이 모두 품절이면 당도 보통은 막히고 당도 없음만 가능하다', () => {
    const stock = soldOut('syrup', 'vanilla_syrup')
    expect(menuStatus(matchaLatte, stock)).toEqual({
      status: 'substitute',
      reason: '시럽 품절 · 당도 없음만 가능',
    })
    const sweetness = optionChoices(matchaLatte, opts({ sweetness: 'none' }), stock).sweetness
    expect(sweetness.find((c) => c.value === 'none')?.disabled).toBe(false)
    expect(sweetness.find((c) => c.value === 'normal')).toMatchObject({ disabled: true, reason: '시럽 품절' })
  })

  it('당도가 없음이면 시럽이 품절이어도 만들 수 있다', () => {
    const stock = soldOut('syrup', 'vanilla_syrup')
    expect(statusOf(resolveOrder(americano, opts({ sweetness: 'none' }), stock))).toBe('ok')
    // 기본 당도가 '없음'인 아메리카노 카드도 정상
    expect(menuStatus(americano, stock)).toEqual({ status: 'ok' })
  })

  it('탄산수 품절이면 레몬에이드는 제조 불가다 (대체 후보가 없다)', () => {
    expect(menuStatus(lemonAde, soldOut('sparkling_water'))).toEqual({ status: 'blocked', reason: '탄산수 품절' })
    expect(menuStatus(grapefruitAde, soldOut('sparkling_water'))).toEqual({ status: 'blocked', reason: '탄산수 품절' })
  })

  it('물은 항상 있는 재료라 품절로 바꿔도 아메리카노를 만들 수 있다', () => {
    expect(menuStatus(americano, soldOut('water'))).toEqual({ status: 'ok' })
  })

  it('원두가 품절이면 원두가 필요한 모든 메뉴가 제조 불가가 된다', () => {
    const stock = soldOut('espresso')
    const coffee = menus.filter((m) => m.category === 'coffee')
    expect(coffee.length).toBeGreaterThan(0)
    for (const menu of coffee) {
      expect(menuStatus(menu, stock), menu.id).toEqual({ status: 'blocked', reason: '에스프레소 품절' })
    }
    // 커피가 아닌 메뉴는 영향이 없다
    expect(menuStatus(matchaLatte, stock)).toEqual({ status: 'ok' })
  })

  it('대체 불가로 지정된 재료가 품절이면 카드가 바로 제조 불가가 된다', () => {
    expect(menuStatus(cappuccino, soldOut('milk'))).toEqual({ status: 'blocked', reason: '우유 품절' })
  })

  it("얼음이 품절이면 아이스가 기본인 메뉴 카드는 '얼음 품절 · HOT만 가능'인 대체 필요가 된다", () => {
    expect(menuStatus(latte, soldOut('ice'))).toEqual({
      status: 'substitute',
      reason: '얼음 품절 · HOT만 가능',
    })
  })

  it('얼음이 품절이어도 핫만 파는 메뉴는 정상이다', () => {
    expect(menuStatus(cappuccino, soldOut('ice'))).toEqual({ status: 'ok' })
  })

  it('얼음이 품절이고 아이스만 파는 메뉴는 제조 불가다', () => {
    expect(menuStatus(strawberryLatte, soldOut('ice'))).toEqual({ status: 'blocked', reason: '얼음 품절' })
  })

  it('재고를 바꾸면 카드 상태도 다시 계산된다', () => {
    expect(menuStatus(oatLatte, soldOut()).status).toBe('ok')
    expect(menuStatus(oatLatte, soldOut('oat_milk')).status).toBe('substitute')
    expect(menuStatus(oatLatte, soldOut('oat_milk', 'milk', 'soy_milk')).status).toBe('blocked')
    expect(menuStatus(oatLatte, soldOut()).status).toBe('ok')
  })
})

describe('옵션 화면 선택지', () => {
  it('얼음이 품절이면 아이스 옵션이 비활성화되고 사유가 나오며 핫은 고를 수 있다', () => {
    const { temp } = optionChoices(latte, opts(), soldOut('ice'))
    expect(temp.find((c) => c.value === 'ice')).toMatchObject({ disabled: true, reason: '얼음 품절' })
    expect(temp.find((c) => c.value === 'hot')).toMatchObject({ disabled: false })
  })

  it('재고가 모두 있으면 선택지가 모두 활성화되어 있다', () => {
    const choices = optionChoices(latte, opts(), soldOut())
    for (const list of [choices.temp, choices.size, choices.extraShots, choices.sweetness]) {
      expect(list.every((c) => !c.disabled)).toBe(true)
    }
  })

  it('샷 추가는 커피 메뉴에만, 당도는 시럽을 쓰는 메뉴에만 선택지가 있다', () => {
    expect(optionChoices(latte, opts(), soldOut()).extraShots.map((c) => c.value)).toEqual([0, 1, 2])
    expect(optionChoices(matchaLatte, opts(), soldOut()).extraShots).toEqual([])
    expect(optionChoices(lemonAde, opts(), soldOut()).sweetness).toEqual([])
  })

  it('원두가 품절이면 샷 추가 선택지도 모두 막힌다', () => {
    const { extraShots } = optionChoices(latte, opts(), soldOut('espresso'))
    expect(extraShots.every((c) => c.disabled && c.reason === '에스프레소 품절')).toBe(true)
  })

  it('핫만 파는 메뉴는 온도 선택지가 핫 하나뿐이다', () => {
    expect(optionChoices(cappuccino, opts({ temp: 'hot' }), soldOut()).temp.map((c) => c.value)).toEqual(['hot'])
  })
})
