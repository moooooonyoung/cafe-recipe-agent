import { describe, expect, it } from 'vitest'
import { americano } from '../data/menus/americano'
import { latte } from '../data/menus/latte'
import { lemonAde } from '../data/menus/lemon_ade'
import { matchaLatte } from '../data/menus/matcha_latte'
import { optionSummary } from './summary'
import { opts } from './testHelpers'

describe('옵션 요약', () => {
  it('온도 · 사이즈 · 샷 · 당도 순서로 요약한다', () => {
    const options = opts({ temp: 'ice', size: 'large', extraShots: 1, sweetness: 'less' })
    expect(optionSummary(latte, options)).toEqual(['ICE ❄️', '라지', '샷 +1', '당도 덜 달게'])
  })

  it('핫을 고르면 HOT 🔥으로 요약한다', () => {
    expect(optionSummary(americano, opts({ temp: 'hot' }))[0]).toBe('HOT 🔥')
  })

  it('샷 추가가 없으면 샷 항목이 빠진다', () => {
    expect(optionSummary(latte, opts({ extraShots: 0 }))).not.toContain('샷 +0')
    expect(optionSummary(latte, opts({ extraShots: 0 })).some((p) => p.startsWith('샷'))).toBe(false)
  })

  it('커피가 아닌 메뉴는 샷 항목이 없다', () => {
    expect(optionSummary(matchaLatte, opts({ extraShots: 2 })).some((p) => p.startsWith('샷'))).toBe(false)
  })

  it('당도 옵션이 없는 메뉴는 당도 항목이 빠진다', () => {
    expect(optionSummary(lemonAde, opts({ sweetness: 'more' }))).toEqual(['ICE ❄️', '레귤러'])
  })
})
