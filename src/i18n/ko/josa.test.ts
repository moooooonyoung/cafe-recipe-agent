import { describe, expect, it } from 'vitest'
import { ingredientNames } from './ingredients'
import { euro } from './josa'

describe("조사 '(으)로'", () => {
  it('받침이 없으면 로를 붙인다', () => {
    expect(euro('우유')).toBe('우유로')
    expect(euro('두유')).toBe('두유로')
    expect(euro('오트밀크')).toBe('오트밀크로')
  })

  it('ㄹ 받침이면 로를 붙인다', () => {
    expect(euro('물')).toBe('물로')
  })

  it('그 밖의 받침이면 으로를 붙인다', () => {
    expect(euro('바닐라 시럽')).toBe('바닐라 시럽으로')
    expect(euro('얼음')).toBe('얼음으로')
  })

  it('한글이 아닌 글자로 끝나면 (으)로로 둔다', () => {
    expect(euro('HOT')).toBe('HOT(으)로')
  })

  it('모든 재료 이름에 어색하지 않은 조사가 붙는다 (한글 이름은 (으)로가 남지 않는다)', () => {
    for (const name of Object.values(ingredientNames)) expect(euro(name), name).not.toContain('(으)로')
  })
})
