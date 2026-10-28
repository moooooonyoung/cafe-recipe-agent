import type { IngredientId } from '../data/ingredients'
import { defaultStock, type Stock } from '../data/stock'
import type { Options } from '../data/types'

// 테스트용: 기본 재고에서 주어진 재료만 품절로 만든다
export function soldOut(...ids: IngredientId[]): Stock {
  const stock = { ...defaultStock }
  for (const id of ids) stock[id] = false
  return stock
}

// 테스트용: 옵션 객체를 짧게 만든다(기본은 아이스·레귤러·샷 없음·당도 없음)
export function opts(overrides: Partial<Options> = {}): Options {
  return { temp: 'ice', size: 'regular', extraShots: 0, sweetness: 'none', ...overrides }
}
