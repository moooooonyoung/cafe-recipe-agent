import type { IngredientId } from './ingredients'

export type Temperature = 'hot' | 'ice'
export type Size = 'regular' | 'large'
export type Sweetness = 'none' | 'less' | 'normal' | 'more'
export type ExtraShots = 0 | 1 | 2
export type Category = 'coffee' | 'non-coffee' | 'tea-ade'

// 손님이 고르는 옵션. 버튼으로 고르든 (나중의) 자유 입력으로 해석하든 이 모양으로 만들어 넘긴다.
export type Options = {
  temp: Temperature
  size: Size
  extraShots: ExtraShots // 커피 메뉴만 사용
  sweetness: Sweetness // 메뉴에 sweetener가 있을 때만 사용
}

// 재고·배율 계산 없이 컵에 맞춰 채우는 양. 숫자 대신 적는다(문구는 src/i18n/ko/ui.ts의 fillLevel).
export type FillLevel = 'to-line' | 'to-full'

// 숫자(단위는 재료마다 ingredients.ts) 또는 FillLevel
export type Qty = number | FillLevel

// 재료 양: 레귤러/라지를 각각 직접 적는다(배율 계산 없음).
export type Amount = { regular: Qty; large: Qty }

// 한 온도에서 쓰는 재료와 양. 샷 추가와 당도로 더해지는 양은 여기에 적지 않는다.
export type Recipe = Partial<Record<IngredientId, Amount>>

export type Menu = {
  id: string
  category: Category
  temps: readonly Temperature[]
  // 기본 옵션 중 baseDefaults(options.ts)와 다른 것만 적는다
  defaults?: Partial<Options>
  // 당도 옵션이 시럽 펌프로 더해지는 재료. 없으면 이 메뉴는 당도 옵션이 없다.
  // recipes에는 적지 않고, 펌프 수는 options.ts의 sweetnessPumps에서 가져온다.
  sweetener?: IngredientId
  recipes: { [T in Temperature]?: Recipe }
  // 품절이어도 다른 재료로 바꿀 수 없는 재료
  nonSubstitutable?: readonly IngredientId[]
}

// 대체 후보 하나. ratio는 원래 재료 1에 대해 필요한 대체 재료의 양(생략하면 1:1).
export type Substitute = { id: IngredientId; ratio?: number }
