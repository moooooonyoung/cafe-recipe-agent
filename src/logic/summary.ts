import type { Menu, Options } from '../data/types'
import { strings } from '../i18n'

// 선택한 옵션 요약(가이드 화면 맨 위에 크게 보인다). 해당 없는 항목은 뺀다.
// 예: ['ICE ❄️', '라지', '샷 +1', '당도 덜 달게']
export function optionSummary(menu: Menu, options: Options): string[] {
  const parts: string[] = [strings.temp[options.temp], strings.size[options.size]]
  if (menu.category === 'coffee' && options.extraShots > 0) parts.push(strings.summary.shots(options.extraShots))
  if (menu.sweetener) parts.push(strings.summary.sweetness(strings.sweetness[options.sweetness]))
  return parts
}
