import { ingredients, type IngredientId, type IngredientInfo } from '../data/ingredients'
import { defaultStock, type Stock } from '../data/stock'

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
