import { describe, expect, it } from 'vitest'
import { menus } from '../data/menus'
import type { Stock } from '../data/stock'
import type { Menu } from '../data/types'
import { americano } from '../data/menus/americano'
import { cappuccino } from '../data/menus/cappuccino'
import { grapefruitAde } from '../data/menus/grapefruit_ade'
import { latte } from '../data/menus/latte'
import { lemonAde } from '../data/menus/lemon_ade'
import { matchaLatte } from '../data/menus/matcha_latte'
import { oatLatte } from '../data/menus/oat_latte'
import { strawberryLatte } from '../data/menus/strawberry_latte'
import { defaultOptions } from './recipe'
import {
  initialOptions,
  menuStatus,
  neededSubstitutes,
  optionChoices,
  statusOf,
  switchedNotice,
  unavailableTemps,
} from './status'
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
      reasons: ['오트밀크 → 우유 대체'],
    })
  })

  it("시럽 품절이면 바닐라 시럽 대체로 '대체 필요' 상태가 된다", () => {
    const lines = resolveOrder(americano, opts({ sweetness: 'normal' }), soldOut('syrup'))
    expect(lines.find((l) => l.id === 'syrup')).toMatchObject({ state: 'suggest', candidate: { id: 'vanilla_syrup' } })
    expect(statusOf(lines)).toBe('substitute')
    // 기본 당도가 '보통'인 말차 라떼는 카드에서도 같다
    expect(menuStatus(matchaLatte, soldOut('syrup'))).toEqual({
      status: 'substitute',
      reasons: ['시럽 → 바닐라 시럽 대체'],
    })
  })

  it('시럽과 바닐라 시럽이 모두 품절이면 당도 보통은 막히고 당도 없음만 가능하다', () => {
    const stock = soldOut('syrup', 'vanilla_syrup')
    expect(menuStatus(matchaLatte, stock)).toEqual({
      status: 'substitute',
      reasons: ['시럽 품절 · 당도 없음만 가능'],
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
    expect(menuStatus(lemonAde, soldOut('sparkling_water'))).toEqual({ status: 'blocked', reasons: ['탄산수 품절'] })
    expect(menuStatus(grapefruitAde, soldOut('sparkling_water'))).toEqual({ status: 'blocked', reasons: ['탄산수 품절'] })
  })

  it('물은 항상 있는 재료라 품절로 바꿔도 아메리카노를 만들 수 있다', () => {
    expect(menuStatus(americano, soldOut('water'))).toEqual({ status: 'ok' })
  })

  it('원두가 품절이면 원두가 필요한 모든 메뉴가 제조 불가가 된다', () => {
    const stock = soldOut('espresso')
    const coffee = menus.filter((m) => m.category === 'coffee')
    expect(coffee.length).toBeGreaterThan(0)
    for (const menu of coffee) {
      expect(menuStatus(menu, stock), menu.id).toEqual({ status: 'blocked', reasons: ['에스프레소 품절'] })
    }
    // 커피가 아닌 메뉴는 영향이 없다
    expect(menuStatus(matchaLatte, stock)).toEqual({ status: 'ok' })
  })

  it('대체 불가로 지정된 재료가 품절이면 카드가 바로 제조 불가가 된다', () => {
    expect(menuStatus(cappuccino, soldOut('milk'))).toEqual({ status: 'blocked', reasons: ['우유 품절'] })
  })

  it("얼음이 품절이면 아이스가 기본인 메뉴 카드는 '얼음 품절 · HOT만 가능'인 대체 필요가 된다", () => {
    expect(menuStatus(latte, soldOut('ice'))).toEqual({
      status: 'substitute',
      reasons: ['얼음 품절 · HOT만 가능'],
    })
  })

  it('이유가 겹치면 카드 배지에 한 줄씩 모두 보여준다 (얼음 품절 + 오트밀크 품절)', () => {
    expect(menuStatus(oatLatte, soldOut('ice', 'oat_milk'))).toEqual({
      status: 'substitute',
      reasons: ['얼음 품절 · HOT만 가능', '오트밀크 → 우유 대체'],
    })
  })

  it('겹친 이유의 대체 재료는 다음 순위 후보를 따른다 (우유도 품절이면 두유)', () => {
    expect(menuStatus(oatLatte, soldOut('ice', 'oat_milk', 'milk')).reasons).toEqual([
      '얼음 품절 · HOT만 가능',
      '오트밀크 → 두유 대체',
    ])
  })

  it('얼음 품절과 시럽 품절이 겹치면 시럽 대체 이유도 보여준다', () => {
    // 말차 라떼는 기본이 아이스 + 당도 보통이라 시럽이 필요하다
    expect(menuStatus(matchaLatte, soldOut('ice', 'syrup')).reasons).toEqual([
      '얼음 품절 · HOT만 가능',
      '시럽 → 바닐라 시럽 대체',
    ])
  })

  it('기본 옵션에서 대체할 재료가 여럿이면 한 줄씩 나온다', () => {
    // 말차 라떼: 기본 아이스 + 당도 보통. 우유와 시럽이 모두 품절이면 둘 다 대체가 필요하다
    expect(menuStatus(matchaLatte, soldOut('milk', 'syrup')).reasons).toEqual([
      '우유 → 오트밀크 대체',
      '시럽 → 바닐라 시럽 대체',
    ])
  })

  it('바꾼 옵션으로 만들 때 대체가 필요 없으면 대체 이유를 붙이지 않는다', () => {
    expect(menuStatus(oatLatte, soldOut('ice')).reasons).toEqual(['얼음 품절 · HOT만 가능'])
  })

  it('겹친 이유 때문에 어느 옵션으로도 못 만들면 처음 막힌 이유만 보여준다', () => {
    expect(menuStatus(oatLatte, soldOut('ice', 'espresso'))).toEqual({ status: 'blocked', reasons: ['얼음 품절'] })
  })

  it('얼음이 품절이어도 핫만 파는 메뉴는 정상이다', () => {
    expect(menuStatus(cappuccino, soldOut('ice'))).toEqual({ status: 'ok' })
  })

  it('얼음이 품절이고 아이스만 파는 메뉴는 제조 불가다', () => {
    expect(menuStatus(strawberryLatte, soldOut('ice'))).toEqual({ status: 'blocked', reasons: ['얼음 품절'] })
  })

  it('재고를 바꾸면 카드 상태도 다시 계산된다', () => {
    expect(menuStatus(oatLatte, soldOut()).status).toBe('ok')
    expect(menuStatus(oatLatte, soldOut('oat_milk')).status).toBe('substitute')
    expect(menuStatus(oatLatte, soldOut('oat_milk', 'milk', 'soy_milk')).status).toBe('blocked')
    expect(menuStatus(oatLatte, soldOut()).status).toBe('ok')
  })
})

describe('메뉴 카드의 불가능한 온도', () => {
  it('얼음이 품절이면 아이스가 안 되는 온도로 나온다', () => {
    expect(unavailableTemps(latte, soldOut('ice'))).toEqual(['ice'])
    expect(unavailableTemps(oatLatte, soldOut('ice'))).toEqual(['ice'])
  })

  it('재고가 모두 있으면 안 되는 온도가 없다', () => {
    for (const menu of menus) expect(unavailableTemps(menu, soldOut()), menu.id).toEqual([])
  })

  it('원두가 품절이면 어느 온도도 안 되므로 온도를 표시하지 않는다', () => {
    expect(unavailableTemps(latte, soldOut('espresso'))).toEqual([])
  })

  it('아이스만 파는 메뉴는 얼음이 품절이어도 온도를 표시하지 않는다 (카드의 제조 불가 배지가 알려준다)', () => {
    expect(unavailableTemps(strawberryLatte, soldOut('ice'))).toEqual([])
  })

  it('핫만 파는 메뉴는 얼음이 품절이어도 영향이 없다', () => {
    expect(unavailableTemps(cappuccino, soldOut('ice'))).toEqual([])
  })
})

describe('옵션 화면을 열 때 미리 선택되는 옵션', () => {
  it('재고가 모두 있으면 메뉴의 기본 옵션이 선택된다', () => {
    for (const menu of menus) expect(initialOptions(menu, soldOut()), menu.id).toEqual(defaultOptions(menu))
  })

  it('얼음이 품절이면 아이스가 기본인 메뉴는 핫이 선택된다', () => {
    expect(initialOptions(latte, soldOut('ice'))).toEqual({ ...defaultOptions(latte), temp: 'hot' })
  })

  it('시럽과 바닐라 시럽이 모두 품절이면 당도 없음이 선택된다', () => {
    expect(initialOptions(matchaLatte, soldOut('syrup', 'vanilla_syrup'))).toEqual({
      ...defaultOptions(matchaLatte),
      sweetness: 'none',
    })
  })

  it('기본 옵션이 대체만 하면 되는 상태면 기본 옵션을 그대로 선택한다', () => {
    expect(initialOptions(oatLatte, soldOut('oat_milk'))).toEqual(defaultOptions(oatLatte))
  })

  it('어느 옵션으로도 못 만들면 기본 옵션을 그대로 돌려준다', () => {
    expect(initialOptions(latte, soldOut('espresso'))).toEqual(defaultOptions(latte))
    expect(initialOptions(strawberryLatte, soldOut('ice'))).toEqual(defaultOptions(strawberryLatte))
  })

  it('카드가 제조 불가가 아닌 메뉴는 열었을 때 선택된 옵션으로 항상 만들 수 있다', () => {
    const stocks = [
      soldOut(),
      soldOut('ice'),
      soldOut('espresso'),
      soldOut('oat_milk'),
      soldOut('ice', 'oat_milk'),
      soldOut('syrup', 'vanilla_syrup'),
      soldOut('ice', 'syrup', 'vanilla_syrup'),
      soldOut('milk'),
      soldOut('sparkling_water'),
      soldOut('milk', 'oat_milk', 'soy_milk'),
    ]
    for (const stock of stocks) {
      for (const menu of menus) {
        const lines = resolveOrder(menu, initialOptions(menu, stock), stock)
        const cardBlocked = menuStatus(menu, stock).status === 'blocked'
        expect(statusOf(lines) === 'blocked', menu.id).toBe(cardBlocked)
      }
    }
  })
})

describe('옵션 화면 위 안내와 대체 필요', () => {
  const substitutesAtStart = (menu: Menu, stock: Stock) => neededSubstitutes(menu, initialOptions(menu, stock), stock)

  it('재고가 모두 있으면 안내도 대체 필요도 없다', () => {
    for (const menu of menus) {
      expect(switchedNotice(menu, soldOut()), menu.id).toBeUndefined()
      expect(substitutesAtStart(menu, soldOut()), menu.id).toEqual([])
    }
  })

  it('얼음 품절로 핫으로 자동 전환되면 안내만 나오고 대체 필요는 나오지 않는다', () => {
    const stock = soldOut('ice')
    expect(switchedNotice(latte, stock)).toBe('얼음 품절로 HOT으로 바꿨어요')
    expect(substitutesAtStart(latte, stock)).toEqual([])
  })

  it('재료만 대체하면 되는 경우에는 대체 필요만 나오고 안내는 나오지 않는다', () => {
    const stock = soldOut('oat_milk')
    expect(switchedNotice(oatLatte, stock)).toBeUndefined()
    expect(substitutesAtStart(oatLatte, stock)).toEqual(['오트밀크 → 우유 대체'])
  })

  it('자동 전환도 되고 재료 대체도 필요하면 둘 다 따로 나온다', () => {
    const stock = soldOut('ice', 'oat_milk')
    expect(switchedNotice(oatLatte, stock)).toBe('얼음 품절로 HOT으로 바꿨어요')
    expect(substitutesAtStart(oatLatte, stock)).toEqual(['오트밀크 → 우유 대체'])
  })

  it('당도가 자동으로 바뀌면 그 안내가 나오고 대체 필요는 나오지 않는다', () => {
    const stock = soldOut('syrup', 'vanilla_syrup')
    expect(switchedNotice(matchaLatte, stock)).toBe('시럽 품절로 당도를 바꿨어요 (없음)')
    expect(substitutesAtStart(matchaLatte, stock)).toEqual([])
  })

  it('어느 옵션으로도 못 만들면 자동 전환 안내가 없다', () => {
    expect(switchedNotice(latte, soldOut('espresso'))).toBeUndefined()
  })

  it('대체 필요는 지금 고른 옵션을 따라 달라진다', () => {
    // 시럽만 품절: 당도 보통이면 바닐라 시럽 대체가 필요하고, 당도 없음이면 필요 없다
    const stock = soldOut('syrup')
    expect(neededSubstitutes(matchaLatte, opts({ sweetness: 'normal' }), stock)).toEqual(['시럽 → 바닐라 시럽 대체'])
    expect(neededSubstitutes(matchaLatte, opts({ sweetness: 'none' }), stock)).toEqual([])
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

  it('온도 선택지는 메뉴 카드와 같이 아이스, 핫 순서로 나온다', () => {
    expect(optionChoices(latte, opts(), soldOut()).temp.map((c) => c.value)).toEqual(['ice', 'hot'])
  })

  it('핫만 파는 메뉴는 온도 선택지가 핫 하나뿐이다', () => {
    expect(optionChoices(cappuccino, opts({ temp: 'hot' }), soldOut()).temp.map((c) => c.value)).toEqual(['hot'])
  })
})
