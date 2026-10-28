import { describe, expect, it } from 'vitest'
import { ingredients, type IngredientId } from '../data/ingredients'
import { defaultStock } from '../data/stock'
import { ingredientNames } from '../i18n'
import { isAvailable, resetStock, sortByName, stockListIds, toggleSoldOut } from './stock'
import { soldOut } from './testHelpers'

describe('재고 목록 정렬', () => {
  it('재고 화면의 재료는 한국어 이름 기준 ㄱㄴㄷ순으로 나온다', () => {
    // ㄷ ㄸ ㄹ ㅁ ㅂ ㅅ ㅇ(얼음 < 에스프레소 < 오트밀크 < 우유) ㅈ ㅊ ㅋ ㅌ
    expect(stockListIds().map((id) => ingredientNames[id])).toEqual([
      '두유',
      '딸기 퓨레',
      '레몬청',
      '말차 가루',
      '바닐라 시럽',
      '시럽',
      '얼음',
      '에스프레소',
      '오트밀크',
      '우유',
      '자몽청',
      '초코 소스',
      '캐모마일 티백',
      '탄산수',
    ])
  })

  it('항상 있는 재료(물)는 재고 목록에 나오지 않는다', () => {
    expect(stockListIds()).not.toContain('water')
  })

  it('정렬해도 데이터의 재료 순서와 입력 배열은 바뀌지 않는다', () => {
    const before = Object.keys(ingredients)
    const input: IngredientId[] = ['milk', 'espresso', 'ice']
    sortByName(input, ingredientNames, 'ko')
    stockListIds()
    expect(input).toEqual(['milk', 'espresso', 'ice'])
    expect(Object.keys(ingredients)).toEqual(before)
  })

  it('이름이 바뀌면 그 언어의 정렬 기준을 따른다 (한국어 순서와 영어 순서가 다르다)', () => {
    const ids: IngredientId[] = ['espresso', 'milk', 'ice']
    const english = { ...ingredientNames, espresso: 'Espresso', milk: 'Milk', ice: 'Ice' }
    expect(sortByName(ids, ingredientNames, 'ko')).toEqual(['ice', 'espresso', 'milk']) // 얼음, 에스프레소, 우유
    expect(sortByName(ids, english, 'en')).toEqual(['espresso', 'ice', 'milk']) // Espresso, Ice, Milk
  })

  it('영어는 대소문자와 상관없이 알파벳 순으로 정렬한다', () => {
    const names = { ...ingredientNames, milk: 'milk', ice: 'Ice', espresso: 'espresso' }
    expect(sortByName(['milk', 'ice', 'espresso'], names, 'en')).toEqual(['espresso', 'ice', 'milk'])
  })
})

describe('재고', () => {
  it('재료를 누르면 품절이 되고 다시 누르면 있음으로 돌아온다', () => {
    const once = toggleSoldOut(defaultStock, 'milk')
    expect(once.milk).toBe(false)
    expect(toggleSoldOut(once, 'milk').milk).toBe(true)
  })

  it('재고를 바꿔도 기본 재고 객체는 바뀌지 않는다', () => {
    toggleSoldOut(defaultStock, 'milk')
    expect(defaultStock.milk).toBe(true)
  })

  it('재고 초기화를 하면 기본 재고 상태로 돌아간다', () => {
    const changed = toggleSoldOut(toggleSoldOut(defaultStock, 'milk'), 'ice')
    expect(changed).not.toEqual(defaultStock)
    expect(resetStock()).toEqual(defaultStock)
  })

  it('초기화한 재고를 바꿔도 기본 재고 객체는 바뀌지 않는다', () => {
    const reset = resetStock()
    expect(reset).not.toBe(defaultStock)
    reset.milk = false
    expect(defaultStock.milk).toBe(true)
  })

  it('항상 있는 재료(물)는 품절로 바꿔도 있는 것으로 본다', () => {
    expect(isAvailable('water', soldOut('water'))).toBe(true)
    expect(isAvailable('milk', soldOut('milk'))).toBe(false)
  })
})
