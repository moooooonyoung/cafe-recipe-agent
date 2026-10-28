import type { IngredientId } from './ingredients'

// true = 있음, false = 품절
export type Stock = Record<IngredientId, boolean>

// 기본 재고. [초기화] 버튼을 누르면 이 상태로 돌아간다.
export const defaultStock: Stock = {
  espresso: true,
  milk: true,
  oat_milk: true,
  soy_milk: true,
  ice: true,
  water: true,
  sparkling_water: true,
  syrup: true,
  vanilla_syrup: true,
  chocolate_sauce: true,
  matcha_powder: true,
  strawberry_puree: true,
  lemon_syrup: true,
  grapefruit_syrup: true,
  chamomile_teabag: true,
}
