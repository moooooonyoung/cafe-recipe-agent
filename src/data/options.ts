import type { Options, Size, Sweetness } from './types'

// ⚠️ [매장 기준 확인 필요] 메뉴가 defaults로 덮어쓰지 않으면 이 값이 기본 옵션이다.
export const baseDefaults: Options = {
  temp: 'ice',
  size: 'regular',
  extraShots: 0,
  sweetness: 'normal',
}

// ⚠️ [매장 기준 확인 필요] 당도별 시럽 펌프 수
export const sweetnessPumps: Record<Size, Record<Sweetness, number>> = {
  regular: { none: 0, less: 1, normal: 2, more: 3 },
  large: { none: 0, less: 2, normal: 3, more: 4 },
}
