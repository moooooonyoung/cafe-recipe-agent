import type { Stock } from '../data/stock'
import type { ExtraShots, Menu, Options, Size, Temperature } from '../data/types'
import { ingredientNames, strings } from '../i18n'
import { defaultOptions, sweetnessLevels } from './recipe'
import { resolveOrder, type ResolvedLine } from './substitution'

// ok: 정상 / substitute: 대체 필요(노란 배지) / blocked: 제조 불가
export type Status = 'ok' | 'substitute' | 'blocked'

export function statusOf(lines: readonly ResolvedLine[]): Status {
  if (lines.some((l) => l.state === 'blocked')) return 'blocked'
  if (lines.some((l) => l.state === 'suggest' || l.state === 'substituted')) return 'substitute'
  return 'ok'
}

// 만들 수 없는 이유: 처음 막힌 재료의 품절 사유. 예: '얼음 품절'
export function blockedReason(lines: readonly ResolvedLine[]): string {
  const blocked = lines.find((l) => l.state === 'blocked')
  return blocked ? strings.reason.soldOut(ingredientNames[blocked.id]) : ''
}

// 대체가 필요한 이유, 재료마다 한 줄. 예: ['오트밀크 → 우유 대체']
export function substituteReasons(lines: readonly ResolvedLine[]): string[] {
  return lines
    .filter((l) => l.state === 'suggest' || l.state === 'substituted')
    .map((l) => {
      const to = l.state === 'suggest' ? l.candidate!.id : l.use
      return strings.reason.substitute(ingredientNames[l.id], ingredientNames[to])
    })
}

// reasons: 카드 배지에 한 줄씩 보여줄 이유
export type MenuStatus = { status: Status; reasons?: string[] }

// 메뉴 카드 상태: 기본 옵션 기준. 기본 옵션으로는 못 만들어도 옵션 하나를 바꿔서
// 만들 수 있으면 '제조 불가' 대신 '대체 필요'로 보여주고, 이유에 바꿀 옵션을 적는다.
// 이유가 겹치면 모두 적는다. 예: ['얼음 품절 · HOT만 가능', '오트밀크 → 우유 대체']
export function menuStatus(menu: Menu, stock: Stock): MenuStatus {
  const base = defaultOptions(menu)
  const lines = resolveOrder(menu, base, stock)
  const status = statusOf(lines)
  if (status === 'ok') return { status }
  if (status === 'substitute') return { status, reasons: substituteReasons(lines) }

  const blocked = blockedReason(lines)
  const alt = workableAlternative(menu, base, stock)
  if (!alt) return { status: 'blocked', reasons: [blocked] }
  // 첫 줄: 막힌 이유와 바꿀 옵션. 바꾼 옵션으로 만들 때도 대체가 필요하면 그 이유를 다음 줄에 더한다.
  const reasons = [blocked + strings.reason.separator + alt.label]
  if (statusOf(alt.lines) === 'substitute') reasons.push(...substituteReasons(alt.lines))
  return { status: 'substitute', reasons }
}

// 옵션 화면을 열 때 미리 선택해 둘 옵션: 기본 옵션이고, 재고 때문에 막혀 있으면
// 메뉴 카드가 알려준 대로 만들 수 있는 옵션으로 바꾼다. 어느 옵션으로도 못 만들면 기본 옵션 그대로.
export function initialOptions(menu: Menu, stock: Stock): Options {
  const base = defaultOptions(menu)
  if (statusOf(resolveOrder(menu, base, stock)) !== 'blocked') return base
  return workableAlternative(menu, base, stock)?.options ?? base
}

// 옵션 화면이 열릴 때 기본 옵션을 자동으로 바꿨다면 그 안내 문장. 바꾸지 않았으면 undefined.
// 예: '얼음 품절로 HOT으로 바꿨어요'. 재료 대체와는 별개라서 '대체 필요'와 섞어 쓰지 않는다.
export function switchedNotice(menu: Menu, stock: Stock): string | undefined {
  const base = defaultOptions(menu)
  const start = initialOptions(menu, stock)
  const cause = blockedReason(resolveOrder(menu, base, stock))
  if (start.temp !== base.temp) return strings.options.switchedTemp[start.temp](cause)
  if (start.sweetness !== base.sweetness) {
    return strings.options.switchedSweetness(cause, strings.sweetness[start.sweetness])
  }
  return undefined
}

// 지금 고른 옵션으로 만들 때 실제로 필요한 재료 대체, 재료마다 한 줄. 필요 없으면 빈 배열.
export function neededSubstitutes(menu: Menu, options: Options, stock: Stock): string[] {
  return substituteReasons(resolveOrder(menu, options, stock))
}

// 기본 옵션이 막혔을 때 바꿔서 만들 수 있는 첫 번째 옵션(없으면 undefined)
function workableAlternative(menu: Menu, base: Options, stock: Stock) {
  for (const alt of alternatives(menu, base)) {
    const lines = resolveOrder(menu, alt.options, stock)
    if (statusOf(lines) !== 'blocked') return { ...alt, lines }
  }
  return undefined
}

// 재고 때문에 막히면 바꿔볼 만한 옵션: 온도, 당도(시럽이 필요한 메뉴만). 하나씩만 바꾼다.
function alternatives(menu: Menu, base: Options): { options: Options; label: string }[] {
  const list: { options: Options; label: string }[] = []
  for (const temp of menu.temps) {
    if (temp !== base.temp) list.push({ options: { ...base, temp }, label: strings.reason.onlyTemp[temp] })
  }
  if (menu.sweetener) {
    for (const sweetness of sweetnessLevels) {
      if (sweetness === base.sweetness) continue
      const label = strings.reason.onlySweetness(strings.sweetness[sweetness])
      list.push({ options: { ...base, sweetness }, label })
    }
  }
  return list
}

// 메뉴 카드에서 흐리게 보여줄 온도: 기본 옵션 기준으로 만들 수 없는 온도.
// 어느 온도로도 못 만들면(예: 원두 품절) 원인이 온도가 아니므로 표시하지 않는다.
export function unavailableTemps(menu: Menu, stock: Stock): Temperature[] {
  const choices = choicesFor(menu, defaultOptions(menu), stock, 'temp', menu.temps)
  const blocked = choices.filter((c) => c.disabled).map((c) => c.value)
  return blocked.length === choices.length ? [] : blocked
}

const tempOrder: readonly Temperature[] = ['ice', 'hot']

export type Choice<V> = { value: V; disabled: boolean; reason?: string }

export type OptionChoices = {
  temp: Choice<Temperature>[]
  size: Choice<Size>[]
  extraShots: Choice<ExtraShots>[] // 커피 메뉴만(아니면 빈 배열)
  sweetness: Choice<Options['sweetness']>[] // 당도 옵션이 있는 메뉴만(아니면 빈 배열)
}

function choicesFor<K extends keyof Options>(
  menu: Menu,
  options: Options,
  stock: Stock,
  key: K,
  values: readonly Options[K][],
): Choice<Options[K]>[] {
  return values.map((value) => {
    const lines = resolveOrder(menu, { ...options, [key]: value }, stock)
    const disabled = statusOf(lines) === 'blocked'
    return disabled ? { value, disabled, reason: blockedReason(lines) } : { value, disabled }
  })
}

// 옵션 화면용: 지금 선택한 다른 옵션은 그대로 두고, 선택지마다 만들 수 있는지 계산한다.
// 만들 수 없게 되는 선택지는 disabled와 사유(예: '얼음 품절')를 돌려준다.
export function optionChoices(menu: Menu, options: Options, stock: Stock): OptionChoices {
  // 메뉴 카드와 같이 아이스, 핫 순서로 보여준다
  const temps = tempOrder.filter((temp) => menu.temps.includes(temp))
  return {
    temp: choicesFor(menu, options, stock, 'temp', temps),
    size: choicesFor(menu, options, stock, 'size', ['regular', 'large']),
    extraShots: menu.category === 'coffee' ? choicesFor(menu, options, stock, 'extraShots', [0, 1, 2]) : [],
    sweetness: menu.sweetener ? choicesFor(menu, options, stock, 'sweetness', sweetnessLevels) : [],
  }
}
