import { ingredients, type IngredientId } from '../data/ingredients'
import { defaultStock, type Stock } from '../data/stock'

export const STOCK_KEY = 'cafe-recipe-agent:stock'

// localStorage 전체가 아니라 쓰는 메서드만 받는다(테스트에서 가짜 저장소를 넘길 수 있다)
export type Store = Pick<Storage, 'getItem' | 'setItem'>

// 저장된 재고를 읽는다. 저장된 값이 없거나 깨졌으면 기본 재고를 돌려준다.
// 저장된 값 중 알 수 없는 재료나 true/false가 아닌 값은 무시하고 그 재료만 기본값을 쓴다.
export function loadStock(store: Store): Stock {
  const stock = { ...defaultStock }
  try {
    const saved: unknown = JSON.parse(store.getItem(STOCK_KEY) ?? 'null')
    if (typeof saved !== 'object' || saved === null) return stock
    for (const id of Object.keys(ingredients) as IngredientId[]) {
      const value = (saved as Record<string, unknown>)[id]
      if (typeof value === 'boolean') stock[id] = value
    }
  } catch {
    // JSON이 깨졌거나 저장소를 읽을 수 없다: 기본 재고로 시작한다
  }
  return stock
}

// 저장에 실패해도(저장 공간 부족, 시크릿 모드 등) 화면은 계속 쓸 수 있다
export function saveStock(store: Store, stock: Stock): void {
  try {
    store.setItem(STOCK_KEY, JSON.stringify(stock))
  } catch {
    // 이번 변경은 새로고침하면 사라진다
  }
}

// 브라우저의 localStorage. 접근 자체가 막혀 있으면 아무것도 저장하지 않는 저장소를 쓴다.
export function browserStore(): Store {
  try {
    return window.localStorage
  } catch {
    return { getItem: () => null, setItem: () => {} }
  }
}
