import { ingredients, type IngredientId, type IngredientInfo } from '../data/ingredients'
import { defaultStock, type Stock } from '../data/stock'
import { ingredientNames, strings } from '../i18n'

// 이름 기준 정렬(그 언어의 사전 순서: 한국어는 ㄱㄴㄷ순). 데이터의 순서는 건드리지 않고 새 배열을 돌려준다.
export function sortByName(
  ids: readonly IngredientId[],
  names: Record<IngredientId, string>,
  locale: string,
): IngredientId[] {
  const collator = new Intl.Collator(locale)
  return [...ids].sort((a, b) => collator.compare(names[a], names[b]))
}

// 재고 관리 화면에 보이는 재료 순서: 항상 있는 재료(물)는 빼고, 화면에 보이는 이름 순으로 정렬한다
export function stockListIds(): IngredientId[] {
  const visible = (Object.keys(ingredients) as IngredientId[]).filter((id) => {
    const info: IngredientInfo = ingredients[id]
    return !info.alwaysAvailable
  })
  return sortByName(visible, ingredientNames, strings.locale)
}

export function isAvailable(id: IngredientId, stock: Stock): boolean {
  const info: IngredientInfo = ingredients[id]
  return info.alwaysAvailable === true || stock[id]
}

export function toggleSoldOut(stock: Stock, id: IngredientId): Stock {
  return { ...stock, [id]: !stock[id] }
}

// 기본 재고 상태로 되돌린다(기본값 객체를 그대로 돌려주지 않고 복사한다)
export function resetStock(): Stock {
  return { ...defaultStock }
}
