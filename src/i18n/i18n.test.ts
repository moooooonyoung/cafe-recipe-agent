import { describe, expect, it } from 'vitest'
import { strings } from '.'

describe('문구 분리', () => {
  it('기본 언어는 한국어이고 앱 제목이 있다', () => {
    expect(strings.appTitle).toBe('카페 레시피 가이드')
  })
})
