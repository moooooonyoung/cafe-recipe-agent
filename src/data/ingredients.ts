// 재료 목록. id와 단위만 둔다(언어와 무관). 이름은 src/i18n/ko/ingredients.ts.
export type Unit = 'ml' | 'g' | 'shot' | 'pump' | 'ea'

export type IngredientInfo = {
  unit: Unit
  // true면 재고와 상관없이 항상 있는 재료(재고 화면에 보이지 않는다)
  alwaysAvailable?: boolean
}

export const ingredients = {
  espresso: { unit: 'shot' },
  milk: { unit: 'ml' },
  oat_milk: { unit: 'ml' },
  soy_milk: { unit: 'ml' },
  ice: { unit: 'g' },
  water: { unit: 'ml', alwaysAvailable: true },
  sparkling_water: { unit: 'ml' },
  syrup: { unit: 'pump' },
  vanilla_syrup: { unit: 'pump' },
  chocolate_sauce: { unit: 'pump' },
  matcha_powder: { unit: 'g' },
  strawberry_puree: { unit: 'g' },
  lemon_syrup: { unit: 'ml' },
  grapefruit_syrup: { unit: 'ml' },
  chamomile_teabag: { unit: 'ea' },
} as const satisfies Record<string, IngredientInfo>

export type IngredientId = keyof typeof ingredients
