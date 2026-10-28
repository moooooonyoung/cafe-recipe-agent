import type { IngredientId } from '../data/ingredients'
import { baseDefaults, sweetnessPumps } from '../data/options'
import type { Amount, Menu, Options, Qty, Sweetness } from '../data/types'

// 주문 하나에 들어가는 재료 한 줄
export type Line = { id: IngredientId; amount: Qty }

export const sweetnessLevels: readonly Sweetness[] = ['none', 'less', 'normal', 'more']

export function defaultOptions(menu: Menu): Options {
  return { ...baseDefaults, ...menu.defaults }
}

// 옵션에 맞는 재료와 양. 배율 계산 없이 레시피에 적힌 레귤러/라지 값을 그대로 쓰고,
// 샷 추가와 당도만 고정량을 더한다. '컵 선까지' 같은 양은 계산하지 않고 그대로 둔다.
export function orderLines(menu: Menu, options: Options): Line[] {
  const recipe = menu.recipes[options.temp]
  if (!recipe) throw new Error(`${menu.id}: ${options.temp} 레시피가 없다`)

  const lines: Line[] = (Object.entries(recipe) as [IngredientId, Amount][]).map(([id, amount]) => {
    const qty = amount[options.size]
    // 샷 추가는 에스프레소에만 더한다(에스프레소가 없는 메뉴에는 영향이 없다)
    if (id === 'espresso' && typeof qty === 'number') return { id, amount: qty + options.extraShots }
    return { id, amount: qty }
  })

  const pumps = sweetnessPumps[options.size][options.sweetness]
  if (menu.sweetener && pumps > 0) lines.push({ id: menu.sweetener, amount: pumps })

  return lines
}
